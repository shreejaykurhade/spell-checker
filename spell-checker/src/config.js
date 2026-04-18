const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const defaultConfigPath = path.join(projectRoot, "spell-checker", "config", "default.config.json");
const defaultAllowlistPath = path.join(projectRoot, "spell-checker", "config", "default.allowlist.txt");

function loadConfig(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadAllowlist(filePath) {
  if (!fs.existsSync(filePath)) {
    return new Set();
  }

  return new Set(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line && !line.startsWith("#"))
  );
}

function resolveRuntimeOptions(options) {
  return {
    rootDir: path.resolve(options.target || process.cwd()),
    configPath: path.resolve(options.config || defaultConfigPath),
    allowlistPath: path.resolve(options.allowlist || defaultAllowlistPath)
  };
}

module.exports = {
  defaultAllowlistPath,
  defaultConfigPath,
  loadAllowlist,
  loadConfig,
  resolveRuntimeOptions
};
