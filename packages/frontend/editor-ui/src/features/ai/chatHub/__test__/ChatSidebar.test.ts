import { describe, it } from 'vitest';

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

describe('ChatSidebar', () => {
	describe('Session list', () => {
		it.todo('displays sessions grouped by date with titles and highlights active session');
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
