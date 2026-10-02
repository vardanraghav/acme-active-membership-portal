/**
 * ============================================================================
 * ACME ACTIVE MEMBERSHIP PORTAL - GOOGLE APPS SCRIPT BACKEND
 * Society: ACME Society, Dept of EEE, Galgotias University
 * ============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (create a new blank spreadsheet).
 * 2. In Google Sheets menu, click Extensions -> Apps Script.
 * 3. Delete any code in the editor, and paste this entire file.
 * 4. (Optional) If running as a standalone script, set SPREADSHEET_ID below.
 *    If bound directly to your Google Sheet, leave SPREADSHEET_ID as ""
 *    (it will automatically use SpreadsheetApp.getActiveSpreadsheet()).
 * 5. Run the function 'setupSpreadsheet()' once from the toolbar to automatically
 *    create the 'Responses' and 'Questions' sheets with headers and default questions!
 * 6. Click Deploy -> New Deployment -> Select type: Web App:
 *    - Description: "ACME Portal Web App v1"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so submissions can be made)
 * 7. Click Deploy, Authorize access, and copy the Web App URL.
 * 8. Add the URL to your .env.local file as:
 *    NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 *    GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 * ============================================================================
 */

var CONFIG = {
  // Attached Google Sheet ID:
  // https://docs.google.com/spreadsheets/d/1qh2cn7YRFojrQTm7p_GPhHHqz0Qp13KsUm72_b73JM4/edit
  SPREADSHEET_ID: "1qh2cn7YRFojrQTm7p_GPhHHqz0Qp13KsUm72_b73JM4",

  RESPONSES_SHEET_NAME: "Responses",
  QUESTIONS_SHEET_NAME: "Questions",

  // Master admin password for backend API verification
  ADMIN_PASSWORD: "TEAMINDIA",
  ADMIN_EMAIL: "adminvardan@acme.in"
};

