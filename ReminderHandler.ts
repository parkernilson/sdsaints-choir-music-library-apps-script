// ============================================
// Reminder Email Handler
// ============================================
// Sends reminder emails for checked-out sheet music

/**
 * Data structure for a checked-out item
 */
interface CheckedOutItem {
    itemId: string;
    holderName: string;
    holderEmail: string;
    dueDate: Date;
}

/**
 * Data structure for organizing items by person and reminder type
 */
interface ReminderGroup {
    email: string;
    name: string;
    overdue: CheckedOutItem[];
    dueTomorrow: CheckedOutItem[];
    dueInWeek: CheckedOutItem[];
}

/**
 * Get today's date at midnight in spreadsheet timezone
 */
function getTodayMidnight(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet): Date {
    const timezone = spreadsheet.getSpreadsheetTimeZone();
    const now = new Date();
    const todayString = Utilities.formatDate(now, timezone, "yyyy-MM-dd");
    return new Date(todayString + "T00:00:00");
}

/**
 * Check if two dates are the same (year, month, day)
 */
function isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * Check if a date is Monday
 */
function isMonday(date: Date): boolean {
    return date.getDay() === 1; // Sunday = 0, Monday = 1
}

/**
 * Group items by formatted due date string
 */
function groupByDate(items: CheckedOutItem[], timezone: string): Map<string, CheckedOutItem[]> {
    const map = new Map<string, CheckedOutItem[]>();
    for (const item of items) {
        const dateStr = Utilities.formatDate(item.dueDate, timezone, "MMM d, yyyy");
        if (!map.has(dateStr)) {
            map.set(dateStr, []);
        }
        map.get(dateStr)!.push(item);
    }
    return map;
}

/**
 * Build email subject and body for a person's reminders
 */
function buildReminderEmail(group: ReminderGroup, timezone: string): { subject: string; body: string } {
    const hasOverdue = group.overdue.length > 0;
    const hasTomorrow = group.dueTomorrow.length > 0;
    const hasWeek = group.dueInWeek.length > 0;

    let subject = "";
    let body = `Hi ${group.name},\n\n`;

    // Determine subject based on priority (overdue > tomorrow > week)
    if (hasOverdue) {
        subject = "OVERDUE: Sheet Music Return - San Diego Saints Choir";
    } else if (hasTomorrow) {
        subject = "Sheet Music Due Tomorrow - San Diego Saints Choir";
    } else {
        subject = "Sheet Music Due in 1 Week - San Diego Saints Choir";
    }

    // Build intro text
    if (hasOverdue && (hasTomorrow || hasWeek)) {
        body += "This is a reminder about your checked-out sheet music:\n\n";
    } else if (hasOverdue) {
        body += "This is a notice that you have OVERDUE sheet music that needs to be returned:\n\n";
    } else if (hasTomorrow) {
        body += "This is a reminder that you have sheet music due back TOMORROW:\n\n";
    } else {
        body += "This is a friendly reminder that you have sheet music due back in 7 days:\n\n";
    }

    // Add overdue section
    if (hasOverdue) {
        body += "OVERDUE ITEMS:\n";
        const overdueByDate = groupByDate(group.overdue, timezone);
        for (const [dateStr, items] of overdueByDate) {
            body += `  Was due on ${dateStr}:\n`;
            for (const item of items) {
                body += `  - Item #${item.itemId}\n`;
            }
        }
        body += "\n";
    }

    // Add tomorrow section
    if (hasTomorrow) {
        body += "ITEMS DUE TOMORROW:\n";
        const tomorrowByDate = groupByDate(group.dueTomorrow, timezone);
        for (const [dateStr, items] of tomorrowByDate) {
            body += `  Due on ${dateStr}:\n`;
            for (const item of items) {
                body += `  - Item #${item.itemId}\n`;
            }
        }
        body += "\n";
    }

    // Add week section
    if (hasWeek) {
        body += "ITEMS DUE IN 7 DAYS:\n";
        const weekByDate = groupByDate(group.dueInWeek, timezone);
        for (const [dateStr, items] of weekByDate) {
            body += `  Due on ${dateStr}:\n`;
            for (const item of items) {
                body += `  - Item #${item.itemId}\n`;
            }
        }
        body += "\n";
    }

    // Add closing
    if (hasOverdue) {
        body += "Please return overdue items as soon as possible";
        if (hasTomorrow || hasWeek) {
            body += ", and plan ahead for upcoming due dates";
        }
        body += ".\n\n";
    } else if (hasTomorrow) {
        body += "Please return these items by tomorrow. If you need more time, please contact the choir librarian.\n\n";
    } else {
        body += "Please plan to return these items by the due date. If you need more time, please contact the choir librarian.\n\n";
    }

    body += "Thank you,\nSan Diego Saints Choir Library";

    return { subject, body };
}

