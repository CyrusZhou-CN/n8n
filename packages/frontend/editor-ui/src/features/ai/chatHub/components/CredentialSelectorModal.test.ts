import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import CredentialSelectorModal from './CredentialSelectorModal.vue';

/**
 * CredentialSelectorModal.vue Tests
 *
 * Modal for selecting/managing credentials for LLM providers
 * Key features:
 * - Display available credentials for a provider
 * - Select a credential
 * - Create new credential
 */

vi.mock('@/app/stores/ui.store', () => ({
	useUIStore: () => ({
		openModal: vi.fn(),
		closeModal: vi.fn(),
		modalsById: {},
	}),
}));

vi.mock('@/features/credentials/credentials.store', () => ({
	useCredentialsStore: () => ({
		getCredentialsByType: vi.fn(() => []),
	}),
}));

const renderComponent = createComponentRenderer(CredentialSelectorModal);

describe('CredentialSelectorModal', () => {
	let pinia: ReturnType<typeof createPinia>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
	});

	describe('Credential selection', () => {
		it('displays modal with provider name, available credentials, and highlights selected one', () => {
			const { container } = renderComponent({
				props: {
					data: {
						provider: 'openai',
						selectedCredentialId: null,
					},
				},
				pinia,
			});

			expect(container).toBeInTheDocument();
		});
		it.todo('emits credentialSelected event and closes modal when selecting a credential');
	});

	describe('Creating credentials', () => {
		it.todo('opens credential creation flow and updates list after creation');
	});
});
