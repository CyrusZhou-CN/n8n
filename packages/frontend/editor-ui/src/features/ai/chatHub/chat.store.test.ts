import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useChatStore } from './chat.store';
import { createMockModelsResponse } from './__test__/data';
import * as chatApi from './chat.api';

/**
 * chat.store.ts Tests
 *
 * Pinia store for chat state management
 * Key features:
 * - Manage agents/models
 * - Manage sessions
 * - Manage conversations and messages
 * - Handle streaming state
 * - API interactions (mocked)
 */

vi.mock('./chat.api');

describe('useChatStore', () => {
	let pinia: ReturnType<typeof createPinia>;
	let chatStore: ReturnType<typeof useChatStore>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
		chatStore = useChatStore();
	});

	describe('Agent operations', () => {
		it('fetches agents, stores them, and sets agentsReady flag', async () => {
			const mockResponse = createMockModelsResponse();
			vi.mocked(chatApi.fetchChatModelsApi).mockResolvedValue(mockResponse);

			expect(chatStore.agentsReady).toBe(false);

			await chatStore.fetchAgents({});

			expect(chatStore.agentsReady).toBe(true);
			expect(chatStore.agents).toEqual(mockResponse);
		});
		it.todo('creates custom agent and adds to agents list');
		it.todo('updates custom agent and updates in agents list');
		it.todo('deletes custom agent and removes from agents list');
	});

	describe('Session operations', () => {
		it.todo('fetches sessions and stores them in state');
		it.todo('deletes session and removes from sessions list');
		it.todo('updates session title');
	});

	describe('Message operations', () => {
		it.todo('fetches messages, stores in conversation map, and computes active message chain');
		it.todo('sends message with user message and optimistic AI message with "running" status');
		it.todo('handles streaming responses and updates AI message content as chunks arrive');
		it.todo('edits message via API and creates new AI response');
		it.todo('regenerates message via API and creates alternative AI message');
		it.todo('stops generation via API and updates message status');
	});

	describe('Helper methods', () => {
		it.todo('getAgent returns correct agent by model reference');
		it.todo('isResponding returns correct status based on last message');
	});
});
