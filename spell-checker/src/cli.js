const path = require("path");
const { loadAllowlist, loadConfig, resolveRuntimeOptions } = require("./config");
const { runSpellCheck } = require("./checker");
const { printResults } = require("./reporter");

function parseArgs(argv) {
  const options = {
    target: process.cwd(),
    verbose: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      options.target = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--config") {
      options.config = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--allowlist") {
      options.allowlist = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function runCli(argv) {
  const parsed = parseArgs(argv);
  const runtime = resolveRuntimeOptions(parsed);
  const config = loadConfig(runtime.configPath);
  const allowlist = loadAllowlist(runtime.allowlistPath);
  const findings = await runSpellCheck({
    rootDir: runtime.rootDir,
    config,
    allowlist,
    verbose: parsed.verbose
  });

  printResults(findings, runtime.rootDir);

  if (findings.length > 0) {
    process.exitCode = 1;
  }
}

module.exports = {
  parseArgs,
  runCli
};
