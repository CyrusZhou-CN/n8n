import { describe, it, beforeEach, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockModelsResponse } from './__test__/data';
import ChatView from './ChatView.vue';
import { useChatStore } from './chat.store';
import * as chatApi from './chat.api';
import userEvent from '@testing-library/user-event';

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

// Global mock - can be overridden in specific tests
const mockRoute = {
	params: {},
	query: {},
};

vi.mock('vue-router', async (importOriginal) => {
	const actual = await importOriginal<typeof import('vue-router')>();
	return {
		...actual,
		useRoute: () => mockRoute,
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
		it('sends message, calls API, creates new session if needed, and adds user message immediately', async () => {
			const user = userEvent.setup();

			// Mock agents with a custom-agent (doesn't require credentials)
			const mockModelsResponse = createMockModelsResponse({
				'custom-agent': {
					models: [
						{
							name: 'Test Custom Agent',
							description: 'A test custom agent',
							model: { provider: 'custom-agent', agentId: 'agent-123' },
							updatedAt: '2024-01-15T12:00:00Z',
						},
					],
				},
			});
			vi.mocked(chatApi.fetchChatModelsApi).mockResolvedValue(mockModelsResponse);

			// Set route query parameter to select the custom agent
			mockRoute.query = { agentId: 'agent-123' };

			// Mock sendMessage API to return a stream-like response
			vi.mocked(chatApi.sendMessageApi).mockImplementation(async () => {
				return {
					sessionId: 'new-session-id',
					messageId: 'ai-message-id',
					promptId: 'prompt-id',
					stream: (async function* () {
						yield { type: 'chunk', data: { content: 'Hello! ' } };
						yield { type: 'chunk', data: { content: 'How can I help?' } };
					})(),
				} as any;
			});

			const { findByRole, findByText } = renderComponent({ pinia });

			// Wait for component to be ready and agents loaded
			await chatStore.fetchAgents({});

			// Find the textarea
			const textarea = (await findByRole('textbox')) as HTMLTextAreaElement;
			expect(textarea).toBeInTheDocument();

			// Type a message and press Enter
			await user.click(textarea);
			await user.type(textarea, 'Hello, AI!{Enter}');

			// Wait a bit for the store action to process and re-render
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Verify the input was cleared (basic interaction test)
			expect(textarea.value).toBe('');

			// Verify sendMessageApi was called
			expect(chatApi.sendMessageApi).toHaveBeenCalled();

			// Get the session ID that was actually used
			const sendMessageCall = vi.mocked(chatApi.sendMessageApi).mock.calls[0];
			const actualSessionId = sendMessageCall?.[1]?.sessionId;

			// Verify the message was added to the store
			const messages = chatStore.getActiveMessages(actualSessionId);
			expect(messages).toHaveLength(1);
			expect(messages[0]).toMatchObject({
				type: 'human',
				content: 'Hello, AI!',
			});

			// Verify the sendMessageApi was called with correct parameters
			expect(chatApi.sendMessageApi).toHaveBeenCalledWith(
				expect.anything(), // restApiContext
				expect.objectContaining({
					message: 'Hello, AI!',
					model: { provider: 'custom-agent', agentId: 'agent-123' },
					sessionId: expect.any(String),
					credentials: {},
				}),
				expect.any(Function), // onStreamMessage
				expect.any(Function), // onStreamDone
				expect.any(Function), // onStreamError
			);
		});
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
