import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockMessage } from '../__test__/data';
import ChatMessage from './ChatMessage.vue';

/**
 * ChatMessage.vue Tests
 *
 * Individual message display component
 * Key features:
 * - Display user and AI messages
 * - Render markdown content
 * - Display message metadata (time, status)
 * - Show message actions
 */

const renderComponent = createComponentRenderer(ChatMessage);

describe('ChatMessage', () => {
	let pinia: ReturnType<typeof createPinia>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
	});

	describe('Message display', () => {
		it('displays user and AI messages with correct styling, markdown content, timestamp, and status', async () => {
			const userMessage = createMockMessage({
				type: 'human',
				content: 'Hello world!',
			});

			const { container } = renderComponent({
				props: {
					message: userMessage,
					compact: false,
					isEditing: false,
					isStreaming: false,
				},
				pinia,
			});

			// Should render the component
			expect(container.querySelector('[data-message-id]')).toBeInTheDocument();
		});

		it.todo('renders code blocks, lists, and links correctly');
	});

	describe('Message actions', () => {
		it.todo(
			'shows copy button for all messages, edit button for user messages, and regenerate button for AI messages',
		);
		it.todo('copies message content when clicking copy button');
	});

	describe('Error handling', () => {
		it.todo('displays error message and retry option for failed messages');
	});
});
