/**
 * Checks the files GitHub Pages serves from the repository root.
 * No network, and no dependency on the dev-only linters.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!/<iframe\b[^>]*\btitle="Pranav Prem resume"/.test(html)) {
  fail("The resume iframe needs its accessible name.");
}

if (/contentWindow|contentDocument/.test(html)) {
  fail(
    "index.html must not read the PDF frame. That access throws in the console and skips the layout.",
  );
}

if (/<\/iframe>/.test(html) === false) {
  fail(
    "The iframe must be closed. A self-closing iframe swallows the rest of the document.",
  );
}

const localRefs = [];
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  localRefs.push(match[1]);
}

if (!localRefs.includes("Pranav Prem - Resume.pdf")) {
  fail('The iframe must keep src="Pranav Prem - Resume.pdf".');
}

for (const ref of localRefs) {
  if (/^(?:[a-z]+:)?\/\//i.test(ref) || ref.startsWith("data:")) {
    continue;
  }
  const relative = decodeURIComponent(ref.split("#")[0].split("?")[0]);
  const file = path.join(root, relative);
  if (!file.startsWith(root + path.sep) && file !== root) {
    fail(`Refused path escapes the repository: ${ref}`);
  }
  if (!fs.existsSync(file)) {
    fail(`Missing file referenced by index.html: ${ref}`);
  }
}

const pdfPath = path.join(root, "Pranav Prem - Resume.pdf");
const pdfHead = fs.readFileSync(pdfPath).subarray(0, 5).toString("utf8");
if (pdfHead !== "%PDF-") {
  fail("Pranav Prem - Resume.pdf is not a PDF.");
}

const ico = fs.readFileSync(path.join(root, "favicon.ico"));
if (ico.length < 6 || ico.readUInt16LE(0) !== 0 || ico.readUInt16LE(2) !== 1) {
  fail("favicon.ico is not an ICO file, so browsers will keep logging a 404.");
}

const secret =
  /(api[_-]?key\s*[:=]\s*['"][^'"]+|secret\s*[:=]\s*['"][^'"]+|BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})/;
const skip = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".ico",
  ".gif",
  ".webp",
]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    if (skip.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }
    const text = fs.readFileSync(full, "utf8");
    if (secret.test(text)) {
      fail(`Possible credential in ${path.relative(root, full)}.`);
    }
  }
}

walk(root);
console.log("site checks passed");
