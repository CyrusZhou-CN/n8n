import { describe, it, beforeEach, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockModelsResponse } from './__test__/data';
import ChatView from './ChatView.vue';
import { useChatStore } from './chat.store';
import * as chatApi from './chat.api';

/**
 * ChatView.vue Tests
 *
 * Main chat interface where users interact with AI agents
 * Key features:
 * - Display chat messages
 * - Send new messages
 * - Handle streaming responses
 * - Model selection
 * - Session management
 */

// Mock external stores and modules
vi.mock('@/features/settings/users/users.store', () => ({
	useUsersStore: () => ({
		currentUserId: 'user-123',
		currentUser: {
			id: 'user-123',
			firstName: 'Test',
			fullName: 'Test User',
		},
	}),
}));

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
		getCredentialById: vi.fn().mockReturnValue(undefined),
		getCredentialsByType: vi.fn().mockReturnValue([]),
		getCredentialTypeByName: vi.fn().mockReturnValue(undefined),
	}),
}));

vi.mock('./chat.api');

vi.mock('vue-router', async (importOriginal) => {
	const actual = await importOriginal<typeof import('vue-router')>();
	return {
		...actual,
		useRoute: () => ({
			params: {},
			query: {},
		}),
		useRouter: () => ({
			push: vi.fn(),
			resolve: vi.fn(),
		}),
	};
});

const renderComponent = createComponentRenderer(ChatView);

describe('ChatView', () => {
	let pinia: ReturnType<typeof createPinia>;
	let chatStore: ReturnType<typeof useChatStore>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
		chatStore = useChatStore();

		// Mock chat API
		vi.mocked(chatApi.fetchChatModelsApi).mockResolvedValue(createMockModelsResponse());
		vi.mocked(chatApi.fetchSingleConversationApi).mockResolvedValue([]);
		vi.mocked(chatApi.fetchConversationsApi).mockResolvedValue([]);
	});

	describe('Initial rendering', () => {
		it('displays chat starter for new session, conversation header, and prompt input', async () => {
			const { findByRole, findByText, queryByRole } = renderComponent({ pinia });

			// Should not display message list for new session (role="log" is only for existing conversations)
			expect(queryByRole('log')).not.toBeInTheDocument();

			// Should display chat starter greeting
			const greeting = await findByText('Hello, Test!');
			expect(greeting).toBeInTheDocument();

			// Should display prompt input
			const textarea = await findByRole('textbox');
			expect(textarea).toBeInTheDocument();
		});

		it.todo('displays existing messages when loading a conversation');
	});

	describe('Model selection', () => {
		it.todo('pre-selects model from query parameter (agentId or workflowId)');
		it.todo('pre-selects model from local storage when no query parameter');
		it.todo('updates local storage when user selects a model');
	});

	describe('Sending messages', () => {
		it.todo(
			'sends message, calls API, creates new session if needed, and adds user message immediately',
		);
		it.todo('adds optimistic AI message with "running" status and disables input');
	});

	describe('Streaming responses', () => {
		it.todo('updates AI message content as chunks arrive and scrolls to bottom');
		it.todo('shows stop button while streaming and calls stopGeneration API when clicked');
	});

	describe('Message actions', () => {
		it.todo('calls editMessage API when user edits a message');
		it.todo('calls regenerateMessage API when user regenerates a message');
	});

	describe('Missing credentials', () => {
		it.todo('displays credential setup prompt and opens selector modal when clicked');
	});

	describe('Agent editor', () => {
		it.todo('opens agent editor modal and navigates to agent after creation');
	});
});
