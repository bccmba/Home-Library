module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./client",
            "@shared": "./shared",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
      "react-native-reanimated/plugin",
      // Add this new plugin at the end (or anywhere in the array, but end is safest)
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          // Optional but recommended settings:
          allowlist: null,          // Allow all env vars (or specify a list)
          blacklist: null,          // Deprecated, use blocklist
          blocklist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};