/* global __dirname */
/* eslint @typescript-eslint/no-require-imports: "off" -- Metro uses a CommonJS configuration entry. */
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// This independent test project shares the already installed mobile packages;
// no workspace restructuring or second dependency installation is needed.
config.watchFolders = [path.resolve(__dirname, '..')];
config.resolver.nodeModulesPaths = [path.resolve(__dirname, '../node_modules')];
module.exports = config;
