import { AIMessage } from '@langchain/core/messages';
import { nodeNameToToolName } from 'n8n-workflow';
import type { EngineResponse, IDataObject, GenericValue } from 'n8n-workflow';

import type { RequestResponseMetadata } from '../types';

export type ToolCallData = {
	action: {
		tool: string;
		toolInput: Record<string, unknown>;
		log: string | number | true | object;
		toolCallId: IDataObject | GenericValue | GenericValue[] | IDataObject[];
		type: string | number | true | object;
	};
	observation: string;
};

/**
 * Rebuilds the agent steps from previous tool call responses.
 * This is used to continue agent execution after tool calls have been made.
 *
 * @param response - The engine response containing tool call results
 * @param itemIndex - The current item index being processed
 * @returns Array of tool call data representing the agent steps
 */
export function buildSteps(
	response: EngineResponse<RequestResponseMetadata> | undefined,
	itemIndex: number,
): ToolCallData[] {
	const steps: ToolCallData[] = [];

	if (response) {
		const responses = response?.actionResponses ?? [];

		if (response.metadata?.previousRequests) {
			steps.push(...response.metadata.previousRequests);
		}

		for (const tool of responses) {
			if (tool.action?.metadata?.itemIndex !== itemIndex) continue;

			const toolInput: IDataObject = {
				...tool.action.input,
				id: tool.action.id,
			};
			if (!toolInput || !tool.data) {
				continue;
			}

			const step = steps.find((step) => step.action.toolCallId === toolInput.id);
			if (step) {
				continue;
			}
			// Create a synthetic AI message for the messageLog
			// This represents the AI's decision to call the tool
			const syntheticAIMessage = new AIMessage({
				content: `Calling ${tool.action.nodeName} with input: ${JSON.stringify(toolInput)}`,
				tool_calls: [
					{
						id: (toolInput?.id as string) ?? 'reconstructed_call',
						name: nodeNameToToolName(tool.action.nodeName),
						args: toolInput,
						type: 'tool_call',
					},
				],
			});

			const toolResult = {
				action: {
					tool: nodeNameToToolName(tool.action.nodeName),
					toolInput: (toolInput.input as IDataObject) || {},
					log: toolInput.log || syntheticAIMessage.content,
					messageLog: [syntheticAIMessage],
					toolCallId: toolInput?.id,
					type: toolInput.type || 'tool_call',
				},
				observation: JSON.stringify(tool.data?.data?.ai_tool?.[0]?.[0]?.json ?? ''),
			};

			steps.push(toolResult);
		}
	}
	return steps;
}
