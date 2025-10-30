# How to Install AI Coding Rules

## Option 1: Global Rules (Recommended - Works for ALL Projects)

These rules will apply to every project you work on in Cursor.

### Steps:

1. **Open Cursor Settings:**
   - Press `Cmd + ,` (Mac) or `Ctrl + ,` (Windows/Linux)
   - Or click: Cursor → Settings (Mac) / File → Preferences → Settings (Windows/Linux)

2. **Navigate to Cursor Settings:**
   - In the search bar, type: `cursor rules`
   - Or look for: `Cursor` → `General` → `Rules for AI`

3. **Add Global Rules:**
   - Find the setting called **"Cursor: Rules for AI"**
   - Click "Edit in settings.json"
   - Add the following:

```json
{
  "cursor.general.rulesForAI": "# AI Coding Rules for Website Development\n\n## Code Modification Guidelines\n\n### 1. Always Preserve Code Structure\n- Never delete code unless explicitly requested\n- When disabling features, comment out code with clear markers like `/* TEMPORARILY DISABLED */`\n- Maintain consistent indentation and formatting as in the original file\n\n### 2. Make Targeted Changes\n- Modify only the specific files and sections related to the task\n- Avoid unnecessary refactoring unless it's part of the request\n- Keep changes minimal and focused on the requested feature or fix\n\n### 3. Test After Changes\n- Run build command after significant changes to ensure no compilation errors\n- Check for linter errors using read_lints tool when appropriate\n- Verify that the changes don't break existing functionality\n\n### 4. Maintain Code Quality\n- Follow existing code patterns and conventions in the project\n- Use meaningful variable and function names\n- Add comments for complex logic or temporary modifications\n\n### 5. Handle Dependencies Carefully\n- Don't modify package.json unless explicitly requested\n- Don't update dependencies without user approval\n- Preserve all existing imports and don't remove unused ones without confirmation\n\n### 6. Respect Project Configuration\n- Don't modify configuration files (.env, vite.config, tsconfig, etc.) unless requested\n- Preserve all API keys, webhooks, and external service configurations\n- Don't change build settings without explicit instruction\n\n### 7. Track Changes Systematically\n- Use TODO lists for multi-step tasks\n- Update TODOs as progress is made\n- Keep user informed about progress without being overly verbose\n\n### 8. Documentation\n- When making significant changes, create or update relevant documentation files\n- Use clear, descriptive commit-style messages when explaining changes\n- Document any temporary modifications that need to be reverted later\n\n---\n\n## 📋 MANDATORY: Summary of Modified Files\n\n**At the end of every response where code changes were made, you MUST include a section listing all modified files:**\n\nExample format:\n\n## 📝 Modified Files\n\nThe following files were modified in this session:\n\n1. `path/to/file1.tsx` - Brief description of changes\n2. `path/to/file2.ts` - Brief description of changes\n3. `path/to/file3.md` - Brief description of changes\n\n**Total files modified:** X\n\nThis section must:\n- List ALL files that were created, modified, or deleted\n- Include full relative path from project root\n- Provide a brief description of what was changed in each file\n- Be placed at the very end of the response\n- Use clear formatting with file paths in code blocks"
}
```

4. **Save the settings**

---

## Option 2: Project-Specific Rules (For Current Project Only)

These rules will only apply to the current project.

### Steps:

1. **Create `.cursorrules` file in project root:**

```bash
cd "/Users/andrey/Cursor проэкты/Norda_cursor"
touch .cursorrules
```

2. **Copy the content from `AI-CODING-RULES.md`** and paste it into `.cursorrules`

3. **Restart Cursor** to apply the rules

---

## Option 3: Easy Copy-Paste Method (Global Rules)

### For Mac Users:

1. Open Terminal
2. Run these commands:

```bash
# Open Cursor settings file
open ~/Library/Application\ Support/Cursor/User/settings.json
```

3. In the opened JSON file, find or add `cursor.general.rulesForAI` and paste the rules

### For Windows Users:

1. Press `Win + R`
2. Type: `%APPDATA%\Cursor\User\settings.json`
3. Press Enter
4. In the opened JSON file, find or add `cursor.general.rulesForAI` and paste the rules

### For Linux Users:

1. Open Terminal
2. Run:

```bash
nano ~/.config/Cursor/User/settings.json
```

3. Add the rules under `cursor.general.rulesForAI`

---

## Verification

After installing the rules, verify they're working:

1. Start a new chat with Cursor AI
2. Ask to make a simple code change
3. Check if the AI includes the "📝 Modified Files" section at the end

---

## Notes

- **Global rules** are recommended because they apply to all your projects
- You can combine both global and project-specific rules
- Project-specific rules (`.cursorrules`) take precedence over global rules
- Rules are applied automatically - no need to mention them in each request

---

**Last Updated:** October 29, 2025

