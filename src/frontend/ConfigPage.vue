<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFlexBridge } from '@flexsdk/runtime';

const { isReady, backendRpc } = useFlexBridge();
const message = ref('Hello from plugin!');
const dependencyProbeResult = ref('');
const dependencyProbeError = ref('');

watch(isReady, async (ready) => {
  if (!ready) return;
  message.value = await backendRpc('getMessage');
}, { immediate: true });

async function save() {
  await backendRpc('setMessage', [message.value]);
}

async function runDependencyApiProbe() {
  dependencyProbeError.value = '';
  dependencyProbeResult.value = '';

  try {
    const result = await backendRpc('runDependencyApiProbe', ['from-a-config-page']);
    dependencyProbeResult.value = JSON.stringify(result, null, 2);
  } catch (err) {
    dependencyProbeError.value = err instanceof Error ? err.message : String(err);
  }
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="pa-4">
        <v-text-field v-model="message" label="Default Message" variant="outlined" />
        <div class="d-flex ga-2 flex-wrap">
          <v-btn
            :disabled="!isReady"
            color="primary"
            prepend-icon="mdi-content-save"
            @click="save"
          >
            Save Settings
          </v-btn>
          <v-btn
            :disabled="!isReady"
            color="secondary"
            prepend-icon="mdi-api"
            variant="tonal"
            @click="runDependencyApiProbe"
          >
            Run Dependency API Probe
          </v-btn>
        </div>

        <v-alert
          v-if="dependencyProbeError"
          class="mt-4"
          type="error"
          variant="tonal"
        >
          {{ dependencyProbeError }}
        </v-alert>

        <v-sheet
          v-if="dependencyProbeResult"
          class="mt-4 pa-3 text-body-2"
          border
          rounded
        >
          <pre class="ma-0 probe-result">{{ dependencyProbeResult }}</pre>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.probe-result {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
