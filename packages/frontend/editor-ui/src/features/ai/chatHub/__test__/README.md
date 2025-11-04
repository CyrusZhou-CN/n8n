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
- Test files are collocated with source files (not in `__test__/` directory)
- For utility function tests, use function references in describe() calls: `describe(functionName, () => {})`
- Define common helpers and test data in `__test__/data.ts`
- Selector priority:
	1. Based on accessibility features, e.g. `getByRole`
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

Test files are collocated with their source modules in the `chatHub/` directory.

#### Completed Tests
- ✅ `chat.utils.test.ts` - 12 tests passing (utility functions)

#### Pending Tests
- ⏳ `ChatView.test.ts` - 11 todo tests
- ⏳ `ChatAgentsView.test.ts` - 8 todo tests
- ⏳ `ChatSidebar.test.ts` - 4 todo tests
- ⏳ `ChatMessage.test.ts` - 5 todo tests
- ⏳ `ChatPrompt.test.ts` - 8 todo tests
- ⏳ `chat.store.test.ts` - 10 todo tests
- ⏳ `ModelSelector.test.ts` - 4 todo tests
- ⏳ `CredentialSelectorModal.test.ts` - 3 todo tests