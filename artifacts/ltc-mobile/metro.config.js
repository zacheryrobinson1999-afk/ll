const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// pnpm creates temporary directories (e.g. package_tmp_NNN) during installation
// that disappear before Metro finishes scanning, causing ENOENT crashes.
// Block these transient paths so Metro never tries to watch them.
const { blockList: existingBlockList } = config.resolver ?? {};
const existing = existingBlockList
  ? Array.isArray(existingBlockList)
    ? existingBlockList
    : [existingBlockList]
  : [];

config.resolver = {
  ...config.resolver,
  blockList: [...existing, /_tmp_\d+/],
};

module.exports = config;
