/**
 * Sanitizes an error object to remove circular references and non-serializable properties
 * that could break Vue reactivity or JSON serialization.
 *
 * This is necessary because error objects from the backend may contain:
 * - Circular references in node parameters
 * - Function references
 * - Complex nested objects that create circular dependencies
 *
 * The function uses JSON.stringify with a custom replacer to filter out problematic properties,
 * particularly stripping the node.parameters object which commonly contains circular references.
 *
 * @param error - The error object to sanitize (unknown type for flexibility)
 * @returns A sanitized error object safe for Vue reactivity and JSON serialization
 */
export function sanitizeError<T = unknown>(error: T): T {
	// Pass through non-object values as-is
	if (!error || typeof error !== 'object') {
		return error;
	}

	// Track visited objects to detect circular references
	const visited = new WeakSet<object>();

	// Use JSON stringify/parse to break any circular references
	// The replacer function filters out problematic properties
	const stringified = JSON.stringify(error, (key, value: unknown) => {
		// Skip functions and undefined values - they can't be serialized
		if (typeof value === 'function' || value === undefined) {
			return undefined;
		}

		// Detect and break circular references
		if (value && typeof value === 'object') {
			if (visited.has(value)) {
				return undefined; // Skip circular references
			}
			visited.add(value);
		}

		// For the node object, only keep essential properties
		// This avoids circular references in node.parameters or other complex nested structures
		if (key === 'node' && value && typeof value === 'object') {
			const nodeValue = value as Record<string, unknown>;
			return {
				name: nodeValue.name,
				type: nodeValue.type,
				typeVersion: nodeValue.typeVersion,
				position: nodeValue.position,
				id: nodeValue.id,
			};
		}

		return value;
	});

	return JSON.parse(stringified) as T;
}
