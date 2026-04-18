const path = require("path");

const rawTextExtensions = new Set([
  ".md",
  ".txt",
  ".rst",
  ".adoc",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".cfg",
  ".conf",
  ".properties"
]);

const slashCommentExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".c",
  ".h",
  ".cpp",
  ".cc",
  ".cxx",
  ".hpp",
  ".java",
  ".cs",
  ".go",
  ".rs",
  ".php",
  ".kt",
  ".swift",
  ".scala",
  ".sql"
]);

const hashCommentExtensions = new Set([
  ".sh",
  ".bash",
  ".zsh",
  ".ps1",
  ".pl",
  ".pm",
  ".rb",
  ".r",
  ".rmd",
  ".py",
  ".dockerfile",
  ".tcl",
  ".jl",
  ".ex",
  ".exs"
]);

const dashDashCommentExtensions = new Set([
  ".lua",
  ".hs",
  ".lhs",
  ".sql"
]);

const percentCommentExtensions = new Set([
  ".erl",
  ".hrl",
  ".tex",
  ".m",
  ".matlab"
]);

const semicolonCommentExtensions = new Set([
  ".clj",
  ".cljs",
  ".cljc",
  ".edn",
  ".lisp",
  ".el",
  ".scm",
  ".ss",
  ".ini",
  ".cfg",
  ".conf",
  ".properties"
]);

const markupExtensions = new Set([
  ".html",
  ".htm",
  ".xml"
]);

const styleExtensions = new Set([
  ".css",
  ".scss",
  ".sass",
  ".less"
]);

function sanitizeLine(line) {
  return line
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\b[\w./-]*\/[\w./-]*\b/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\b[a-f0-9]{7,64}\b/gi, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[_#/\\()[\]{}=*+~|<>:;,"!?-]/g, " ");
}

function extractWords(line, minWordLength) {
  const matches = sanitizeLine(line).match(/[A-Za-z][A-Za-z']+/g) || [];

  return matches.filter((word) => {
    if (word.length < minWordLength) {
      return false;
    }

    if (/[A-Z]{2,}/.test(word)) {
      return false;
    }

    if (/[a-z][A-Z]/.test(word)) {
      return false;
    }

    return true;
  });
}

function shouldIgnoreWord(word, allowlist) {
  const lower = word.toLowerCase();

  if (allowlist.has(lower)) {
    return true;
  }

  if (lower.endsWith("ing") && allowlist.has(lower.slice(0, -3))) {
    return true;
  }

  if (lower.endsWith("ed") && allowlist.has(lower.slice(0, -2))) {
    return true;
  }

  if (lower.endsWith("s") && allowlist.has(lower.slice(0, -1))) {
    return true;
  }

  return false;
}

function getCheckableLines(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".py") {
    return extractPythonText(content);
  }

  if (slashCommentExtensions.has(ext)) {
    return extractSlashCommentText(content);
  }

  if (hashCommentExtensions.has(ext)) {
    return extractHashCommentText(content);
  }

  if (dashDashCommentExtensions.has(ext)) {
    return extractLineCommentText(content, "--");
  }

  if (percentCommentExtensions.has(ext)) {
    return extractLineCommentText(content, "%");
  }

  if (semicolonCommentExtensions.has(ext)) {
    return extractLineCommentText(content, ";");
  }

  if (markupExtensions.has(ext)) {
    return extractMarkupText(content);
  }

  if (styleExtensions.has(ext)) {
    return extractStyleCommentText(content);
  }

  if (rawTextExtensions.has(ext)) {
    return extractRawText(filePath, content);
  }

  return [];
}

function extractRawText(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  const lines = content.split(/\r?\n/);

  if (ext !== ".md") {
    return lines;
  }

  const filtered = [];
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      filtered.push("");
      continue;
    }

    filtered.push(inFence ? "" : line);
  }

  return filtered;
}

function extractSlashCommentText(content) {
  const lines = content.split(/\r?\n/);
  const extracted = [];
  let inBlockComment = false;

  for (const line of lines) {
    let text = "";
    let index = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplate = false;

    while (index < line.length) {
      const current = line[index];
      const next = line[index + 1];
      const pair = current + (next || "");

      if (inBlockComment) {
        if (pair === "*/") {
          inBlockComment = false;
          index += 2;
          continue;
        }

        text += current;
        index += 1;
        continue;
      }

      if (!inDoubleQuote && !inTemplate && current === "'" && line[index - 1] !== "\\") {
        inSingleQuote = !inSingleQuote;
        index += 1;
        continue;
      }

      if (!inSingleQuote && !inTemplate && current === "\"" && line[index - 1] !== "\\") {
        inDoubleQuote = !inDoubleQuote;
        index += 1;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && current === "`" && line[index - 1] !== "\\") {
        inTemplate = !inTemplate;
        index += 1;
        continue;
      }

      if (inSingleQuote || inDoubleQuote || inTemplate) {
        index += 1;
        continue;
      }

      if (pair === "//") {
        text += line.slice(index + 2);
        break;
      }

      if (pair === "/*") {
        inBlockComment = true;
        index += 2;
        continue;
      }

      index += 1;
    }

    extracted.push(text);
  }

  return extracted;
}

