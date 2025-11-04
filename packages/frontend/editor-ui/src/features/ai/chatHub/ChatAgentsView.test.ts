import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockModelsResponse } from './__test__/data';
import { useChatStore } from './chat.store';
import ChatAgentsView from './ChatAgentsView.vue';
import * as chatApi from './chat.api';

/**
 * ChatAgentsView.vue Tests
 *
 * Agent management interface where users can view, create, edit, and delete agents
 * Key features:
 * - List all agents (custom agents and n8n workflows)
 * - Filter and search agents
 * - Create new custom agents
 * - Edit existing agents
 * - Delete custom agents
 */

vi.mock('@/app/stores/ui.store', () => ({
	useUIStore: () => ({
		openModal: vi.fn(),
		modalsById: {},
	}),
}));

vi.mock('@/features/credentials/credentials.store', () => ({
	useCredentialsStore: () => ({
		fetchCredentialTypes: vi.fn().mockResolvedValue(undefined),
		fetchAllCredentials: vi.fn().mockResolvedValue(undefined),
		getCredentialsByType: vi.fn(() => []),
	}),
}));

vi.mock('vue-router', async (importOriginal) => {
	const actual = await importOriginal<typeof import('vue-router')>();
	return {
		...actual,
		useRoute: () => ({ params: {}, query: {} }),
		useRouter: () => ({ push: vi.fn() }),
	};
});

vi.mock('./chat.api');

const renderComponent = createComponentRenderer(ChatAgentsView);

describe('ChatAgentsView', () => {
	let pinia: ReturnType<typeof createPinia>;
	let chatStore: ReturnType<typeof useChatStore>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
		chatStore = useChatStore();

		vi.mocked(chatApi.fetchChatModelsApi).mockResolvedValue(createMockModelsResponse());
	});

	describe('Agent list', () => {
		it('displays custom agents and n8n workflows with name, description, and metadata', async () => {
			const { container } = renderComponent({ pinia });

			// Wait for agents to load
			await chatStore.fetchAgents({});

			expect(container).toBeInTheDocument();
		});
		it.todo('filters agents by search text and provider');
		it.todo('sorts agents by updated or created date');
	});

	describe('Creating agents', () => {
		it.todo('opens agent editor modal with empty form and displays all fields');
		it.todo(
			'validates required fields (name, system prompt, model) and disables save when invalid',
		);
		it.todo(
			'calls createAgent API, adds agent to list, navigates to it, and shows success message',
		);
	});

	describe('Editing agents', () => {
		it.todo('opens agent editor modal with loaded data for custom agents');
		it.todo('opens workflow editor in new tab for n8n workflows');
		it.todo('calls updateAgent API, updates list, and shows success message');
	});

	describe('Deleting agents', () => {
		it.todo(
			'shows delete button for custom agents only, confirms deletion, calls API, removes from list, and shows success',
		);
	});

	describe('Credentials', () => {
		it.todo('displays credential selector for models requiring credentials and allows selection');
	});
});