/**
 * Helper to get the target spreadsheet
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper to create JSON response with proper CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "ping";

    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "ACME Society Google Apps Script Bridge is active.",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "init") {
      setupSpreadsheet();
      return jsonResponse({
        success: true,
        message: "Spreadsheet initialized successfully with Responses and Questions sheets."
      });
    }

    if (action === "getQuestions") {
      var ss = getSpreadsheet();
      var qSheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
      if (!qSheet) {
        setupSpreadsheet();
        qSheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
      }

      var rows = qSheet.getDataRange().getValues();
      var questions = [];
      if (rows.length > 1) {
        var headers = rows[0];
        for (var i = 1; i < rows.length; i++) {
          var row = rows[i];
          if (!row[0]) continue; // Skip empty row
          
          var isEnabled = String(row[6]).toLowerCase() === "true" || row[6] === true;
          // If not admin request, only return enabled questions
          var isAdmin = params.auth === CONFIG.ADMIN_PASSWORD;
          if (!isAdmin && !isEnabled) {
            continue;
          }

          var optionsVal = row[4];
          var optionsArr = [];
          if (optionsVal) {
            try {
              optionsArr = JSON.parse(optionsVal);
            } catch (err) {
              optionsArr = String(optionsVal).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
            }
          }

          questions.push({
            id: String(row[0]),
            questionText: String(row[1]),
            page: Number(row[2]) || 2,
            questionType: String(row[3]),
            options: optionsArr,
            required: String(row[5]).toLowerCase() === "true" || row[5] === true,
            enabled: isEnabled,
            order: Number(row[7]) || i
          });
        }
      }

      // Sort by order ascending
      questions.sort(function(a, b) {
        return a.order - b.order;
      });

      return jsonResponse({
        success: true,
        questions: questions
      });
    }

    if (action === "getResponses") {
      // Validate admin auth
      if (params.auth !== CONFIG.ADMIN_PASSWORD) {
        return jsonResponse({ success: false, error: "Unauthorized access" });
      }

      var ss = getSpreadsheet();
      var rSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
      if (!rSheet) {
        return jsonResponse({ success: true, responses: [] });
      }

      var data = rSheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse({ success: true, responses: [] });
      }

      var headers = data[0];
      var responses = [];

      for (var r = 1; r < data.length; r++) {
        var rowData = data[r];
        if (!rowData[0] && !rowData[1]) continue;

        var respObj = {
          id: "resp_" + r,
          timestamp: rowData[0] ? formatTimestamp(rowData[0]) : "",
          fullName: String(rowData[1] || ""),
          admissionNumber: String(rowData[2] || ""),
          email: String(rowData[3] || ""),
          phone: String(rowData[4] || ""),
          year: String(rowData[5] || ""),
          branch: String(rowData[6] || ""),
          section: String(rowData[7] || ""),
          continueActiveMember: String(rowData[8] || ""),
          activityParticipation: String(rowData[9] || ""),
          meetingAttendance: String(rowData[10] || ""),
          groupCommunication: String(rowData[11] || ""),
          eventParticipation: String(rowData[12] || ""),
          areasOfInterest: String(rowData[13] || ""),
          contribution: String(rowData[14] || ""),
          suggestions: String(rowData[15] || "")
        };
        responses.push(respObj);
      }

      // Return newest first
      responses.reverse();

      return jsonResponse({
        success: true,
        total: responses.length,
        responses: responses
      });
    }

    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data = JSON.parse(raw);
    var action = data.action || "submit";

    // 1. Submit Member Form
    if (action === "submit") {
      return handleSubmit(data);
    }

    // 2. Admin Verification
    if (action === "verifyAdmin") {
      var email = (data.email || "").trim().toLowerCase();
      var pass = (data.password || "").trim();
      if (email === CONFIG.ADMIN_EMAIL.toLowerCase() && pass === CONFIG.ADMIN_PASSWORD) {
        return jsonResponse({ success: true, authenticated: true });
      }
      return jsonResponse({ success: false, error: "Invalid credentials" });
    }

    // Admin protected routes
    if (data.auth !== CONFIG.ADMIN_PASSWORD) {
      return jsonResponse({ success: false, error: "Unauthorized admin request" });
    }

    // 3. Add Dynamic Question
    if (action === "addQuestion") {
      return handleAddQuestion(data.question);
    }

    // 4. Edit Dynamic Question
    if (action === "editQuestion") {
      return handleEditQuestion(data.question);
    }

    // 5. Delete Dynamic Question
    if (action === "deleteQuestion") {
      return handleDeleteQuestion(data.questionId);
    }

    // 6. Toggle Enabled Status
    if (action === "toggleQuestion") {
      return handleToggleQuestion(data.questionId, data.enabled);
    }

    // 7. Reorder Questions
    if (action === "reorderQuestions") {
      return handleReorderQuestions(data.orderedIds);
    }

    // 8. Delete Member Response
    if (action === "deleteResponse") {
      return handleDeleteResponse(data.responseId, data.admissionNumber, data.email);
    }

    return jsonResponse({ success: false, error: "Unknown POST action: " + action });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handles member application submission
 */
