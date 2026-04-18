#!/usr/bin/env node

const { runCli } = require("../src/cli");

runCli(process.argv.slice(2)).catch((error) => {
  console.error("Spell checker crashed.");
  console.error(error);
  process.exit(1);
});
