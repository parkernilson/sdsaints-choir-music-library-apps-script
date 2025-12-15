// ============================================
// Main Entry Point
// ============================================
// Entry point for Google Apps Script form submission triggers
// Routes form submissions to appropriate handlers

function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit): void {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = e.range.getSheet().getName();
    const itemsSheet = spreadsheet.getSheetByName("Items");

    if (!itemsSheet) {
        Logger.log("[onFormSubmit] Error: Items sheet not found");
        return;
    }

    Logger.log(`[onFormSubmit] Function started - Sheet: ${sheetName}`);
    Logger.log(`[onFormSubmit] Form values: ${JSON.stringify(e.values)}`);

    if (sheetName === "Check Out Responses") {
        handleCheckOut(e, itemsSheet);
    } else if (sheetName === "Check In Responses") {
        handleCheckIn(e, itemsSheet);
    } else {
        Logger.log(`[onFormSubmit] Unknown sheet: ${sheetName} - no action taken`);
    }

    Logger.log("[onFormSubmit] Function completed");
}
