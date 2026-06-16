# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.
# Jira Developer Workflow - AI Agent Instructions

## Overview
This document provides step-by-step instructions for the AI agent to follow when implementing tasks from Jira in a team development environment.

---

## Workflow Trigger
**User Command:** The user mentions the task/feature name they want to start working on.

Example:
- "Start working on user authentication"
- "Implement payment integration"
- "Fix login bug"

---

## Complete Workflow Steps

### STEP 1: Receive Task Information
- **Action:** Listen for user input containing the task/feature name
- **Process:** Extract the task name/description from user message
- **Example:** User says: "I want to work on user authentication module"

### STEP 2: Create Git Branch
- **Action:** Create a new Git branch with standardized naming
- **Branch Naming Convention:** `feature/task-name` or `bugfix/task-name`
- **Format:** 
  - For features: `feature/<task-name-in-kebab-case>`
  - For bugs: `bugfix/<bug-name-in-kebab-case>`
  - For improvements: `improvement/<task-name-in-kebab-case>`
- **Example:** 
  - User task: "user authentication"
  - Branch name: `feature/user-authentication`

### STEP 3: Query Jira for Task Details
- **Action:** Use Jira API MCP to search and read the task
- **Search Method:** Find the task by name/key in the current project
- **Retrieve Information:**
  - Task ID/Key
  - Task Title
  - Task Description
  - Assigned status
  - Subtasks (if any exist)
  - Priority level
  - Due date

### STEP 4: Decision Point - Check for Subtasks

#### **PATH A: If Subtasks Exist**

**STEP 4A.1: List All Subtasks**
- Action: Retrieve all subtasks associated with the parent task
- Record: Subtask IDs, titles, and current status
- Display: Show user the list of subtasks to confirm understanding

**STEP 4A.2: Update First Subtask Status**
- Action: Update the first subtask status to "In Progress"
- Using: Jira API MCP update function
- Process: 
  1. Identify the first subtask in the workflow
  2. Change its status to "In Progress"
  3. Add a comment: "Started working on this subtask - Branch: [branch-name]"
- Confirm: Show user that subtask status has been updated

**STEP 4A.3: Implement the Subtask**
- Action: Begin development work on the subtask
- When Complete: Notify user that subtask implementation is done
- Proceed to STEP 4A.4

**STEP 4A.4: Update Subtask Status to Complete**
- Action: Update subtask status to "Done"
- Using: Jira API MCP update function
- Process:
  1. Change subtask status to "Done"
  2. Add comment with completion details (e.g., "Completed. Ready for review.")
  3. Record completion time

**STEP 4A.5: Move to Next Subtask**
- Action: If more subtasks exist, repeat STEPS 4A.2-4A.4 for each subtask
- Continue: Until all subtasks are marked as "Done"
- Final Step: Once all subtasks are complete, update parent task status to "Done"

#### **PATH B: If No Subtasks Exist**

**STEP 4B.1: Update Parent Task Status**
- Action: Update the main task status to "In Progress"
- Using: Jira API MCP update function
- Process:
  1. Change task status to "In Progress"
  2. Add comment: "Started work on this task - Branch: [branch-name]"

**STEP 4B.2: Implement the Task**
- Action: Begin development work on the mentioned task
- When Complete: Notify user that task implementation is done
- Proceed to STEP 4B.3

**STEP 4B.3: Update Task Status to Complete**
- Action: Update task status to "Done"
- Using: Jira API MCP update function
- Process:
  1. Change task status to "Done"
  2. Add comment with completion details
  3. Record completion time

---

## Status Workflow Summary

```
Task Mentioned by User
        ↓
    Create Branch
        ↓
    Query Jira Task
        ↓
   Check Subtasks?
    /          \
  YES          NO
  /              \
Update Sub 1    Update Parent Task
to In Progress   to In Progress
  ↓               ↓
Implement     Implement
  ↓               ↓
Update Sub 1   Update Parent Task
to Done         to Done
  ↓
More Subs?
 / \
YES NO → DONE
 ↓
Update Next Sub
(repeat)
```

## Important Guidelines for AI Agent

### When Receiving User Input:
- ✅ Extract the task name clearly
- ✅ Ask for clarification if task name is ambiguous
- ✅ Confirm task found in Jira before proceeding
- ✅ Show user the task details retrieved from Jira

### During Implementation:
- ✅ Keep user informed of status changes
- ✅ Record branch name in Jira comments
- ✅ Log completion details when finished
- ✅ Handle errors gracefully with clear messages

### Status Update Best Practices:
- ✅ Always add descriptive comments with status changes
- ✅ Include branch name in initial "In Progress" comment
- ✅ Add summary/completion notes in "Done" comment
- ✅ Respect existing task assignee and priority

### Error Handling:
- ❌ If task not found: Ask user for task key/ID or different name
- ❌ If API fails: Inform user and suggest manual update
- ❌ If subtask list is empty: Treat as "No Subtasks" path
- ❌ If status transition fails: Check if status already set or invalid transition

---

## Example Conversation Flow

### Example 1: Task with Subtasks
```
USER: "Start working on user authentication"

AGENT: "I'll help you with the user authentication task. Let me fetch the details from Jira..."
→ Creates branch: feature/user-authentication
→ Finds task: AUTH-101
→ Discovers 3 subtasks:
   1. Design login form
   2. Implement authentication API
   3. Add password reset feature

AGENT: "Found 3 subtasks. Starting with 'Design login form'..."
→ Updates subtask status to "In Progress"
→ Implements subtask
→ Updates subtask status to "Done"
→ Moves to next subtask (repeat)

AGENT: "All subtasks completed! Task AUTH-101 is now marked as Done."
```

### Example 2: Task without Subtasks
```
USER: "Start working on fixing login bug"

AGENT: "I'll help you fix the login bug. Let me fetch the details from Jira..."
→ Creates branch: bugfix/login-bug
→ Finds task: BUG-234
→ No subtasks found

AGENT: "Starting work on BUG-234..."
→ Updates task status to "In Progress"
→ Implements the bug fix
→ Updates task status to "Done"

AGENT: "Bug fix completed and task BUG-234 is now marked as Done."
```

---

## Configuration Notes

### Workflow Status IDs (Configure Based on Your Jira):
- **To Do**: 10001 (or default)
- **In Progress**: 3
- **Done/Resolved**: 10000

*Note: Get the correct status IDs from your Jira instance and update the API calls accordingly.*

### Branch Naming Conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `improvement/` - Improvements
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

---

## Checklist for Each Task

- [ ] User mentions task name
- [ ] Agent creates Git branch with proper naming
- [ ] Agent retrieves task details from Jira
- [ ] Agent checks for subtasks
- [ ] Agent updates status to "In Progress" (with branch comment)
- [ ] Agent implements the work
- [ ] Agent updates status to "Done" (with completion comment)
- [ ] User confirms completion
- [ ] Ready for code review and merge

---

## Notes for Team

- All tasks should have clear descriptions in Jira
- Subtasks help break down complex features
- Always link commits to Jira tickets
- Use consistent branch naming for easy tracking
- Add meaningful comments to track progress

---

*Last Updated: 2026*
*Designed for: AI Agent Implementation with Jira API MCP*