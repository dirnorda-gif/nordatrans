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

### 9. Response Style: Brief by Default
- **Default:** Give concise, to-the-point answers
- **Detailed mode:** Only provide comprehensive explanations when user explicitly uses keywords:
  - "расскажи подробно"
  - "опиши подробно"
  - "объясни подробно"
  - "покажи подробно"
- **Brief examples:**
  - Question: "Как запустить сервер?" → Answer: "npm run dev"
  - Question: "Где посмотреть токены?" → Answer: "Settings → Account → Usage"
- **Detailed examples:**
  - Question: "Расскажи подробно как работает калькулятор" → Full explanation with code examples

### 10. ⚠️ КРИТИЧЕСКИ ВАЖНО: Тарифы и Кэш маршрутов
**При изменении тарифов в `tariffConfig` или коэффициентов в `weightCoefficients`:**

1. **ОБЯЗАТЕЛЬНО увеличьте версию тарифов:**
   ```typescript
   // В src/utils/shippingCalculator.ts
   export const TARIFF_VERSION = "1.0.1"; // ← Увеличьте версию!
   export const TARIFF_UPDATED_AT = "2025-01-29"; // ← Обновите дату
   ```

2. **НАПОМИНАНИЕ ПЕРЕД ДЕПЛОЕМ:**
   - ⚠️ **НЕ ДЕПЛОЙТЬ** изменения на сайт, пока не обновлен `routeCache.json`!
   - ⚠️ Аккордеон будет показывать **УСТАРЕВШИЕ** цены
   - ⚠️ Калькулятор будет показывать **НОВЫЕ** цены
   - ⚠️ Будет **НЕСООТВЕТСТВИЕ** между аккордеоном и калькулятором

3. **Перед деплоем ОБЯЗАТЕЛЬНО:**
   - ✅ Пересчитать все цены для маршрутов
   - ✅ Обновить `src/data/routeCache.json` с новыми ценами
   - ✅ Установить `"tariffVersion": "X.X.X"` (совпадает с TARIFF_VERSION)
   - ✅ Увеличить `"version"` в routeCache.json
   - ✅ Обновить `"generatedAt"`

4. **Проверка:**
   - После обновления routeCache.json в консоли должно появиться:
     ```
     ✅ Версия тарифов совпадает (X.X.X) - кэш актуален
     ```
   - Если видите 🚨 предупреждение - кэш НЕ обновлен!

5. **См. подробную инструкцию:** `ИНСТРУКЦИЯ-ВЕРСИОНИРОВАНИЕ-ТАРИФОВ.md`

**Правило действует при изменении:**
- Любого тарифа в `tariffConfig` (даже одного значения)
- Коэффициентов в `weightCoefficients`
- Добавлении/удалении маршрутов

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

**Version:** 1.2  
**Last Updated:** November 3, 2025

