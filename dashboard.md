Here's a focused and complete prompt you can paste into ChatGPT or Claude to generate the initial layout for DashboardLayout.tsx, using TailwindCSS and your layout constraints:


---

# Prompt: Build `DashboardLayout.tsx` for a Swedish OR Dashboard (React + Tailwind)

## 🎯 Goal
Create a fully static `DashboardLayout.tsx` component for a hospital dashboard that shows operating room staffing and corridor staff for the current day. No user interaction is allowed — all content must be **fully visible at all times**, and the layout must adapt to content size by **scaling down elements**, not by scrolling.

---

## 🧱 Component Structure

Build the layout using TailwindCSS and placeholder subcomponents:

- `Header`: fixed at top
- `Main Content`: 3–6 room columns in a grid (`RoomCard` placeholders)
- `CorridorStaffSection`: below main content, spans full width
- `SidebarPanel`: on the right, fixed width, always visible

---

## 🧩 Layout Constraints

- Use Flex or Grid to split layout:
  - Left: 80% width for Main + Corridor staff
  - Right: 20% width for SidebarPanel
- Vertically:
  - Main Content = 65% height
  - CorridorStaffSection = 35% height
- No scrollbars anywhere. All child components must shrink responsively.
- Use Tailwind utility classes only.

---

## 🧪 Requirements

- Use `div` placeholders for `RoomCard`, `CorridorStaffSection`, `SidebarPanel`
- Set `className` on containers for flex layout and sizing
- Layout must work fullscreen (i.e., assume `h-screen` and `w-screen` root)

---

## 🧾 Notes

- TailwindCSS v4.1+ assumed
- Component must be self-contained and use fake static content for now
- Final layout will show 3–6 rooms, 3 staff categories per room, and 1–2 people per category

✅ Output a complete `DashboardLayout.tsx` in React + TypeScript


---

Let me know if you'd like me to generate the file here directly — otherwise, feel free to try this in your Copilot/AI tab.
