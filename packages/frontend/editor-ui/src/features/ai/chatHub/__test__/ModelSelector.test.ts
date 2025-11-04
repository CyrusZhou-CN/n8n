import { describe, it } from 'vitest';

/**
 * ModelSelector.vue Tests
 *
 * Model/Agent selection component
 * Key features:
 * - Display available models grouped by provider
 * - Filter models by search
 * - Select a model
 * - Show credential status
 */

describe('ModelSelector', () => {
	describe('Model list', () => {
		it.todo('displays models grouped by provider with name and description');
		it.todo('filters models by search text across model names');
	});

	describe('Model selection', () => {
		it.todo('emits modelChange event, highlights selected model, and allows changing models');
	});

	describe('Credentials', () => {
		it.todo(
			'shows credential indicator and status (configured/missing) for models requiring credentials',
		);
	});
});
