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