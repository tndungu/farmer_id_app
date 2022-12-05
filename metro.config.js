const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('db');
defaultConfig.transformer.minifierConfig.compress.drop_console = true

module.exports = defaultConfig;