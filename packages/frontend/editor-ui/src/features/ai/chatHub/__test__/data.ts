import type {
	ChatModelsResponse,
	ChatModelDto,
	ChatHubSessionDto,
	ChatHubMessageDto,
} from '@n8n/api-types';
import type { ChatMessage } from '../chat.types';

export const createMockAgent = (overrides: Partial<ChatModelDto> = {}): ChatModelDto => ({
	name: 'Test Agent',
	description: 'A test agent',
	model: { provider: 'openai', model: 'gpt-4' },
	updatedAt: '2024-01-15T12:00:00Z',
	...overrides,
});

export const createMockModelsResponse = (
	overrides: Partial<ChatModelsResponse> = {},
): ChatModelsResponse => ({
	openai: {
		models: [
			createMockAgent({
				name: 'GPT-4',
				model: { provider: 'openai', model: 'gpt-4' },
			}),
		],
	},
	anthropic: { models: [] },
	google: { models: [] },
	'custom-agent': { models: [] },
	n8n: { models: [] },
	...overrides,
});

export const createMockSession = (
	overrides: Partial<ChatHubSessionDto> = {},
): ChatHubSessionDto => ({
	id: 'session-123',
	title: 'Test Conversation',
	createdAt: '2024-01-15T12:00:00Z',
	updatedAt: '2024-01-15T12:00:00Z',
	provider: 'openai',
	model: 'gpt-4',
	workflowId: null,
	agentId: null,
	...overrides,
});

export const createMockMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
	id: 'message-123',
	sessionId: 'session-123',
	type: 'human',
	name: 'User',
	content: 'Test message',
	status: 'success',
	executionId: null,
	previousMessageId: null,
	retryOfMessageId: null,
	revisionOfMessageId: null,
	provider: null,
	model: null,
	createdAt: '2024-01-15T12:00:00Z',
	responses: [],
	alternatives: [],
	...overrides,
});