function extractHashCommentText(content) {
  const lines = content.split(/\r?\n/);

  return lines.map((line) => {
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let index = 0; index < line.length; index += 1) {
      const current = line[index];

      if (!inDoubleQuote && current === "'" && line[index - 1] !== "\\") {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (!inSingleQuote && current === "\"" && line[index - 1] !== "\\") {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && current === "#") {
        return index === 0 && line.startsWith("#!") ? "" : line.slice(index + 1);
      }
    }

    return "";
  });
}

function extractLineCommentText(content, marker) {
  const lines = content.split(/\r?\n/);

  return lines.map((line) => {
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let index = 0; index < line.length; index += 1) {
      const current = line[index];

      if (!inDoubleQuote && current === "'" && line[index - 1] !== "\\") {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (!inSingleQuote && current === "\"" && line[index - 1] !== "\\") {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && line.slice(index, index + marker.length) === marker) {
        return line.slice(index + marker.length);
      }
    }

    return "";
  });
}

function extractPythonText(content) {
  const lines = content.split(/\r?\n/);
  const extracted = [];
  let inDocstring = false;
  let delimiter = "";

  for (const line of lines) {
    let text = "";
    let index = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    while (index < line.length) {
      const current = line[index];
      const tripleSingle = line.slice(index, index + 3) === "'''";
      const tripleDouble = line.slice(index, index + 3) === "\"\"\"";

      if (inDocstring) {
        if (
          (delimiter === "'''" && tripleSingle) ||
          (delimiter === "\"\"\"" && tripleDouble)
        ) {
          inDocstring = false;
          delimiter = "";
          index += 3;
          continue;
        }

        text += current;
        index += 1;
        continue;
      }

      if (!inDoubleQuote && current === "'" && line[index - 1] !== "\\") {
        if (tripleSingle) {
          inDocstring = true;
          delimiter = "'''";
          index += 3;
          continue;
        }

        inSingleQuote = !inSingleQuote;
        index += 1;
        continue;
      }

      if (!inSingleQuote && current === "\"" && line[index - 1] !== "\\") {
        if (tripleDouble) {
          inDocstring = true;
          delimiter = "\"\"\"";
          index += 3;
          continue;
        }

        inDoubleQuote = !inDoubleQuote;
        index += 1;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && current === "#") {
        if (!(index === 0 && line.startsWith("#!"))) {
          text += line.slice(index + 1);
        }
        break;
      }

      index += 1;
    }

    extracted.push(text);
  }

  return extracted;
}

function extractMarkupText(content) {
  const lines = content.split(/\r?\n/);
  const extracted = [];
  let inComment = false;
  let inScript = false;
  let inStyle = false;

  for (const line of lines) {
    let working = line;

    if (inScript) {
      if (/<\/script>/i.test(working)) {
        inScript = false;
      }
      extracted.push("");
      continue;
    }

    if (inStyle) {
      if (/<\/style>/i.test(working)) {
        inStyle = false;
      }
      extracted.push("");
      continue;
    }

    if (/<script\b/i.test(working)) {
      inScript = true;
      working = working.replace(/<script\b[^>]*>.*$/i, "");
    }

    if (/<style\b/i.test(working)) {
      inStyle = true;
      working = working.replace(/<style\b[^>]*>.*$/i, "");
    }

    if (inComment) {
      const end = working.indexOf("-->");
      if (end >= 0) {
        working = working.slice(end + 3);
        inComment = false;
      } else {
        extracted.push(working);
        continue;
      }
    }

    const commentStart = working.indexOf("<!--");
    if (commentStart >= 0) {
      const before = working.slice(0, commentStart);
      const afterStart = working.slice(commentStart + 4);
      const end = afterStart.indexOf("-->");

      if (end >= 0) {
        const commentText = afterStart.slice(0, end);
        const after = afterStart.slice(end + 3);
        extracted.push(`${stripTags(before)} ${commentText} ${stripTags(after)}`);
        continue;
      }

      inComment = true;
      extracted.push(`${stripTags(before)} ${afterStart}`);
      continue;
    }

    extracted.push(stripTags(working));
  }

  return extracted;
}

function extractStyleCommentText(content) {
  return extractSlashCommentText(content);
}

function stripTags(line) {
  return line.replace(/<[^>]+>/g, " ");
}

module.exports = {
  extractWords,
  getCheckableLines,
  sanitizeLine,
  shouldIgnoreWord
};
