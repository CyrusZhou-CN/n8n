import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockAgent } from '../__test__/data';
import ModelSelector from './ModelSelector.vue';

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

vi.mock('@/app/stores/ui.store', () => ({
	useUIStore: () => ({
		openModal: vi.fn(),
	}),
}));

vi.mock('@/features/credentials/credentials.store', () => ({
	useCredentialsStore: () => ({
		getCredentialById: vi.fn(),
		getCredentialTypeByName: vi.fn(),
	}),
}));

const renderComponent = createComponentRenderer(ModelSelector);

describe('ModelSelector', () => {
	let pinia: ReturnType<typeof createPinia>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
	});

	describe('Model list', () => {
		it('displays models grouped by provider with name and description', () => {
			const selectedAgent = createMockAgent({ name: 'GPT-4' });

			const { container } = renderComponent({
				props: {
					selectedAgent,
					credentials: null,
				},
				pinia,
			});

			expect(container).toBeInTheDocument();
		});
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