function handleSubmit(payload) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  if (!sheet) {
    setupSpreadsheet();
    sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  }

  // Validate required fields
  if (!payload.fullName || !payload.admissionNumber || !payload.email || !payload.phone || !payload.year || !payload.branch || !payload.section) {
    return jsonResponse({
      success: false,
      error: "Missing required member details on Page 1."
    });
  }

  if (!payload.agreedToTerms) {
    return jsonResponse({
      success: false,
      error: "Confirmation agreement is required before submitting."
    });
  }

  // Current timestamp formatted for IST / locale
  var now = new Date();
  var formattedDate = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

  var areasString = "";
  if (Array.isArray(payload.areasOfInterest)) {
    areasString = payload.areasOfInterest.join(", ");
  } else {
    areasString = String(payload.areasOfInterest || "");
  }

  var row = [
    formattedDate,
    payload.fullName,
    payload.admissionNumber,
    payload.email,
    payload.phone,
    payload.year,
    payload.branch,
    payload.section,
    payload.continueActiveMember || "",
    payload.activityParticipation || "",
    payload.meetingAttendance || "",
    payload.groupCommunication || "",
    payload.eventParticipation || "",
    areasString,
    payload.contribution || "",
    payload.suggestions || ""
  ];

  sheet.appendRow(row);

  // Systematic row styling & formatting
  var lastRow = sheet.getLastRow();
  var rowRange = sheet.getRange(lastRow, 1, 1, row.length);
  rowRange.setVerticalAlignment("middle");
  rowRange.setFontFamily("Arial");
  rowRange.setFontSize(10);

  // Phone number formatted as plain text
  sheet.getRange(lastRow, 5).setNumberFormat("@");

  // Center-aligned columns for clean data presentation
  var centerCols = [1, 3, 5, 6, 8, 9, 10, 11, 12, 13];
  for (var c = 0; c < centerCols.length; c++) {
    sheet.getRange(lastRow, centerCols[c]).setHorizontalAlignment("center");
  }

  // Wrap text on longer answers
  var wrapCols = [14, 15, 16];
  for (var w = 0; w < wrapCols.length; w++) {
    sheet.getRange(lastRow, wrapCols[w]).setWrap(true);
  }

  // Alternating row background for clean readability
  if (lastRow % 2 === 0) {
    rowRange.setBackground("#F8FAFC");
  } else {
    rowRange.setBackground("#FFFFFF");
  }

  return jsonResponse({
    success: true,
    message: "Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully."
  });
}

/**
 * Handle Add Question
 */
function handleAddQuestion(q) {
  if (!q || !q.questionText) {
    return jsonResponse({ success: false, error: "Question text is required" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();
  var newId = "q_" + Utilities.getUuid().substring(0, 8);
  var newOrder = rows.length; // Next order index

  var optionsStr = "";
  if (Array.isArray(q.options)) {
    optionsStr = JSON.stringify(q.options);
  } else if (q.options) {
    optionsStr = String(q.options);
  }

  var newRow = [
    newId,
    q.questionText,
    q.page || 2,
    q.questionType || "Short Answer",
    optionsStr,
    q.required ? true : false,
    q.enabled !== false, // default true
    newOrder
  ];

  sheet.appendRow(newRow);

  return jsonResponse({
    success: true,
    message: "Question added successfully",
    question: {
      id: newId,
      questionText: q.questionText,
      page: q.page || 2,
      questionType: q.questionType || "Short Answer",
      options: Array.isArray(q.options) ? q.options : [],
      required: q.required ? true : false,
      enabled: true,
      order: newOrder
    }
  });
}

/**
 * Handle Edit Question
 */
function handleEditQuestion(q) {
  if (!q || !q.id) {
    return jsonResponse({ success: false, error: "Question ID is required" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(q.id)) {
      var rowIdx = i + 1; // 1-indexed

      var optionsStr = "";
      if (Array.isArray(q.options)) {
        optionsStr = JSON.stringify(q.options);
      } else {
        optionsStr = String(q.options || "");
      }

      sheet.getRange(rowIdx, 2).setValue(q.questionText);
      sheet.getRange(rowIdx, 3).setValue(q.page || 2);
      sheet.getRange(rowIdx, 4).setValue(q.questionType || "Short Answer");
      sheet.getRange(rowIdx, 5).setValue(optionsStr);
      sheet.getRange(rowIdx, 6).setValue(q.required ? true : false);
      if (typeof q.enabled !== "undefined") {
        sheet.getRange(rowIdx, 7).setValue(q.enabled ? true : false);
      }
      if (typeof q.order !== "undefined") {
        sheet.getRange(rowIdx, 8).setValue(Number(q.order));
      }

      return jsonResponse({ success: true, message: "Question updated successfully" });
    }
  }

  return jsonResponse({ success: false, error: "Question not found" });
}

/**
 * Handle Delete Question
 */
function handleDeleteQuestion(questionId) {
  if (!questionId) {
    return jsonResponse({ success: false, error: "Question ID is required" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(questionId)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true, message: "Question deleted successfully" });
    }
  }

  return jsonResponse({ success: false, error: "Question not found" });
}

/**
 * Handle Toggle Question
 */
function handleToggleQuestion(questionId, enabled) {
  if (!questionId) {
    return jsonResponse({ success: false, error: "Question ID is required" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(questionId)) {
      sheet.getRange(i + 1, 7).setValue(enabled ? true : false);
      return jsonResponse({ success: true, message: "Question status updated" });
    }
  }

  return jsonResponse({ success: false, error: "Question not found" });
}

/**
 * Handle Reorder Questions
 */
function handleReorderQuestions(orderedIds) {
  if (!Array.isArray(orderedIds)) {
    return jsonResponse({ success: false, error: "orderedIds array is required" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  for (var idx = 0; idx < orderedIds.length; idx++) {
    var qId = orderedIds[idx];
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]) === String(qId)) {
        sheet.getRange(r + 1, 8).setValue(idx + 1);
        break;
      }
    }
  }

  return jsonResponse({ success: true, message: "Questions reordered successfully" });
}

/**
 * Handle Delete Member Response
 */
function handleDeleteResponse(responseId, admissionNumber, email) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ success: false, error: "Responses sheet not found" });
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return jsonResponse({ success: false, error: "No responses found" });
  }

  // Iterate rows to find match
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowId = "resp_" + i;
    var rowAdm = String(row[2] || "").trim().toLowerCase();
    var rowEmail = String(row[3] || "").trim().toLowerCase();

    var matchId = responseId && (String(responseId) === rowId || String(responseId) === String(i));
    var matchAdm = admissionNumber && String(admissionNumber).trim().toLowerCase() === rowAdm;
    var matchEmail = email && String(email).trim().toLowerCase() === rowEmail;

    if (matchId || matchAdm || matchEmail) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true, message: "Response deleted successfully" });
    }
  }

  return jsonResponse({ success: false, error: "Response not found" });
}

