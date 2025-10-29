import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GlobalConfig } from '@n8n/config';
import { User, ExecutionRepository } from '@n8n/db';
import { Service } from '@n8n/di';

import { createExecuteWorkflowTool } from './tools/execute-workflow.tool';
import { createWorkflowDetailsTool } from './tools/get-workflow-details.tool';
import { createSearchWorkflowsTool } from './tools/search-workflows.tool';

import { ActiveExecutions } from '@/active-executions';
import { CredentialsService } from '@/credentials/credentials.service';
import { UrlService } from '@/services/url.service';
import { Telemetry } from '@/telemetry';
import { TestWebhooks } from '@/webhooks/test-webhooks';
import { WorkflowExecutionService } from '@/workflows/workflow-execution.service';
import { WorkflowFinderService } from '@/workflows/workflow-finder.service';
import { WorkflowService } from '@/workflows/workflow.service';

@Service()
export class McpService {
	constructor(
		private readonly workflowFinderService: WorkflowFinderService,
		private readonly workflowService: WorkflowService,
		private readonly urlService: UrlService,
		private readonly credentialsService: CredentialsService,
		private readonly workflowExecutionService: WorkflowExecutionService,
		private readonly testWebhooks: TestWebhooks,
		private readonly activeExecutions: ActiveExecutions,
		private readonly executionRepository: ExecutionRepository,
		private readonly globalConfig: GlobalConfig,
		private readonly telemetry: Telemetry,
	) {}

	getServer(user: User) {
		const server = new McpServer({
			name: 'n8n MCP Server',
			version: '1.0.0',
		});

		const workflowSearchTool = createSearchWorkflowsTool(
			user,
			this.workflowService,
			this.telemetry,
		);
		server.registerTool(
			workflowSearchTool.name,
			workflowSearchTool.config,
			workflowSearchTool.handler,
		);

		const executeWorkflowTool = createExecuteWorkflowTool(
			user,
			this.workflowFinderService,
			this.workflowExecutionService,
			this.testWebhooks,
			this.activeExecutions,
			this.executionRepository,
		);
		server.registerTool(
			executeWorkflowTool.name,
			executeWorkflowTool.config,
			executeWorkflowTool.handler,
		);

		const workflowDetailsTool = createWorkflowDetailsTool(
			user,
			this.urlService.getWebhookBaseUrl(),
			this.workflowFinderService,
			this.credentialsService,
			{
				webhook: this.globalConfig.endpoints.webhook,
				webhookTest: this.globalConfig.endpoints.webhookTest,
			},
			this.telemetry,
		);
		server.registerTool(
			workflowDetailsTool.name,
			workflowDetailsTool.config,
			workflowDetailsTool.handler,
		);

		return server;
	}
}
