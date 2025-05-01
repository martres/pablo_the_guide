import { getDefaultConfig } from '@expo/metro-config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultConfig = getDefaultConfig(__dirname);

// Remove the CSS transformer as it's not needed for Expo
delete defaultConfig.transformer.babelTransformerPath;

// Customize resolver extensions
defaultConfig.resolver.assetExts = [
  ...defaultConfig.resolver.assetExts,
  'db',
  'mp3',
  'ttf'
];

defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'mjs',
  'cjs'
];

// Support for the new architecture and Hermes
defaultConfig.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
defaultConfig.transformer.enableHermes = true;
defaultConfig.transformer.globalHermesEnabled = true;

// Enable ES modules
defaultConfig.resolver.sourceExts.push('mjs');
defaultConfig.transformer.experimentalImportSupport = true;

export default defaultConfig; 