/**
 * Setup and Auto-Initialize the Google Spreadsheet with exact columns
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet();

  // 1. Responses Sheet
  var rSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  if (!rSheet) {
    rSheet = ss.insertSheet(CONFIG.RESPONSES_SHEET_NAME);
  }

  var responseHeaders = [
    "Timestamp",
    "Full Name",
    "Admission Number",
    "Email ID",
    "Phone Number",
    "Year",
    "Branch",
    "Section",
    "Continue as Active Member",
    "Activity Participation",
    "Meeting Attendance",
    "Group Communication",
    "Event Participation",
    "Areas of Interest",
    "Contribution",
    "Suggestions for ACME"
  ];

  if (rSheet.getLastRow() === 0) {
    rSheet.appendRow(responseHeaders);
  } else {
    // Ensure header row has exact names
    rSheet.getRange(1, 1, 1, responseHeaders.length).setValues([responseHeaders]);
  }

  var hRange = rSheet.getRange(1, 1, 1, responseHeaders.length);
  hRange.setFontWeight("bold");
  hRange.setFontFamily("Arial");
  hRange.setFontSize(10);
  hRange.setBackground("#0F2B48");
  hRange.setFontColor("#FFFFFF");
  hRange.setHorizontalAlignment("center");
  hRange.setVerticalAlignment("middle");
  rSheet.setRowHeight(1, 38);
  rSheet.setFrozenRows(1);

  // Systematic Column Widths (in pixels)
  var rWidths = [160, 180, 150, 220, 130, 95, 180, 100, 180, 190, 175, 175, 175, 240, 280, 280];
  for (var c = 0; c < rWidths.length; c++) {
    rSheet.setColumnWidth(c + 1, rWidths[c]);
  }

  // Set default wrap strategy on description columns
  rSheet.getRange("N2:P").setWrap(true);

  // 2. Questions Sheet
  var qSheet = ss.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
  if (!qSheet) {
    qSheet = ss.insertSheet(CONFIG.QUESTIONS_SHEET_NAME);
  }

  var questionHeaders = [
    "Question ID",
    "Question Text",
    "Page",
    "Question Type",
    "Options",
    "Required",
    "Enabled",
    "Order"
  ];

  var isQNew = qSheet.getLastRow() === 0;
  if (isQNew) {
    qSheet.appendRow(questionHeaders);
  } else {
    qSheet.getRange(1, 1, 1, questionHeaders.length).setValues([questionHeaders]);
  }

  var qRange = qSheet.getRange(1, 1, 1, questionHeaders.length);
  qRange.setFontWeight("bold");
  qRange.setFontFamily("Arial");
  qRange.setFontSize(10);
  qRange.setBackground("#0F2B48");
  qRange.setFontColor("#FFFFFF");
  qRange.setHorizontalAlignment("center");
  qRange.setVerticalAlignment("middle");
  qSheet.setRowHeight(1, 38);
  qSheet.setFrozenRows(1);

  var qWidths = [130, 340, 80, 140, 300, 90, 90, 75];
  for (var q = 0; q < qWidths.length; q++) {
    qSheet.setColumnWidth(q + 1, qWidths[q]);
  }
  qSheet.getRange("B2:B").setWrap(true);
  qSheet.getRange("E2:E").setWrap(true);

  // Seed standard Questions 8 to 15 if empty
  if (isQNew) {
    var initialQuestions = [
      [
        "q_continue",
        "Do you want to continue as an active member of ACME?",
        2,
        "Multiple Choice",
        JSON.stringify(["Yes", "Maybe", "No"]),
        true,
        true,
        1
      ],
      [
        "q_activity",
        "How actively can you participate in ACME activities?",
        2,
        "Multiple Choice",
        JSON.stringify(["Regularly", "Whenever my schedule allows", "Occasionally"]),
        true,
        true,
        2
      ],
      [
        "q_meeting",
        "Are you able to attend ACME meetings when required?",
        2,
        "Multiple Choice",
        JSON.stringify(["Yes, regularly", "Whenever possible", "Not regularly"]),
        true,
        true,
        3
      ],
      [
        "q_communication",
        "Are you comfortable staying updated and responding to important messages in ACME groups?",
        2,
        "Multiple Choice",
        JSON.stringify(["Yes", "Usually", "Not always"]),
        true,
        true,
        4
      ],
      [
        "q_event",
        "Are you willing to participate in ACME events and activities when required?",
        2,
        "Multiple Choice",
        JSON.stringify(["Yes", "Whenever possible", "Occasionally"]),
        true,
        true,
        5
      ],
      [
        "q_areas",
        "Which areas of ACME are you interested in?",
        2,
        "Checkboxes",
        JSON.stringify([
          "Technical Activities",
          "Event Management",
          "Workshops",
          "Design & Content",
          "Social Media",
          "Documentation",
          "Coordination",
          "Other"
        ]),
        true,
        true,
        6
      ],
      [
        "q_contribution",
        "Is there anything you would like to contribute or take part in through ACME?",
        2,
        "Paragraph",
        "[]",
        false,
        true,
        7
      ],
      [
        "q_suggestions",
        "What would you like to see more of in ACME?",
        2,
        "Paragraph",
        "[]",
        false,
        true,
        8
      ]
    ];

    for (var k = 0; k < initialQuestions.length; k++) {
      qSheet.appendRow(initialQuestions[k]);
      var curRow = k + 2;
      qSheet.getRange(curRow, 1, 1, 8).setFontFamily("Arial").setFontSize(10).setVerticalAlignment("middle");
      qSheet.getRange(curRow, 3).setHorizontalAlignment("center");
      qSheet.getRange(curRow, 4).setHorizontalAlignment("center");
      qSheet.getRange(curRow, 6).setHorizontalAlignment("center");
      qSheet.getRange(curRow, 7).setHorizontalAlignment("center");
      qSheet.getRange(curRow, 8).setHorizontalAlignment("center");
    }
  }
}

/**
 * Format timestamp nicely
 */
function formatTimestamp(d) {
  if (!d) return "";
  if (d instanceof Date) {
    return Utilities.formatDate(d, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  }
  return String(d);
}
