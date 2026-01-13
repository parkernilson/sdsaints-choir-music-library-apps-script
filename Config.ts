// ============================================
// CONFIGURATION - Column Mappings
// ============================================

const SHEET_NAMES = {
    ITEMS_SHEET: "Items",
    CHECKOUT_RESPONSES: "Checkout Form Responses",
    CHECKIN_RESPONSES: "Checkin Form Responses",
};

const ITEMS_SHEET = {
    HEADER_ROW: 1,
    UNIQUE_ID_COL: 1,
    STATUS_COL: 3,
    ITEM_CHECKED_OUT_TEXT: "Checked Out",
    ITEM_CHECKED_IN_TEXT: "Checked In",
    ITEM_NEWLY_CREATED_TEXT: "Newly Created",
};

const CHECKOUT_FORM = {
    ITEM_IDS_INDEX: 3,
    USER_NAME_INDEX: 1,
    USER_EMAIL_INDEX: 2,
};

const CHECKIN_FORM = {
    ITEM_IDS_INDEX: 1,
};
