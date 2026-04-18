function printResults(findings) {
  if (findings.length === 0) {
    console.log("Spell check passed.");
    return;
  }

  console.error("Spell check failed. Possible misspellings:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} -> ${finding.word}`);
  }
}

module.exports = {
  printResults
};
