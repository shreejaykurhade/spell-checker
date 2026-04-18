const nspell = require("nspell");

async function createDictionary() {
  const dictionaryModule = await import("dictionary-en");
  return nspell(dictionaryModule.default);
}

module.exports = {
  createDictionary
};
