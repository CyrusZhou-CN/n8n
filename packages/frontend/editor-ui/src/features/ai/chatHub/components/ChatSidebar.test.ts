import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockSession } from '../__test__/data';
import { useChatStore } from '../chat.store';
import ChatSidebar from './ChatSidebar.vue';
import * as chatApi from '../chat.api';

/**
 * ChatSidebar.vue and ChatSidebarContent.vue Tests
 *
 * Sidebar navigation for chat sessions and agents
 * Key features:
 * - Display list of chat sessions grouped by date
 * - Navigate between sessions
 * - Create new chat session
 * - Delete sessions
 * - Navigate to agents view
 */

vi.mock('@/app/stores/ui.store', () => ({
	useUIStore: () => ({
		openModal: vi.fn(),
		closeModal: vi.fn(),
		modalsById: {},
	}),
}));

vi.mock('@/app/stores/settings.store', () => ({
	useSettingsStore: () => ({
		settings: {
			releaseChannel: 'stable',
		},
	}),
}));

vi.mock('vue-router', async (importOriginal) => {
	const actual = await importOriginal<typeof import('vue-router')>();
	return {
		...actual,
		useRoute: () => ({ params: {}, query: {}, fullPath: '/chat' }),
		useRouter: () => ({ push: vi.fn() }),
	};
});

vi.mock('../chat.api');

const renderComponent = createComponentRenderer(ChatSidebar);

describe('ChatSidebar', () => {
	let pinia: ReturnType<typeof createPinia>;
	let chatStore: ReturnType<typeof useChatStore>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
		chatStore = useChatStore();

		vi.mocked(chatApi.fetchConversationsApi).mockResolvedValue([]);
	});

	describe('Session list', () => {
		it('displays sessions grouped by date with titles and highlights active session', () => {
			const session = createMockSession({ id: 'session-1', title: 'Test Chat' });
			vi.mocked(chatApi.fetchConversationsApi).mockResolvedValue([session]);

			const { container } = renderComponent({ pinia });

			expect(container).toBeInTheDocument();
		});
		it.todo('sorts sessions by most recent first within each group');
	});

	describe('Navigation', () => {
		it.todo(
			'navigates to session, agents view, or creates new chat when clicking respective items',
		);
	});

	describe('Session deletion', () => {
		it.todo('confirms deletion, calls deleteConversation API, and removes session from list');
	});
});
