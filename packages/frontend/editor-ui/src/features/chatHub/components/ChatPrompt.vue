<script setup lang="ts">
import { N8nIcon, N8nInput, N8nText } from '@n8n/design-system';
import { ref, useTemplateRef } from 'vue';

const { disabled, sessionId } = defineProps<{
	placeholder: string;
	disabled: boolean;
	sessionId: string;
}>();

const emit = defineEmits<{
	submit: [string];
}>();

const inputRef = useTemplateRef('inputRef');
const message = ref('');

function onAttach() {}

function onMic() {}

function handleSubmitForm() {
	const trimmed = message.value.trim();

	if (trimmed) {
		emit('submit', trimmed);
	}
}

function handleKeydownTextarea(e: KeyboardEvent) {
	const trimmed = message.value.trim();

	if (e.key === 'Enter' && !e.shiftKey && trimmed) {
		e.preventDefault();
		emit('submit', trimmed);
	}
}

defineExpose({
	focus: () => inputRef.value?.focus(),
	setText: (text: string) => {
		message.value = text;
	},
});
</script>

<template>
	<form :class="$style.prompt" @submit.prevent="handleSubmitForm">
		<div :class="$style.inputWrap">
			<N8nInput
				ref="inputRef"
				size="xlarge"
				v-model="message"
				:class="$style.input"
				type="textarea"
				:placeholder="placeholder"
				autocomplete="off"
				:autosize="{ minRows: 1, maxRows: 4 }"
				@keydown="handleKeydownTextarea"
			/>

			<div :class="$style.actions">
				<button
					:class="$style.iconBtn"
					type="button"
					title="Attach"
					:disabled="disabled"
					@click="onAttach"
				>
					<N8nIcon icon="paperclip" width="20" height="20" />
				</button>
				<button
					:class="$style.iconBtn"
					type="button"
					title="Voice"
					:disabled="disabled"
					@click="onMic"
				>
					<N8nIcon icon="mic" width="20" height="20" />
				</button>
				<button
					:class="$style.sendBtn"
					type="submit"
					:disabled="disabled || !message.trim()"
					label="Send"
				>
					<N8nIcon icon="arrow-up" :size="16" />
				</button>
			</div>
		</div>
		<N8nText :class="$style.disclaimer" color="text-light" size="small">
			AI may make mistakes. Check important info.
			<br />
			{{ sessionId }}
		</N8nText>
	</form>
</template>

<style lang="scss" module>
.prompt {
	display: grid;
	place-items: center;
}

.inputWrap {
	position: relative;
	display: flex;
	align-items: center;
	width: 100%;

	& input:disabled {
		cursor: not-allowed;
	}
}

.input {
	& textarea {
		font: inherit;
		line-height: 1.5em;
		border-radius: 16px !important;
		resize: none;
		padding: 16px;
	}
}

/* Right-side actions */
.actions {
	position: absolute;
	right: 0;
	bottom: 0;
	padding: var(--spacing--xs);
	display: flex;
	align-items: center;
	gap: 6px;
}

.iconBtn {
	display: grid;
	place-items: center;
	width: 32px;
	height: 32px;
	border-radius: 10px;
	border: none;
	background: transparent;
	color: var(--color--text--tint-1);
	cursor: pointer;
}

.iconBtn:hover {
	background: rgba(0, 0, 0, 0.04);
	color: var(--color--text--shade-1);
}

.sendBtn {
	width: 32px;
	height: 32px;
	border-radius: 10px;
	border: none;
	background: var(--color--primary);
	color: #fff;
	font-weight: 600;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sendBtn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.disclaimer {
	margin-top: var(--spacing--xs);
	color: var(--color--text--tint-2);
	text-align: center;
}
</style>
