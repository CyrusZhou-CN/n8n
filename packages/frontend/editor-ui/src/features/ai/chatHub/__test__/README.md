# UI testing

## Overview

Your mission is to bring code coverage under the chatHub folder to above 95%.

## Way of working

1. Understand features
2. Identify test cases (create as `it.todo()`) and get reviewed
	- If a module's behavior is covered by tests for other modules, you don't need to have tests for that module.
	- Focus on use cases, DO NOT try to test contract between modules.
	- Focus on happy path.
3. Once approved, implement tests

## Coding guide

- DO NOT mock modules such as Vue components and stores. Exception: `chat.api.ts`
- For each module you want to mock, ask for permission first
- If browser API is missing, add to `packages/frontend/editor-ui/src/__tests__/setup.ts` (not in individual test files)
- Test files are collocated with source files (not in `__test__/` directory)
- For utility function tests, use function references in describe() calls: `describe(functionName, () => {})`
- Define common helpers and test data in `__test__/data.ts`
- Selector priority:
	1. Based on accessibility features, e.g. `getByRole`, `getByText`
	2. Based on test ID `getByTestId`
	3. `querySelector`
- Do assert:
	- What is displayed in UI
	- API requests for mutations, such as
		- Create agent
		- Update agent
		- ...
- Do NOT assert:
	- Calls of functions using `toHaveBeenCalled`

## Measuring Coverage

### Run tests with coverage

From the `packages/frontend/editor-ui` directory:

```bash
# Run all chatHub tests with coverage
pnpm test --coverage --run src/features/ai/chatHub

# Run specific test file
pnpm test --coverage --run src/features/ai/chatHub/__test__/chat.utils.test.ts
```

### View coverage report

After running tests with coverage, a coverage report will be generated. To view it:

```bash
# Open coverage report in browser (if generated)
open coverage/index.html
```

### Check coverage for specific files

To see coverage for the chatHub folder specifically, look for the coverage output in the terminal after running tests. The output will show:

- **Statements**: Percentage of executable statements covered
- **Branches**: Percentage of conditional branches covered
- **Functions**: Percentage of functions covered
- **Lines**: Percentage of lines covered

**Target**: All metrics should be above **95%** for the chatHub folder.

### Current Status

**Overall Coverage:**
- Statements: 34.53% (5955/17241)
- Branches: 68.43% (310/453)
- Functions: 9.4% (87/925)
- Lines: 34.53% (5955/17241)

**Test Files Status:**

Test files are collocated with their source modules in the `chatHub/` directory.

| Module | Tests Passing | Tests Todo | Status |
|--------|--------------|------------|--------|
| `chat.utils.test.ts` | 12 | 0 | ✅ Complete |
| `chat.store.test.ts` | 2 | 13 | 🟡 In Progress |
| `ChatView.test.ts` | 2 | 11 | 🟡 In Progress |
| `ChatAgentsView.test.ts` | 1 | 10 | 🟡 Started |
| `ChatMessage.test.ts` | 1 | 4 | 🟡 Started |
| `ChatPrompt.test.ts` | 1 | 7 | 🟡 Started |
| `ChatSidebar.test.ts` | 1 | 3 | 🟡 Started |
| `ModelSelector.test.ts` | 1 | 3 | 🟡 Started |
| `CredentialSelectorModal.test.ts` | 1 | 2 | 🟡 Started |

**Total:** 22 tests passing | 53 tests todo

## Progress Notes

### 2025-11-04
- **Coverage Progress**: 33.33% → 34.53% statements (+1.2%)
- **Tests Added**: Message sending test in `ChatView.test.ts`
  - Verifies user can send a message
  - Verifies input clears after submission
  - Verifies message is added to store
  - Verifies API is called with correct parameters
- **Key Testing Pattern**: Use custom-agent or n8n workflow agents to bypass credential requirements
- **Next Steps**: Continue implementing component tests focusing on user interactions