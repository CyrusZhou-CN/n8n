import { describe, it, expect } from 'vitest';
import type { ChatModelsResponse, ChatHubSessionDto, ChatModelDto } from '@n8n/api-types';
import {
	findOneFromModelsResponse,
	getRelativeDate,
	groupConversationsByDate,
	getAgentRoute,
	flattenModel,
	unflattenModel,
	filterAndSortAgents,
	stringifyModel,
	fromStringToModel,
	isMatchedAgent,
	createAiMessageFromStreamingState,
} from './chat.utils';
import type { ChatAgentFilter } from './chat.types';
import { CHAT_VIEW } from './constants';

describe('chat.utils', () => {
	describe(findOneFromModelsResponse, () => {
		it('returns first available model or undefined when none available', () => {
			const responseWithModels: ChatModelsResponse = {
				openai: {
					models: [
						{ name: 'GPT-4', model: { provider: 'openai', model: 'gpt-4' } } as ChatModelDto,
					],
				},
				anthropic: { models: [] },
				google: { models: [] },
				'custom-agent': { models: [] },
				n8n: { models: [] },
			};

			const result = findOneFromModelsResponse(responseWithModels);
			expect(result).toEqual({ name: 'GPT-4', model: { provider: 'openai', model: 'gpt-4' } });

			const emptyResponse: ChatModelsResponse = {
				openai: { models: [] },
				anthropic: { models: [] },
				google: { models: [] },
				'custom-agent': { models: [] },
				n8n: { models: [] },
			};

			expect(findOneFromModelsResponse(emptyResponse)).toBeUndefined();
		});
	});

	describe(getRelativeDate, () => {
		it('returns correct relative date category (Today, Yesterday, This week, Older)', () => {
			const now = new Date('2024-01-15T12:00:00Z');

			// Today
			expect(getRelativeDate(now, '2024-01-15T10:00:00Z')).toBe('Today');

			// Yesterday
			expect(getRelativeDate(now, '2024-01-14T10:00:00Z')).toBe('Yesterday');

			// This week (within 7 days)
			expect(getRelativeDate(now, '2024-01-10T10:00:00Z')).toBe('This week');
			expect(getRelativeDate(now, '2024-01-09T10:00:00Z')).toBe('This week');

			// Older (more than 7 days ago)
			expect(getRelativeDate(now, '2024-01-07T10:00:00Z')).toBe('Older');
			expect(getRelativeDate(now, '2024-01-01T10:00:00Z')).toBe('Older');
		});
	});

	describe(groupConversationsByDate, () => {
		it('groups sessions by relative date, orders by Today/Yesterday/This week/Older, and sorts within groups by most recent', () => {
			const sessions: ChatHubSessionDto[] = [
				{ id: '1', updatedAt: new Date().toISOString(), title: 'Today 1' } as ChatHubSessionDto,
				{
					id: '2',
					updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
					title: 'Yesterday 1',
				} as ChatHubSessionDto,
				{
					id: '3',
					updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
					title: 'This week 1',
				} as ChatHubSessionDto,
				{
					id: '4',
					updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
					title: 'Older 1',
				} as ChatHubSessionDto,
			];

			const grouped = groupConversationsByDate(sessions);

			expect(grouped).toHaveLength(4);
			expect(grouped[0].group).toBe('Today');
			expect(grouped[1].group).toBe('Yesterday');
			expect(grouped[2].group).toBe('This week');
			expect(grouped[3].group).toBe('Older');

			// Verify each group has sessions
			for (const group of grouped) {
				expect(group.sessions.length).toBeGreaterThan(0);
			}
		});
	});

	describe(getAgentRoute, () => {
		it('returns route with workflowId for n8n, agentId for custom-agent, or base route for others', () => {
			const n8nRoute = getAgentRoute({ provider: 'n8n', workflowId: 'workflow-123' });
			expect(n8nRoute).toEqual({
				name: CHAT_VIEW,
				query: { workflowId: 'workflow-123' },
			});

			const customAgentRoute = getAgentRoute({
				provider: 'custom-agent',
				agentId: 'agent-456',
			});
			expect(customAgentRoute).toEqual({
				name: CHAT_VIEW,
				query: { agentId: 'agent-456' },
			});

			const llmRoute = getAgentRoute({ provider: 'openai', model: 'gpt-4' });
			expect(llmRoute).toEqual({
				name: CHAT_VIEW,
			});
		});
	});

	describe(flattenModel, () => {
		it('flattens models (n8n, custom-agent, LLM provider) correctly', () => {
			const n8nModel = flattenModel({ provider: 'n8n', workflowId: 'wf-123' });
			expect(n8nModel).toEqual({
				provider: 'n8n',
				model: null,
				workflowId: 'wf-123',
				agentId: null,
			});

			const customAgentModel = flattenModel({ provider: 'custom-agent', agentId: 'agent-123' });
			expect(customAgentModel).toEqual({
				provider: 'custom-agent',
				model: null,
				workflowId: null,
				agentId: 'agent-123',
			});

			const llmModel = flattenModel({ provider: 'openai', model: 'gpt-4' });
			expect(llmModel).toEqual({
				provider: 'openai',
				model: 'gpt-4',
				workflowId: null,
				agentId: null,
			});
		});
	});

	describe(unflattenModel, () => {
		it('unflattens models (n8n, custom-agent, LLM provider) correctly and returns null for invalid', () => {
			const n8nModel = unflattenModel({
				provider: 'n8n',
				model: null,
				workflowId: 'wf-123',
				agentId: null,
			});
			expect(n8nModel).toEqual({ provider: 'n8n', workflowId: 'wf-123' });

			const customAgentModel = unflattenModel({
				provider: 'custom-agent',
				model: null,
				workflowId: null,
				agentId: 'agent-123',
			});
			expect(customAgentModel).toEqual({ provider: 'custom-agent', agentId: 'agent-123' });

			const llmModel = unflattenModel({
				provider: 'openai',
				model: 'gpt-4',
				workflowId: null,
				agentId: null,
			});
			expect(llmModel).toEqual({ provider: 'openai', model: 'gpt-4' });

			// Invalid cases
			expect(
				unflattenModel({ provider: null, model: null, workflowId: null, agentId: null }),
			).toBeNull();
			expect(
				unflattenModel({ provider: 'n8n', model: null, workflowId: null, agentId: null }),
			).toBeNull();
			expect(
				unflattenModel({
					provider: 'custom-agent',
					model: null,
					workflowId: null,
					agentId: null,
				}),
			).toBeNull();
		});
	});

	describe(filterAndSortAgents, () => {
		it('filters agents by search text (case insensitive) and provider', () => {
			const agents: ChatModelDto[] = [
				{
					name: 'GPT-4 Agent',
					model: { provider: 'openai', model: 'gpt-4' },
					updatedAt: '2024-01-15',
				} as ChatModelDto,
				{
					name: 'Claude Agent',
					model: { provider: 'anthropic', model: 'claude' },
					updatedAt: '2024-01-14',
				} as ChatModelDto,
				{
					name: 'Custom Bot',
					model: { provider: 'custom-agent', agentId: 'agent-1' },
					updatedAt: '2024-01-13',
				} as ChatModelDto,
			];

			const filter: ChatAgentFilter = {
				search: 'agent',
				provider: '',
				sortBy: 'updatedAt',
			};

			const filtered = filterAndSortAgents(agents, filter);
			expect(filtered).toHaveLength(2);
			expect(filtered.map((a) => a.name)).toEqual(['GPT-4 Agent', 'Claude Agent']);

			const providerFilter: ChatAgentFilter = {
				search: '',
				provider: 'custom-agent',
				sortBy: 'updatedAt',
			};

			const providerFiltered = filterAndSortAgents(agents, providerFilter);
			expect(providerFiltered).toHaveLength(1);
			expect(providerFiltered[0].name).toBe('Custom Bot');
		});

		it('sorts agents by date (updatedAt or createdAt) with newest first and dateless items at end', () => {
			const agents: ChatModelDto[] = [
				{
					name: 'Agent 1',
					model: { provider: 'openai', model: 'gpt-4' },
					updatedAt: '2024-01-10',
				} as ChatModelDto,
				{
					name: 'Agent 2',
					model: { provider: 'openai', model: 'gpt-4' },
					updatedAt: '2024-01-15',
				} as ChatModelDto,
				{
					name: 'Agent 3',
					model: { provider: 'openai', model: 'gpt-4' },
				} as ChatModelDto,
			];

			const filter: ChatAgentFilter = {
				search: '',
				provider: '',
				sortBy: 'updatedAt',
			};

			const sorted = filterAndSortAgents(agents, filter);
			expect(sorted[0].name).toBe('Agent 2');
			expect(sorted[1].name).toBe('Agent 1');
			expect(sorted[2].name).toBe('Agent 3');
		});
	});

	describe(stringifyModel, () => {
		it('stringifies models (n8n, custom-agent, LLM provider) with correct format', () => {
			expect(stringifyModel({ provider: 'n8n', workflowId: 'wf-123' })).toBe('n8n::wf-123');
			expect(stringifyModel({ provider: 'custom-agent', agentId: 'agent-123' })).toBe(
				'custom-agent::agent-123',
			);
			expect(stringifyModel({ provider: 'openai', model: 'gpt-4' })).toBe('openai::gpt-4');
		});
	});

	describe(fromStringToModel, () => {
		it('parses stringified models back correctly and returns undefined for invalid format', () => {
			expect(fromStringToModel('n8n::wf-123')).toEqual({ provider: 'n8n', workflowId: 'wf-123' });
			expect(fromStringToModel('custom-agent::agent-123')).toEqual({
				provider: 'custom-agent',
				agentId: 'agent-123',
			});
			expect(fromStringToModel('openai::gpt-4')).toEqual({ provider: 'openai', model: 'gpt-4' });

			// Invalid provider
			expect(fromStringToModel('invalid-provider::model')).toBeUndefined();
		});
	});

	describe(isMatchedAgent, () => {
		it('returns true when agent matches by workflowId, agentId, or provider+model, false otherwise', () => {
			const n8nAgent: ChatModelDto = {
				name: 'n8n Agent',
				model: { provider: 'n8n', workflowId: 'wf-123' },
			} as ChatModelDto;

			expect(isMatchedAgent(n8nAgent, { provider: 'n8n', workflowId: 'wf-123' })).toBe(true);
			expect(isMatchedAgent(n8nAgent, { provider: 'n8n', workflowId: 'wf-456' })).toBe(false);

			const customAgent: ChatModelDto = {
				name: 'Custom Agent',
				model: { provider: 'custom-agent', agentId: 'agent-123' },
			} as ChatModelDto;

			expect(isMatchedAgent(customAgent, { provider: 'custom-agent', agentId: 'agent-123' })).toBe(
				true,
			);
			expect(isMatchedAgent(customAgent, { provider: 'custom-agent', agentId: 'agent-456' })).toBe(
				false,
			);

			const llmAgent: ChatModelDto = {
				name: 'GPT-4',
				model: { provider: 'openai', model: 'gpt-4' },
			} as ChatModelDto;

			expect(isMatchedAgent(llmAgent, { provider: 'openai', model: 'gpt-4' })).toBe(true);
			expect(isMatchedAgent(llmAgent, { provider: 'openai', model: 'gpt-3.5' })).toBe(false);
		});
	});

	describe(createAiMessageFromStreamingState, () => {
		it('creates AI message with default values, streaming state data, "running" status, and model info', () => {
			const sessionId = 'session-123';
			const messageId = 'message-456';

			const message = createAiMessageFromStreamingState(sessionId, messageId);

			expect(message.id).toBe(messageId);
			expect(message.sessionId).toBe(sessionId);
			expect(message.type).toBe('ai');
			expect(message.name).toBe('AI');
			expect(message.content).toBe('');
			expect(message.status).toBe('running');
			expect(message.executionId).toBeNull();
			expect(message.previousMessageId).toBeNull();
			expect(message.retryOfMessageId).toBeNull();
			expect(message.provider).toBeNull();
			expect(message.model).toBeNull();

			const messageWithState = createAiMessageFromStreamingState(sessionId, messageId, {
				executionId: 'exec-789',
				previousMessageId: 'msg-000',
				model: { provider: 'openai', model: 'gpt-4' },
			});

			expect(messageWithState.executionId).toBe('exec-789');
			expect(messageWithState.previousMessageId).toBe('msg-000');
			expect(messageWithState.provider).toBe('openai');
			expect(messageWithState.model).toBe('gpt-4');
		});
	});
});
