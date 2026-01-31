const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow local SVG assets to be resolved for SvgUri usage.
config.resolver.assetExts = [...config.resolver.assetExts, 'svg'];

module.exports = config;
