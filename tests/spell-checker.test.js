const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { runSpellCheck } = require("../spell-checker/src/checker");
const { loadAllowlist, loadConfig } = require("../spell-checker/src/config");

const configPath = path.join(__dirname, "configs", "base.config.json");
const allowlistPath = path.join(__dirname, "configs", "custom.allowlist.txt");

test("passes for clean fixture content", async () => {
  const findings = await runSpellCheck({
    rootDir: path.join(__dirname, "fixtures", "passing"),
    config: loadConfig(configPath),
    allowlist: new Set()
  });

  assert.equal(findings.length, 0);
});

test("reports misspellings for failing fixture content", async () => {
  const findings = await runSpellCheck({
    rootDir: path.join(__dirname, "fixtures", "failing"),
    config: loadConfig(configPath),
    allowlist: new Set()
  });

  assert.equal(findings.length, 3);
  assert.deepEqual(
    findings.map((finding) => finding.word).sort(),
    ["analysys", "conection", "responce"]
  );
});

test("accepts custom allowlist entries from config fixtures", async () => {
  const findings = await runSpellCheck({
    rootDir: path.join(__dirname, "fixtures", "allowlist"),
    config: loadConfig(configPath),
    allowlist: loadAllowlist(allowlistPath)
  });

  assert.equal(findings.length, 0);
});

test("ignores identifiers and attributes in source files", async () => {
  const findings = await runSpellCheck({
    rootDir: path.join(__dirname, "fixtures", "passing"),
    config: loadConfig(configPath),
    allowlist: new Set()
  });

  const flaggedWords = findings.map((finding) => finding.word.toLowerCase());

  assert.equal(flaggedWords.includes("frameworkspecifichook"), false);
  assert.equal(flaggedWords.includes("frameworkspecificterm"), false);
  assert.equal(flaggedWords.includes("classname"), false);
});
