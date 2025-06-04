# PLANNING.md - Operationssals Personalschema

## Project Vision
Build a Swedish Operating Room Staff Scheduling desktop application that runs as a portable executable on work PCs with UAC restrictions. The app enables drag-and-drop staff scheduling across multiple operating rooms with offline-first functionality, and includes a full-screen dashboard display mode optimized for 1080p TVs.

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Electron (portable executable)
- **Build Tool**: Vite
- **Frontend**: React 19+ with TypeScript
- **Styling**: Tailwind CSS 4.1+ (CSS-only config)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Excel Processing**: ExcelJS (modern replacement for xlsx)
- **State Management**: Zustand
- **Storage**: localStorage (offline-first)

### Key Architectural Decisions
1. **Portable Deployment**: Electron packaged as single executable
2. **No Network Dependency**: All data stored locally after initial setup
3. **Swedish Localization**: All UI text in Swedish
4. **Multi-Mode Interface**: Planning mode + Dashboard/Display mode
5. **Modular Components**: Keep files under 500 lines, split when needed
6. **No Scroll or Hidden Content**: Layout must ensure all content is always visible and proportionally scaled within the viewport

## Core Features & User Stories

### 1. Excel Import System
- Import staff data with columns: Name, Work hours, Comments
- Validate and sanitize imported data
- Handle Swedish characters and formatting
- Preview before import confirmation

### 2. Drag & Drop Planning Interface
- Visual staff cards with work hours and comments
- Drag staff to operating rooms (3-6 rooms per day)
- Roles: `Pass`, `Op SSK`, `Ane SSK`, with support for students and double staffing
- Real-time validation (work hours, conflicts)
- Drag corridor staff to pager/function slots

### 3. Multi-Day Planning
- Tabbed interface for Monday–Sunday
- Independent room and corridor configuration per day
- Copy/paste schedules between days
- Save/load different weekly templates

### 4. Dashboard Display Mode
- Full-screen read-only view for wall-mounted displays
- Clean, compact layout (Excel-level density)
- Auto-refresh current day schedule
- Toggle days with arrow keys or sidebar buttons
- **Column-Prioritized Layout for 16:9 Aspect Ratios**:
  - Optimized for wide-screen hospital displays (1080p)
  - Flexible CSS Grid for uniform room sizing
  - Responsive corridor grid (3 fixed role columns)
  - Sidebar for static details or extra info
  - **No scrollbars or overflow**: all data scales proportionally

### 5. Custom Staff Management
- Manual entry for temporary staff, students, substitutes
- Quick-add via modal or sidebar
- Persistent local storage for custom entries

## Technical Constraints

### Deployment Environment
- Windows work PCs with UAC restrictions
- No admin privileges for installation
- No internet connectivity assumed
- Portable executable requirement

### Performance Requirements
- Smooth drag & drop interactions
- Fast Excel import (up to 1000+ staff records)
- Responsive UI on older hardware
- Minimal memory footprint

### Localization Requirements
- All UI text in Swedish
- Swedish date/time formats
- Handle Swedish characters (å, ä, ö) properly
- Cultural conventions for work scheduling

## File Structure Guidelines
```
src/
├── main/                          # Electron main process
│   ├── main.ts                    # Electron entry point
│   ├── fileHandler.ts             # Excel import/export
│   └── store.ts                   # Persistent settings store
│
├── renderer/                      # React + TS frontend
│
│   ├── App.tsx                    # App layout with routing
│   ├── main.tsx                   # React root
│   └── index.css                  # Tailwind CSS config
│
│   ├── routes/                    # Top-level pages
│   │   ├── Admin.tsx              # Planning view (drag-and-drop)
│   │   └── Dashboard.tsx          # Display view (static)
│
│   ├── components/                # UI components
│   │   ├── DashboardLayout.tsx    # Full dashboard layout
│   │   ├── RoomCard.tsx           # One OR room
│   │   ├── StaffCard.tsx          # Staff visual block
│   │   ├── CorridorStaffGrid.tsx  # Corridor support grid
│   │   └── SidebarPanel.tsx       # Weekday switcher + info
│
│   ├── stores/                    # Zustand state
│   │   └── appStore.ts            # Current day, settings
│
│   ├── utils/                     # Data parsing
│   │   ├── excelParser.ts         # Parse .xlsx to usable data
│   │   └── dateHelpers.ts         # Swedish date formatting
│
│   ├── types/                     # Shared TypeScript types
│   │   └── index.ts
│
│   └── i18n/                      # Localization
│       └── sv.ts                  # Swedish labels

```

## Development Workflow Rules
1. Keep components under 500 lines - split into modules when needed
2. Start fresh AI conversations often - long threads degrade quality
3. One task per AI request for clarity
4. Test early and often - unit tests for every function
5. Write documentation and comments as you code
6. Use markdown files (PLANNING.md, TASK.md) for project management
7. Be specific in AI requests with examples and context

## Swedish UI Terminology
- **Operationssal** = Operating Room
- **Personal** = Staff
- **Arbetstid** = Work Hours
- **Schema** = Schedule
- **Måndag–Söndag** = Monday–Sunday
- **Planering** = Planning
- **Översikt** = Overview/Dashboard
- **Importera** = Import
- **Exportera** = Export

## Next Steps
1. Set up basic Electron + Vite + React project structure
2. Configure Tailwind CSS 4.1 for custom styling
3. Create core TypeScript types and interfaces
4. Implement Excel import functionality
5. Build drag & drop planning interface
6. Add multi-day scheduling tabs
7. Create dashboard display mode with content-aware layout scaling
8. Package as portable executable

