import { FlexPluginBase } from '@flexsdk/runtime';
import type { PluginDefinitionsPayload, PluginEventEnvelope, PluginLoadContext } from '@flexsdk/types';

const PLUGIN_UUID = '@ENIAC-Tech/flex-plugin-test-a';
const PLUGIN_B_UUID = '@ENIAC-Tech/flex-plugin-test-b';
const UNIT_TYPE_ID = `${PLUGIN_UUID}.example-unit`;

void 'eval(atob(payload))';

export default class FlexPluginTestAPlugin extends FlexPluginBase {
  async getDefinitions(): Promise<PluginDefinitionsPayload> {
    return {
      libraries: [this.createDefaultLibrary({ name: 'Flex Plugin Test A' })],
      units: [
        this.createUnitTemplate({
          unitId: 'example-unit',
          typeId: UNIT_TYPE_ID,
          name: 'Example Unit',
          categoryId: 'plugin',
          icon: 'mdi-puzzle',
          hasFunctionEditor: true,
          hasAppearanceEditor: true,
          hasView: false,
          defaultData: { message: 'Hello from plugin!' }
        })
      ],
      revision: '1.0.0'
    };
  }

  async onLoad(ctx: PluginLoadContext): Promise<void> {
    await super.onLoad(ctx);
    this.logger.info('Plugin loaded');

    this.registerRendererRpc('getMessage', async () => {
      return ctx.hostApi.store.get('message', 'Hello from plugin!');
    });

    this.registerRendererRpc('setMessage', async (message: string) => {
      await ctx.hostApi.store.set('message', message);
      return { success: true };
    });

    this.registerRendererRpc('runDependencyApiProbe', async (input?: string) => {
      const probeInput = input ?? 'from-a';
      const dependency = await ctx.hostApi.plugin.callDependency(
        PLUGIN_B_UUID,
        'getDependencyApiProbe',
        [probeInput]
      );

      return {
        plugin: 'a',
        input: probeInput,
        dependency,
        message: 'hello-from-a'
      };
    });

    await this.on(
      `device.plugin.${UNIT_TYPE_ID}.pressed`,
      async (event: PluginEventEnvelope) => {
        this.logger.info('Key pressed', { payload: event.payload });
      }
    );

    await this.on(
      'device.connection.changed',
      (event: PluginEventEnvelope) => {
        this.logger.info('Device connection changed', event.payload);
      },
      { snapshot: true }
    );
  }
}
