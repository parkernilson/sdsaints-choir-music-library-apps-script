// ============================================
// Main Entry Point
// ============================================
// Entry point for Google Apps Script form submission triggers
// Routes form submissions to appropriate handlers

function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit): void {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = e.range.getSheet().getName();
    const itemsSheet = spreadsheet.getSheetByName(SHEET_NAMES.ITEMS_SHEET);

    if (!itemsSheet) {
        Logger.log("[onFormSubmit] Error: Items sheet not found");
        return;
    }

    Logger.log(`[onFormSubmit] Function started - Sheet: ${sheetName}`);
    Logger.log(`[onFormSubmit] Form values: ${JSON.stringify(e.values)}`);

    if (sheetName === SHEET_NAMES.CHECKIN_RESPONSES) {
        handleCheckInSubmission(e, itemsSheet);
    } else if (sheetName === SHEET_NAMES.CHECKOUT_RESPONSES) {
        handleCheckOutSubmission(e, itemsSheet);
    } else {
        Logger.log(`[onFormSubmit] Unknown sheet: ${sheetName} - no action taken`);
    }

    Logger.log("[onFormSubmit] Function completed");
}

function onChange(e: GoogleAppsScript.Events.SheetsOnChange) {
    initNewRowsWithDefaultValues(e);
}
