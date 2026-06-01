export type PluginType = 'skill' | 'provider' | 'channel' | 'other';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  entry: string;
  enabled?: boolean;
}

export interface RegisteredPlugin {
  manifest: PluginManifest;
  pluginDir: string;
  enabled: boolean;
}

export interface RuntimePluginModule {
  setup?: (ctx: { app: unknown }) => Promise<void> | void;
}
