const fs = require("fs");
const path = require("path");
const { createDictionary } = require("./dictionary");
const { collectFiles } = require("./file-system");
const { getCheckableLines, extractWords, shouldIgnoreWord } = require("./tokenizer");

async function runSpellCheck(options) {
  const { rootDir, config, allowlist, verbose = false } = options;
  const spell = await createDictionary();
  const files = collectFiles(rootDir, config);
  const findings = [];

  for (const file of files) {
    if (verbose) {
      console.log(`Scanning ${file.relativePath}`);
    }

    const content = fs.readFileSync(file.fullPath, "utf8");
    const lines = getCheckableLines(file.fullPath, content);

    lines.forEach((line, index) => {
      const words = extractWords(line, config.minWordLength);

      for (const word of words) {
        if (shouldIgnoreWord(word, allowlist)) {
          continue;
        }

        if (!spell.correct(word)) {
          findings.push({
            file: file.relativePath,
            line: index + 1,
            word
          });
        }
      }
    });
  }

  return findings;
}

module.exports = {
  runSpellCheck
};
