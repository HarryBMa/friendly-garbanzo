---
applyTo: "**"
---

# 🧠 AI Instructions – OR Staff Scheduling & Dashboard App

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn’t listed, add it with a brief description and today’s date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`.

---

### 🧱 Code Structure & Modularity
- **Never create a component file longer than 500 lines.** If it grows large, refactor into smaller presentational components, logic hooks, or utility modules.
- **Organize code into clearly separated feature-based modules**, grouped by page (e.g., Dashboard/Admin) or function.
- **Use clear, consistent imports.** Prefer relative paths inside `src/`, and use barrel exports (`index.ts`) where logical.

---

### 💡 Tailwind Layout Rules
- All layouts must **shrink proportionally** to avoid overflow on 1920×1080 displays.
- **Never allow scrollbars.** Content must fit through layout compression, not clipping.
- Use:
  - `text-xs`, `leading-tight`, `truncate` on all compact text
  - `gap-1`, `gap-[2px]` for dense grid spacing
  - `min-w-0`, `flex-shrink`, `flex-wrap`, and `grid` where appropriate
- Prefer `grid` over `flex` for room/corridor columns that need wrapping.

---

### 🧪 Testing & Reliability
- **Write unit tests for utility functions, Excel parsers, and custom hooks** using Vitest (or Jest).
- **Use co-located test files** with `.test.ts` / `.test.tsx` next to source modules.
- Each test file should include:
  - ✅ Normal case
  - 🧪 Edge case
  - ❌ Invalid or failure case
- Do not test UI layout with unit tests unless explicitly instructed.

---

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a “Discovered During Work” section.
- If a change required restructuring or introduced side effects, document it briefly.

---

### 📚 Documentation & Explainability
- **Update `README.md`** if any new features, setup steps, or dependencies are added.
- **Comment complex or non-obvious code**, so a mid-level React developer understands it.
- For tricky logic, include a `// Reason:` inline comment to explain the design decision.

---

### 🧠 AI Behavior Rules
- **Never assume missing context** – ask for clarification if anything is ambiguous.
- **Never hallucinate libraries or functions.** Only use packages listed in `package.json` or explicitly allowed in `PLANNING.md`.
- Favor small, testable outputs. Break large feature prompts into atomic steps.

---

### 📊 State Management (Zustand)
- Use Zustand for app-wide state (e.g., current day, dashboard mode).
- Keep stores flat and minimal.
- Avoid prop-drilling; share config/state via global stores.

---

### 🧭 Prompt Discipline
- One prompt = one task.
- Reference relevant files and responsibilities when asking AI for help.
- Always provide a real or simulated data example when dealing with layout or parsing.

---
### 🛠️ Development Tools
- **Vite**: For fast development and build tooling.
- **Vitest**: For unit testing and test-driven development.
- **Prettier**: For code formatting.
- **ESLint**: For linting and code quality.
- **Tailwind CSS**: For utility-first CSS styling.