const fs = require('react-native-fs');

module.exports = {
	...fs,
	readdir: async path => (await fs.readDir(path)).map(f => f.name),
};