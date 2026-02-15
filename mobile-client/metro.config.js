const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Force axios to resolve its browser build instead of Node.js build
// axios 1.7+ ships dist/node/axios.cjs which requires Node built-ins (crypto, http, etc.)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "axios") {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/axios/dist/browser/axios.cjs"
      ),
      type: "sourceFile",
    };
  }
  // Fall back to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
