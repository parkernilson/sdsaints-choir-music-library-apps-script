// ============================================
// Check-In Form Handler
// ============================================
// Handles check-in form submissions and updates Items sheet

function handleCheckIn(e: GoogleAppsScript.Events.SheetsOnFormSubmit, itemsSheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    const checkinItemIDListString = e.values[CHECKIN_FORM.ITEM_IDS];
    const checkinItemIDs = checkinItemIDListString
        .trim()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

    Logger.log(`[Check In] Requested Item IDs: ${checkinItemIDs.join(", ")}`);

    const itemsData = itemsSheet.getDataRange().getValues();
    let processedCount = 0;
    const notFoundIDs = [];

    for (const id of checkinItemIDs) {
        let found = false;
        for (let i = 1; i < itemsData.length; i++) {
            if (itemsData[i][ITEMS_SHEET.ID_COLUMN] == id) {
                itemsSheet
                    .getRange(
                        i + 1,
                        ITEMS_SHEET.UPDATE_START_COLUMN,
                        1,
                        ITEMS_SHEET.UPDATE_COLUMN_COUNT,
                    )
                    .setValues([["Checked In", "", "", ""]]);
                Logger.log(
                    `[Check In] ✓ Item ${id} checked in successfully (row ${i + 1})`,
                );
                found = true;
                processedCount++;
                break;
            }
        }
        if (!found) {
            notFoundIDs.push(id);
            Logger.log(`[Check In] ✗ Item ${id} not found in Items sheet`);
        }
    }

    Logger.log(
        `[Check In] Summary - Processed: ${processedCount}/${checkinItemIDs.length}`,
    );
    if (notFoundIDs.length > 0) {
        Logger.log(`[Check In] Not found IDs: ${notFoundIDs.join(", ")}`);
    }
}
