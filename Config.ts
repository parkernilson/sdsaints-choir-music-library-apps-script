// ============================================
// CONFIGURATION - Column Mappings
// ============================================

// Items Sheet Column Indices (0-based for array access)
const ITEMS_SHEET = {
    NAME_COLUMN: 1, // Column B: Item Name
    ID_COLUMN: 6, // Column G: Item ID
    STATUS_COLUMN: 2, // Column C: Status (Checked In/Out)
    USER_NAME_COLUMN: 3, // Column D: User Name
    USER_EMAIL_COLUMN: 4, // Column E: User Email
    RETURN_DATE_COLUMN: 5, // Column F: Return Date
    // For setValues - 1-based column number and count
    UPDATE_START_COLUMN: 3,
    UPDATE_COLUMN_COUNT: 4,
};

// Check Out Form Response Indices (0-based for e.values array)
const CHECKOUT_FORM = {
    USER_EMAIL: 1,
    RETURN_DATE: 2,
    ITEM_IDS: 3,
    USER_NAME: 4,
};

// Check In Form Response Indices (0-based for e.values array)
const CHECKIN_FORM = {
    ITEM_IDS: 2,
};
