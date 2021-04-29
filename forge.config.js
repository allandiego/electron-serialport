module.exports = {
  packagerConfig: {
    icon: './src/assets/icon',
    asar: true, // for @electron-forge/plugin-auto-unpack-natives
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'move_file_app',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    ['@electron-forge/plugin-auto-unpack-natives'],
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './public/index.html',
              js: './src/electron/renderer.ts',
              name: 'main_window',
              preload: {
                js: './src/electron/preload.ts',
              },
            },
          ],
        },
      },
    ],
  ],
};
