import type { User } from '@n8n/db';
import {
	WEBHOOK_NODE_TYPE,
	SCHEDULE_TRIGGER_NODE_TYPE,
	FORM_TRIGGER_NODE_TYPE,
	CHAT_TRIGGER_NODE_TYPE,
	type INode,
} from 'n8n-workflow';

import {
	hasHttpHeaderAuthDecryptedData,
	hasJwtPemKeyDecryptedData,
	hasJwtSecretDecryptedData,
} from '../mcp.typeguards';
import type { MCPTriggersMap } from '../mcp.types';

import type { CredentialsService } from '@/credentials/credentials.service';

export type WebhookEndpoints = {
	webhook: string;
	webhookTest: string;
};

type WebhookCredentialRequirement =
	| { type: 'none' }
	| { type: 'basic' }
	| { type: 'header'; headerName: string }
	| { type: 'jwt'; variant: 'secret' | 'pem-key' };

type WebhookNodeDetails = {
	nodeName: string;
	baseUrl: string;
	productionPath: string;
	testPath: string;
	httpMethod: string;
	responseModeDescription: string;
	credentials: WebhookCredentialRequirement;
};

// Normalizes endpoint segment (strips leading/trailing slashes) and joins with the node path.
export const buildWebhookPath = (segment: string, pathParam: string) => {
	let normalizedSegment = segment;
	while (normalizedSegment.startsWith('/')) normalizedSegment = normalizedSegment.slice(1);
	while (normalizedSegment.endsWith('/')) normalizedSegment = normalizedSegment.slice(0, -1);
	const basePath = normalizedSegment ? `/${normalizedSegment}/` : '/';
	return `${basePath}${pathParam}`;
};

export const getTriggerDetails = async (
	user: User,
	supportedTriggers: INode[],
	baseUrl: string,
	credentialsService: CredentialsService,
	endpoints: WebhookEndpoints,
): Promise<string> => {
	if (supportedTriggers.length === 0) {
		return 'This workflow does not have a trigger node that can be executed via MCP.';
	}

	// Organize triggers by their node type
	const triggersByType: MCPTriggersMap = {
		[SCHEDULE_TRIGGER_NODE_TYPE]: [],
		[WEBHOOK_NODE_TYPE]: [],
		[FORM_TRIGGER_NODE_TYPE]: [],
		[CHAT_TRIGGER_NODE_TYPE]: [],
	};

	// Group triggers by type
	for (const trigger of supportedTriggers) {
		if (trigger.type in triggersByType) {
			triggersByType[trigger.type as keyof MCPTriggersMap].push(trigger);
		}
	}

	// Build response based on trigger types present
	const responses: string[] = ['This workflow has the following trigger(s):\n'];

	// Handle webhook triggers
	if (triggersByType[WEBHOOK_NODE_TYPE].length > 0) {
		const webhookDetails = await getWebhookDetails(
			user,
			triggersByType[WEBHOOK_NODE_TYPE],
			baseUrl,
			credentialsService,
			endpoints,
		);
		responses.push(webhookDetails);
	}

	// Handle chat triggers
	if (triggersByType[CHAT_TRIGGER_NODE_TYPE].length > 0) {
		responses.push(getChatTriggerDetails(triggersByType[CHAT_TRIGGER_NODE_TYPE]));
	}

	// Handle schedule triggers
	if (triggersByType[SCHEDULE_TRIGGER_NODE_TYPE].length > 0) {
		responses.push(getScheduleTriggerDetails(triggersByType[SCHEDULE_TRIGGER_NODE_TYPE]));
	}

	// Handle form triggers
	if (triggersByType[FORM_TRIGGER_NODE_TYPE].length > 0) {
		responses.push(getFormTriggerDetails(triggersByType[FORM_TRIGGER_NODE_TYPE]));
	}

	return responses.join('\n\n');
};

const getScheduleTriggerDetails = (scheduleTriggers: INode[]): string => {
	const header = 'Schedule trigger(s):\n\n';
	const footer =
		'\n\nScheduled workflows can be executed directly through MCP clients and do not require external inputs.';
	const triggers = scheduleTriggers
		.map(
			(node, index) => `
				<trigger ${index + 1}>
				\t - Node name: ${node.name}
				</trigger ${index + 1}>`,
		)
		.join('\n\n');
	return header + triggers + footer;
};

const getFormTriggerDetails = (formTriggers: INode[]): string => {
	// TODO: Extract auth details
	const header = 'Form trigger(s):\n\n';
	const footer =
		'\n\nUse the following input format when directly executing this workflow using any of the chat triggers: { inputs { formData: <FORM_FIELDS_HERE> } }';
	const triggers = formTriggers
		.map(
			(node, index) => `
				<trigger ${index + 1}>
				\t - Node name: ${node.name}
				\t - Form fields: ${JSON.stringify(node.parameters.formFields ?? 'N/A')}
				</trigger ${index + 1}>`,
		)
		.join('\n\n');
	return header + triggers + footer;
};

const getChatTriggerDetails = (chatTriggers: INode[]): string => {
	const header = 'Chat trigger(s):\n\n';
	const footer =
		'\n\nUse the following input format when directly executing this workflow using any of the chat triggers: { inputs { chatInput: <CHAT_MESSAGE_HERE> } }';
	const triggers = chatTriggers
		.map(
			(node, index) => `
				<trigger ${index + 1}>
				\t - Node name: ${node.name}
				</trigger ${index + 1}>`,
		)
		.join('\n\n');
	return header + triggers + footer;
};

/**
 * Creates a detailed textual description of the webhook triggers in a workflow, including URLs, methods, authentication, and response modes.
 * This helps MCP clients understand how craft a request to trigger the workflow.
 * @returns A detailed string description of the webhook triggers in the workflow.
 */
