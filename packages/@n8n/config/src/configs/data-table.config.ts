import { Config, Env } from '../decorators';

@Config
export class DataTableConfig {
	/** Specifies the maximum allowed size (in bytes) for data tables. */
	@Env('N8N_DATA_TABLES_MAX_SIZE_BYTES')
	maxSize: number = 50 * 1024 * 1024;

	/**
	 * The percentage threshold at which a warning is triggered for data tables.
	 * When the usage of a data table reaches or exceeds this value, a warning is issued.
	 * Defaults to 80% of maxSize if not explicitly set via environment variable.
	 */
	@Env('N8N_DATA_TABLES_WARNING_THRESHOLD_BYTES')
	warningThreshold?: number;

	/**
	 * The duration in milliseconds for which the data table size is cached.
	 * This prevents excessive database queries for size validation.
	 */
	@Env('N8N_DATA_TABLES_SIZE_CHECK_CACHE_DURATION_MS')
	sizeCheckCacheDuration: number = 60 * 1000;

	/**
	 * The maximum allowed file size (in bytes) for CSV uploads to data tables.
	 * Defaults to 5MB if not explicitly set via environment variable.
	 */
	@Env('N8N_DATA_TABLES_UPLOAD_MAX_FILE_SIZE_BYTES')
	uploadMaxFileSize: number = 5 * 1024 * 1024;

	/**
	 * The interval in milliseconds at which orphaned uploaded files are cleaned up.
	 * Defaults to 60 seconds (60000ms) if not explicitly set via environment variable.
	 */
	@Env('N8N_DATA_TABLES_CLEANUP_INTERVAL_MS')
	cleanupIntervalMs: number = 60 * 1000;

	/**
	 * The maximum age in milliseconds for uploaded files before they are considered orphaned and deleted.
	 * Files older than this threshold are removed during cleanup.
	 * Defaults to 2 minutes (120000ms) if not explicitly set via environment variable.
	 */
	@Env('N8N_DATA_TABLES_FILE_MAX_AGE_MS')
	fileMaxAgeMs: number = 2 * 60 * 1000;
}
