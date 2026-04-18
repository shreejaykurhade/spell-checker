const fs = require("fs");
const path = require("path");

function collectFiles(rootDir, config, results = [], currentDir = rootDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (config.ignoreDirectories.includes(entry.name)) {
        continue;
      }

      collectFiles(rootDir, config, results, fullPath);
      continue;
    }

    if (config.ignoreFiles.includes(entry.name)) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!config.includeExtensions.includes(ext)) {
      continue;
    }

    results.push({ fullPath, relativePath });
  }

  return results;
}

module.exports = {
  collectFiles
};
