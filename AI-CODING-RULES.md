# AI Coding Rules for Website Development

## Code Modification Guidelines

### 1. Always Preserve Code Structure
- Never delete code unless explicitly requested
- When disabling features, comment out code with clear markers like `/* TEMPORARILY DISABLED */`
- Maintain consistent indentation and formatting as in the original file

### 2. Make Targeted Changes
- Modify only the specific files and sections related to the task
- Avoid unnecessary refactoring unless it's part of the request
- Keep changes minimal and focused on the requested feature or fix

### 3. Test After Changes
- Run build command after significant changes to ensure no compilation errors
- Check for linter errors using read_lints tool when appropriate
- Verify that the changes don't break existing functionality

### 4. Maintain Code Quality
- Follow existing code patterns and conventions in the project
- Use meaningful variable and function names
- Add comments for complex logic or temporary modifications

### 5. Handle Dependencies Carefully
- Don't modify package.json unless explicitly requested
- Don't update dependencies without user approval
- Preserve all existing imports and don't remove unused ones without confirmation

### 6. Respect Project Configuration
- Don't modify configuration files (.env, vite.config, tsconfig, etc.) unless requested
- Preserve all API keys, webhooks, and external service configurations
- Don't change build settings without explicit instruction

### 7. Track Changes Systematically
- Use TODO lists for multi-step tasks
- Update TODOs as progress is made
- Keep user informed about progress without being overly verbose

### 8. Documentation
- When making significant changes, create or update relevant documentation files
- Use clear, descriptive commit-style messages when explaining changes
- Document any temporary modifications that need to be reverted later

---

## 📋 MANDATORY: Summary of Modified Files

**At the end of every response where code changes were made, you MUST include a section listing all modified files:**

```markdown
## 📝 Modified Files

The following files were modified in this session:

1. `path/to/file1.tsx` - Brief description of changes
2. `path/to/file2.ts` - Brief description of changes
3. `path/to/file3.md` - Brief description of changes

**Total files modified:** X
```

This section must:
- List ALL files that were created, modified, or deleted
- Include full relative path from project root
- Provide a brief description of what was changed in each file
- Be placed at the very end of the response
- Use clear formatting with file paths in code blocks

---

**Version:** 1.0  
**Last Updated:** October 29, 2025