/**
 * Send a reminder email to a person
 */
function sendReminderEmail(email: string, subject: string, body: string): void {
    try {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            body: body,
        });
        Logger.log(`[Reminders] ✓ Email sent to ${email}`);
    } catch (error) {
        Logger.log(`[Reminders] ✗ Failed to send email to ${email}: ${error}`);
    }
}

/**
 * Main entry point for daily reminder system
 * Should be triggered once per day via time-based trigger
 *
 * Sends three types of reminders:
 * - Overdue items (Mondays only)
 * - Items due tomorrow
 * - Items due in exactly 7 days
 *
 * Groups all reminders per person into ONE email per day
 */
function sendDailyReminders(): void {
    Logger.log("[Reminders] Starting daily reminder process");

    // 1. Get spreadsheet and Items sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const itemsSheet = spreadsheet.getSheetByName("Items");
    if (!itemsSheet) {
        Logger.log("[Reminders] Error: Items sheet not found");
        return;
    }

    const timezone = spreadsheet.getSpreadsheetTimeZone();

    // 2. Calculate date thresholds
    const today = getTodayMidnight(spreadsheet);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    const isMondayToday = isMonday(today);

    Logger.log(`[Reminders] Today: ${today.toDateString()}`);
    Logger.log(`[Reminders] Is Monday: ${isMondayToday}`);

    // 3. Read all items data
    const itemsData = itemsSheet.getDataRange().getValues();

    // 4. Build reminder groups (map of email -> ReminderGroup)
    const reminderGroups = new Map<string, ReminderGroup>();

    let skippedCount = 0;
    let processedCount = 0;

    for (let i = 1; i < itemsData.length; i++) {
        const row = itemsData[i];
        const status = row[ITEMS_SHEET.STATUS_COLUMN];
        const holderName = row[ITEMS_SHEET.USER_NAME_COLUMN];
        const holderEmail = row[ITEMS_SHEET.USER_EMAIL_COLUMN];
        const dueDateValue = row[ITEMS_SHEET.RETURN_DATE_COLUMN];
        const itemId = row[ITEMS_SHEET.ID_COLUMN];

        // Skip if not checked out
        if (status !== "Checked Out") {
            continue;
        }

        // Skip if missing email
        if (!holderEmail || String(holderEmail).trim() === "") {
            Logger.log(`[Reminders] Skipping item ${itemId}: no email`);
            skippedCount++;
            continue;
        }

        // Skip if no due date or invalid date
        if (!dueDateValue || !(dueDateValue instanceof Date)) {
            Logger.log(`[Reminders] Skipping item ${itemId}: invalid/missing due date`);
            skippedCount++;
            continue;
        }

        const dueDate = new Date(dueDateValue);
        dueDate.setHours(0, 0, 0, 0); // Normalize to midnight

        // Determine which category this item falls into
        const isOverdue = dueDate < today;
        const isDueTomorrow = isSameDate(dueDate, tomorrow);
        const isDueInWeek = isSameDate(dueDate, oneWeekFromNow);

        // Skip if doesn't match any reminder criteria
        if (!isOverdue && !isDueTomorrow && !isDueInWeek) {
            continue;
        }

        // Skip overdue if not Monday
        if (isOverdue && !isMondayToday) {
            continue;
        }

        // Get or create reminder group for this email
        const emailStr = String(holderEmail);
        if (!reminderGroups.has(emailStr)) {
            reminderGroups.set(emailStr, {
                email: emailStr,
                name: holderName ? String(holderName) : "Choir Member",
                overdue: [],
                dueTomorrow: [],
                dueInWeek: [],
            });
        }

        const group = reminderGroups.get(emailStr)!;
        const item: CheckedOutItem = {
            itemId: String(itemId),
            holderName: String(holderName),
            holderEmail: emailStr,
            dueDate: dueDate,
        };

        if (isOverdue) {
            group.overdue.push(item);
        }
        if (isDueTomorrow) {
            group.dueTomorrow.push(item);
        }
        if (isDueInWeek) {
            group.dueInWeek.push(item);
        }

        processedCount++;
    }

    Logger.log(`[Reminders] Processed ${processedCount} items, skipped ${skippedCount}`);
    Logger.log(`[Reminders] Found ${reminderGroups.size} people to email`);

    // 5. Send emails (one per person)
    let emailsSent = 0;
    for (const group of reminderGroups.values()) {
        const { subject, body } = buildReminderEmail(group, timezone);
        sendReminderEmail(group.email, subject, body);
        emailsSent++;
    }

    Logger.log(`[Reminders] Sent ${emailsSent} emails`);
    Logger.log("[Reminders] Daily reminder process complete");
}
