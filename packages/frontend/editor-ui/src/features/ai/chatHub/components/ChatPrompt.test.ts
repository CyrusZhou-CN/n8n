import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createComponentRenderer } from '@/__tests__/render';
import { createMockAgent } from '../__test__/data';
import ChatPrompt from './ChatPrompt.vue';

/**
 * ChatPrompt.vue Tests
 *
 * Message input component
 * Key features:
 * - Text input for messages
 * - Voice input support
 * - Submit message
 * - Stop generation
 * - Model selection trigger
 */

const renderComponent = createComponentRenderer(ChatPrompt);

describe('ChatPrompt', () => {
	let pinia: ReturnType<typeof createPinia>;

	beforeEach(() => {
		pinia = createPinia();
		setActivePinia(pinia);
	});

	describe('Input display', () => {
		it('displays textarea with dynamic placeholder based on selected model', async () => {
			const selectedModel = createMockAgent({ name: 'GPT-4' });

			const { findByRole } = renderComponent({
				props: {
					isResponding: false,
					isNewSession: true,
					selectedModel,
					isMissingCredentials: false,
				},
				pinia,
			});

			const textarea = await findByRole('textbox');
			expect(textarea).toBeInTheDocument();
			expect(textarea).toHaveAttribute('placeholder', 'Message GPT-4...');
		});
	});

	describe('Message submission', () => {
		it.todo(
			'submits message on Enter key or button click, trims whitespace, clears input, and does not submit empty messages',
		);
		it.todo('adds new line when pressing Shift+Enter');
	});

	describe('Voice input', () => {
		it.todo(
			'toggles voice recognition on microphone button click and updates textarea with speech',
		);
		it.todo('shows error toast when microphone access is denied or no speech detected');
	});

	describe('Stop generation', () => {
		it.todo('shows stop button when AI is responding and emits stop event when clicked');
	});

	describe('Model and credentials', () => {
		it.todo('disables input when no model selected and emits selectModel event');
		it.todo(
			'displays credential setup button when credentials missing and emits setCredentials event',
		);
	});
});
