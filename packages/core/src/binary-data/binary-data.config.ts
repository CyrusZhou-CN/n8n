import { Config, Env } from '@n8n/config';
import path from 'node:path';
import { z } from 'zod';

import { InstanceSettingsConfig } from '@/instance-settings/instance-settings-config';

const binaryDataModesSchema = z.enum(['default', 'filesystem', 's3']);

const availableModesSchema = z
	.string()
	.transform((value) => value.split(','))
	.pipe(binaryDataModesSchema.array());

@Config
export class BinaryDataConfig {
	/** Available modes of binary data storage, as comma separated strings. */
	@Env('N8N_AVAILABLE_BINARY_DATA_MODES', availableModesSchema)
	availableModes: z.infer<typeof availableModesSchema> = ['filesystem'];

	/** Storage mode for binary data. */
	@Env('N8N_DEFAULT_BINARY_DATA_MODE', binaryDataModesSchema)
	mode: z.infer<typeof binaryDataModesSchema> = 'default';

	/** Path for binary data storage in "filesystem" mode. */
	@Env('N8N_BINARY_DATA_STORAGE_PATH')
	localStoragePath: string;

	constructor(instanceSettingsConfig: InstanceSettingsConfig) {
		this.localStoragePath = path.join(instanceSettingsConfig.n8nFolder, 'binaryData');
	}
}
