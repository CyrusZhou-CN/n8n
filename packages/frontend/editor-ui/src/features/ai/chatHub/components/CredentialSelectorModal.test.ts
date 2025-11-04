import { describe, it } from 'vitest';

/**
 * CredentialSelectorModal.vue Tests
 *
 * Modal for selecting/managing credentials for LLM providers
 * Key features:
 * - Display available credentials for a provider
 * - Select a credential
 * - Create new credential
 */

describe('CredentialSelectorModal', () => {
	describe('Credential selection', () => {
		it.todo(
			'displays modal with provider name, available credentials, and highlights selected one',
		);
		it.todo('emits credentialSelected event and closes modal when selecting a credential');
	});

	describe('Creating credentials', () => {
		it.todo('opens credential creation flow and updates list after creation');
	});
});
