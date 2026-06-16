# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
# Jira Developer Workflow - AI Agent Instructions
# Developer Workflow — Jira + Git Agent Instructions

## Core Principle
You operate on a Jira-integrated development workflow. When the user references a task, you manage the full lifecycle: branch creation, status updates, implementation, and completion — all synced with Jira via the MCP.

## Task Reference Convention
The user will reference a task by its **Jira issue key** (e.g., `AMR-142`) or by mentioning it loosely. Your first action is always to **read the task from Jira** to get full context (summary, description, subtasks, status, type) before doing anything else.

---

## Workflow Steps

### Step 1 — Start Working on a Task
When the user says they want to start a task (mentions the key/reference):

1. **Read the task** from Jira via MCP — fetch summary, description, acceptance criteria, issue type, and all subtasks.
2. **Create a Git branch** named from the task. Use this convention:
   ```
   <type>/<ISSUE-KEY>-<short-kebab-summary>
   ```
   - `type` = `feature`, `bugfix`, `hotfix`, `chore`, etc. (derive from Jira issue type)
   - Example: `feature/AMR-142-add-payment-gateway`
3. Branch from the current default base (`main` or `develop` — confirm once, then remember).

### Step 2 — Read & Prioritize Subtasks
After reading the parent task, branch logic:

**IF the task HAS subtasks:**

1. **Read ALL subtasks** — for each subtask fetch: key, summary, description, current status, priority field, and any linked dependencies or "blocks/blocked by" links.
2. **Prioritize them** into an execution order using the rules below (see *Prioritization Rules*). Produce an ordered list and present it to the user before starting.
3. Take the **highest-priority subtask that is not yet `Done`**.
4. Update that **subtask** status → **In Progress**.
5. Implement only that subtask.
6. When finished → update that subtask → **Done**.
7. Advance to the next subtask in priority order (wait for user instruction, or auto-advance if told to).
8. Repeat until **all subtasks are `Done`**, then update the **parent task** → **Done**.

**IF the task has NO subtasks:**
- Update the **parent task** status → **In Progress**.
- Implement the full task as described in the Jira description.
- When finished → update the **task** → **Done**.

---

## Prioritization Rules
When ordering subtasks, apply these criteria in sequence (each acts as a tie-breaker for the previous):

1. **Dependencies first** — any subtask that is *blocked by* another must come **after** its blocker. A subtask that *blocks* others is pulled **earlier**. Respect the dependency graph above all else.
2. **Jira priority field** — `Highest` → `High` → `Medium` → `Low` → `Lowest`.
3. **Status already in progress** — a subtask already marked `In Progress` is resumed before starting a fresh one.
4. **Foundational / setup work** — schema, models, config, scaffolding, and shared utilities come before features that consume them (infer from summary/description).
5. **Sprint / due date** — earlier due dates or current-sprint items first.
6. **Jira rank / board order** — if all else is equal, fall back to the manual board order (Jira `rank`).

If two subtasks are genuinely equal after all rules, keep their original board order and note it to the user.

### Circular or unclear dependencies
If a dependency cycle is detected, or ordering is ambiguous, **stop and present the conflict to the user** rather than guessing.

### Step 3 — Implementation
- Implement the code changes required by the subtask/task description and acceptance criteria.
- Stay scoped: only do what the current subtask/task specifies. Do not implement future subtasks.
- Commit with a message referencing the key:
  ```
  <type>(<scope>): <description> [ISSUE-KEY]
  ```
  Example: `feat(payments): integrate Stripe checkout [AMR-142]`

### Step 4 — Completion
- Update the relevant Jira item (subtask or task) → **Done**.
- Report back to the user: what was implemented, branch name, commit(s), and updated Jira status.

---

## Status Mapping Reference
| Action | Jira Status |
|---|---|
| Starting work | `In Progress` |
| Finished work | `Done` |

*(Adjust status names to match your actual Jira workflow scheme — e.g., some boards use "To Do" / "In Review" / "Done".)*

## Guardrails
- **Always read before acting** — never assume task content.
- **Read ALL subtasks up front** — fetch every subtask and its status/priority/dependencies before choosing what to work on.
- **Prioritize, don't pick blindly** — always order subtasks via the Prioritization Rules and show the order before starting.
- **One unit of work at a time** — current subtask, or the task if no subtasks exist.
- **Never skip status updates** — In Progress on start, Done on finish, every time.
- **Close the parent** — only mark the parent task `Done` once every subtask is `Done`.
- **Confirm ambiguity** — if the task reference is unclear, matches multiple issues, or has conflicting dependencies, ask before proceeding.
