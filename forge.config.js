module.exports = {
  packagerConfig: {
    // node_modules might need to be added back here?
    // ignore: "(.git|.vscode|docs|.gitignore|README.md|LICENSE.md)",
    ignore: [
      ".git",
      ".vscode",
      "docs",
      ".gitignore",
      "README.md",
      "LICENSE.md",
      // frontend/node_modules
      "frontend/node_modules",
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
  ],
};
