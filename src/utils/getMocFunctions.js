const { Platform } = require('react-native');
const fs = require('react-native-fs');

module.exports = {
	resolve: () => '',
	join: () => '',
	platform: () => Platform.OS,
	release: () => Platform.Version,
	machine: () => (Platform.__constants.Model.match(/^sdk_[^_]+_(.*)$/) || ['', Platform.__constants.Model])[1],
	readdir: async path => (await fs.readDir(path)).map(f => f.name),
	DocumentDirectoryPath: fs.DocumentDirectoryPath,
};