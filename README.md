# Operationstavlan - OR Staff Scheduling & Dashboard App

A Swedish Operating Room Staff Scheduling desktop application built with Electron, React, and TypeScript. Designed for portable deployment on work PCs with multi-user network synchronization support.

## Features

### 🏥 Core Functionality
- **Excel Import**: Import staff schedules from OP and ANE Excel files
- **Drag & Drop Planning**: Visual staff assignment to operating rooms and corridor functions
- **Multi-Day Scheduling**: Plan schedules for entire weeks (Monday-Sunday)
- **Dashboard Display**: Full-screen view optimized for wall-mounted displays
- **Swedish Localization**: All UI text and date formats in Swedish

### 🌐 Network Synchronization
- **Multi-User Support**: Multiple users can access the app simultaneously from a network drive
- **Real-Time Updates**: Changes from any user are immediately visible to all others
- **Conflict Resolution**: Automatic detection and resolution of simultaneous edits
- **Portable Deployment**: Runs directly from network location without installation

### 🎯 User Interface
- **Compact Layout**: Optimized for 1920×1080 displays without scrollbars
- **Role-Based Organization**: Staff organized by OP SSK, ANE SSK, and Pass roles
- **Corridor Management**: Assign staff to specific functions with pager numbers
- **Room Grid**: Visual representation of operating rooms with assigned staff

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Build portable executable:
```bash
npm run electron:dist
```

### Deployment

1. Copy the built `Tavlan.exe` to your network drive
2. Multiple users can run the executable simultaneously from the same network location
3. All schedule changes are automatically synchronized between users

## Network Synchronization

The app uses file-based synchronization to enable multi-user collaboration:

- **Sync File**: `schedule-sync.json` created next to the executable
- **Lock Mechanism**: Prevents data corruption during simultaneous writes
- **Change Detection**: Automatic file watching and periodic polling
- **Conflict Resolution**: UI prompts when simultaneous edits are detected

### File Structure on Network Drive
```
NetworkDrive/
├── Tavlan.exe                 # Portable executable
├── schedule-sync.json          # Shared schedule data (auto-created)
└── schedule-sync.lock          # Temporary lock file (auto-managed)
```

## Technical Architecture

- **Frontend**: React 19+ with TypeScript
- **Desktop**: Electron 36+ (portable build)
- **Styling**: Tailwind CSS 4.1+
- **State Management**: Zustand with persistence
- **Build Tool**: Vite 6+
- **Testing**: Vitest
- **Excel Processing**: ExcelJS

## File Types Supported

- **OP Excel Files**: Operating room staff schedules
- **ANE Excel Files**: Anesthesia staff schedules
- **Multi-Week Files**: Combined schedules spanning multiple weeks

## Browser Compatibility

This is an Electron desktop application and does not run in web browsers.