export const getWebhookDetails = async (
	user: User,
	webhookNodes: INode[],
	baseUrl: string,
	credentialsService: CredentialsService,
	endpoints: WebhookEndpoints,
): Promise<string> => {
	const nodeDetails = await Promise.all(
		webhookNodes.map(
			async (node) =>
				await collectWebhookNodeDetails(user, node, baseUrl, credentialsService, endpoints),
		),
	);

	return formatWebhookDetails(nodeDetails);
};

const collectWebhookNodeDetails = async (
	user: User,
	node: INode,
	baseUrl: string,
	credentialsService: CredentialsService,
	endpoints: WebhookEndpoints,
): Promise<WebhookNodeDetails> => {
	const pathParam = typeof node.parameters.path === 'string' ? node.parameters.path : '';
	const httpMethod =
		typeof node.parameters.httpMethod === 'string' ? node.parameters.httpMethod : 'GET';

	return {
		nodeName: node.name,
		baseUrl,
		productionPath: buildWebhookPath(endpoints.webhook, pathParam),
		testPath: buildWebhookPath(endpoints.webhookTest, pathParam),
		httpMethod,
		responseModeDescription: getResponseModeDescription(node),
		credentials: await resolveCredentialRequirement(user, node, credentialsService),
	};
};

const formatWebhookDetails = (details: WebhookNodeDetails[]): string => {
	const header = 'Webhook trigger(s):\n\n';
	const triggers = details
		.map((detail, index) => formatTriggerDescription(detail, index))
		.join('\n\n');
	return header + triggers;
};

const formatTriggerDescription = (detail: WebhookNodeDetails, index: number): string => `
				<trigger ${index + 1}>
				\t - Node name: ${detail.nodeName}
				\t - Base URL: ${detail.baseUrl}
				\t - Production path: ${detail.productionPath}
				\t - Test path: ${detail.testPath}
				\t - HTTP Method: ${detail.httpMethod}
				\t - Response Mode: ${detail.responseModeDescription}
				${formatCredentialRequirement(detail.credentials)}
				</trigger ${index + 1}>`;

const formatCredentialRequirement = (requirement: WebhookCredentialRequirement): string => {
	switch (requirement.type) {
		case 'basic':
			return '\t - Credentials: \n\t - This webhook requires basic authentication with a username and password that should be provided by the user.';
		case 'header':
			return `\t - Credentials: \n\t - This webhook requires a header with name "${requirement.headerName}" and a value that should be provided by the user.`;
		case 'jwt':
			if (requirement.variant === 'secret') {
				return '\t - Credentials: \n\t - This webhook requires a JWT secret that should be provided by the user.';
			}
			return '\t - Credentials: \n\t - This webhook requires JWT private and public keys that should be provided by the user.';
		default:
			return '\t - No credentials required for this webhook.';
	}
};

const resolveCredentialRequirement = async (
	user: User,
	node: INode,
	credentialsService: CredentialsService,
): Promise<WebhookCredentialRequirement> => {
	const authType =
		typeof node.parameters.authentication === 'string' ? node.parameters.authentication : undefined;

	switch (authType) {
		case 'basicAuth':
			return { type: 'basic' };
		case 'headerAuth': {
			const headerName = await getHeaderAuthName(user, node, credentialsService);
			if (headerName) {
				return { type: 'header', headerName };
			}
			break;
		}
		case 'jwtAuth': {
			const variant = await getJWTAuthVariant(user, node, credentialsService);
			if (variant) {
				return { type: 'jwt', variant };
			}
			break;
		}
	}

	return { type: 'none' };
};

const getHeaderAuthName = async (
	user: User,
	node: INode,
	credentialsService: CredentialsService,
): Promise<string | null> => {
	const id = node.credentials?.httpHeaderAuth?.id;
	if (!id) return null;

	const creds = await credentialsService.getOne(user, id, true);
	if (hasHttpHeaderAuthDecryptedData(creds)) {
		return creds.data.name;
	}
	return null;
};

const getJWTAuthVariant = async (
	user: User,
	node: INode,
	credentialsService: CredentialsService,
): Promise<'secret' | 'pem-key' | null> => {
	const id = node.credentials?.jwtAuth?.id;
	if (!id) return null;
	try {
		const creds = await credentialsService.getOne(user, id, true);
		if (hasJwtSecretDecryptedData(creds)) {
			return 'secret';
		} else if (hasJwtPemKeyDecryptedData(creds)) {
			return 'pem-key';
		}
	} catch {
		return null;
	}
	return null;
};

const getResponseModeDescription = (node: INode): string => {
	const responseMode =
		typeof node.parameters.responseMode === 'string' ? node.parameters.responseMode : undefined;

	if (responseMode === 'responseNode') {
		return 'Webhook is configured to respond using "Respond to Webhook" node.';
	}

	if (responseMode === 'lastNode') {
		const responseData =
			typeof node.parameters.responseData === 'string' ? node.parameters.responseData : undefined;
		const base = 'Webhook is configured to respond when the last node is executed. ';
		switch (responseData) {
			case 'allEntries':
				return base + 'Returns all the entries of the last node. Always returns an array.';
			case 'firstEntryBinary':
				return (
					base +
					'Returns the binary data of the first entry of the last node. Always returns a binary file.'
				);
			case 'noData':
				return base + 'Returns without a body.';
			default:
				return (
					base +
					'Returns the JSON data of the first entry of the last node. Always returns a JSON object.'
				);
		}
	}

	return 'Webhook is configured to respond immediately with the message "Workflow got started."';
};
