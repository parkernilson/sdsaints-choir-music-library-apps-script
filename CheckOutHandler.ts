// ============================================
// Check-Out Form Handler
// ============================================
// Handles check-out form submissions and updates Items sheet

function handleCheckOut(e: GoogleAppsScript.Events.SheetsOnFormSubmit, itemsSheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // TODO: validate id and fail form submission if an id is
    // invalid... (?)

    const userEmail = e.values[CHECKOUT_FORM.USER_EMAIL];
    const userName = e.values[CHECKOUT_FORM.USER_NAME];
    const returnDate = e.values[CHECKOUT_FORM.RETURN_DATE];
    const requestedCheckoutItemIDListString = e.values[CHECKOUT_FORM.ITEM_IDS];
    // TODO: split on whitespace
    const requestedCheckoutItemIDs = requestedCheckoutItemIDListString
        .trim()
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

    Logger.log(`[Check Out] User: ${userName} (${userEmail})`);
    Logger.log(`[Check Out] Return Date: ${returnDate}`);
    Logger.log(
        `[Check Out] Requested Item IDs: ${requestedCheckoutItemIDs.join(", ")}`,
    );

    const itemsData = itemsSheet.getDataRange().getValues();
    let processedCount = 0;
    const notFoundIDs = [];

    for (const id of requestedCheckoutItemIDs) {
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
                    .setValues([["Checked Out", userName, userEmail, returnDate]]);
                Logger.log(
                    `[Check Out] ✓ Item ${id} checked out successfully (row ${i + 1})`,
                );
                found = true;
                processedCount++;
                break;
            }
        }
        if (!found) {
            notFoundIDs.push(id);
            Logger.log(`[Check Out] ✗ Item ${id} not found in Items sheet`);
        }
    }

    Logger.log(
        `[Check Out] Summary - Processed: ${processedCount}/${requestedCheckoutItemIDs.length}`,
    );
    if (notFoundIDs.length > 0) {
        Logger.log(`[Check Out] Not found IDs: ${notFoundIDs.join(", ")}`);
    }
}
