import { Container } from '@n8n/di';

import { InstanceSettingsConfig } from '@/instance-settings/instance-settings-config';
import { mockInstance } from '@test/utils';

import { BinaryDataConfig } from '../binary-data.config';

describe('BinaryDataConfig', () => {
	const n8nFolder = '/test/n8n';
	console.warn = jest.fn().mockImplementation(() => {});

	beforeEach(() => {
		process.env = {};
		jest.resetAllMocks();
		Container.reset();
		mockInstance(InstanceSettingsConfig, { n8nFolder });
	});

	it('should use default values when no env variables are defined', () => {
		const config = Container.get(BinaryDataConfig);

		expect(config.availableModes).toEqual(['filesystem']);
		expect(config.mode).toEqual('default');
		expect(config.localStoragePath).toEqual('/test/n8n/binaryData');
	});

	it('should use values from env variables when defined', () => {
		process.env.N8N_AVAILABLE_BINARY_DATA_MODES = 'filesystem,s3';
		process.env.N8N_DEFAULT_BINARY_DATA_MODE = 's3';
		process.env.N8N_BINARY_DATA_STORAGE_PATH = '/custom/storage/path';

		const config = Container.get(BinaryDataConfig);

		expect(config.mode).toEqual('s3');
		expect(config.availableModes).toEqual(['filesystem', 's3']);
		expect(config.localStoragePath).toEqual('/custom/storage/path');
	});

	it('should fallback to default for mode', () => {
		process.env.N8N_DEFAULT_BINARY_DATA_MODE = 'invalid-mode';

		const config = Container.get(BinaryDataConfig);

		expect(config.mode).toEqual('default');
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Invalid value for N8N_DEFAULT_BINARY_DATA_MODE'),
		);
	});

	it('should fallback to default for available modes', () => {
		process.env.N8N_AVAILABLE_BINARY_DATA_MODES = 'filesystem,invalid-mode,s3';

		const config = Container.get(BinaryDataConfig);

		expect(config.availableModes).toEqual(['filesystem']);
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('Invalid value for N8N_AVAILABLE_BINARY_DATA_MODES'),
		);
	});
});
