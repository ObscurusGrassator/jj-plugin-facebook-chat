module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [ 'module-resolver', {
      alias: {
        'fs/promises': './utils/getMocFs.js',
        fs: './utils/getMocFs.js',
        path: './utils/getMocFunctions.js',
        os: './utils/getMocFunctions.js',
        child_process: './utils/getUndefined.js',
        nodemailer: './utils/getUndefined.js',
      },
      root: ['./App/nodeClient/']
    } ],
  ],
};
