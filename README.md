# San Diego Saints Sheet Music Tracking System

A Google Apps Script project for tracking sheet music inventory for the San Diego Saints choir. This system manages check-out and check-in of sheet music through Google Forms and a connected spreadsheet.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- [Google Apps Script CLI (clasp)](https://github.com/google/clasp)

## Setup

### 1. Install Dependencies

First, clone the repository and install the project dependencies:

```bash
npm install
```

### 2. Install clasp

If you haven't already installed clasp globally, run:

```bash
npm install -g @google/clasp
```

### 3. Authenticate with Google

Log in to your Google account to allow clasp to deploy scripts:

```bash
clasp login
```

This will open a browser window for you to authorize clasp.

## Project Structure

```
.
├── CheckInHandler.ts    # Handles sheet music check-in form submissions
├── CheckOutHandler.ts   # Handles sheet music check-out form submissions
├── Config.ts            # Configuration constants
├── Main.ts              # Main entry point and form triggers
├── ReminderHandler.ts   # Email reminder functionality
├── Utils.ts             # Utility functions
├── appsscript.json      # Google Apps Script manifest
├── tsconfig.json        # TypeScript configuration
├── .clasp.json          # Clasp deployment configuration
└── build/               # Compiled JavaScript output (created by build)
```

## Build

The project is written in TypeScript and must be compiled to JavaScript before deployment.

### Build Once

```bash
npm run build
```

This command:
1. Compiles all TypeScript files to JavaScript
2. Outputs the compiled files to the `build/` directory
3. Copies `appsscript.json` to the `build/` directory

### Watch Mode (Development)

For active development, use watch mode to automatically recompile when files change:

```bash
npm run watch
```

## Deployment

### Deploy to Google Apps Script

To build and deploy the script in one command:

```bash
npm run push
```

This command runs the build process and then pushes the compiled code to Google Apps Script using clasp.

### Manual Deployment Steps

If you prefer to deploy manually:

1. Build the project:
   ```bash
   npm run build
   ```

2. Push to Google Apps Script:
   ```bash
   clasp push
   ```

### Deployment Configuration

The `.clasp.json` file contains the configuration for deployment:
- `scriptId`: The unique identifier for your Google Apps Script project
- `rootDir`: Set to `./build` so only compiled files are deployed

## Development Workflow

1. Make changes to TypeScript files in the root directory
2. Build the project with `npm run build` (or use `npm run watch`)
3. Deploy with `npm run push`
4. Test the functionality in your Google Sheets/Forms

## How It Works

This system tracks sheet music using:
- A **check-out form** (public) - Anyone can request to check out sheet music
- A **check-in form** (librarian only) - Only the librarian can check music back in
- A **Google Sheet** - Stores the inventory and tracks who has what music
- **Email reminders** - Automatically sends reminders to people with overdue music

The system is designed to be simple and maintainable for a non-profit organization with limited technical resources.
