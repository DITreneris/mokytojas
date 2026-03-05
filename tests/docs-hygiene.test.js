'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ACTIVE_DOCS = [
  'README.md',
  path.join('docs', 'INDEX.md'),
  'AGENTS.md'
];

const FORBIDDEN_PATTERNS = [
  /github\.com\/DITreneris\/spinoff01/i,
  /Teacher AI Lesson Builder/i
];

const REQUIRED_INDEX_LINKS = [
  '../README.md',
  'INDEX.md',
  '../AGENTS.md'
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function fail(message) {
  console.error(`\u274C ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`\u2705 ${message}`);
}

function extractMarkdownLinks(content) {
  const links = [];
  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return links;
}

function isExternalLink(link) {
  return /^(?:https?:\/\/|mailto:|#)/i.test(link);
}

function validateActiveDocsExist() {
  ACTIVE_DOCS.forEach((doc) => {
    const absolute = path.join(ROOT, doc);
    if (!fs.existsSync(absolute)) {
      fail(`Aktyvus dokumentas nerastas: ${doc}`);
      return;
    }
    pass(`Aktyvus dokumentas egzistuoja: ${doc}`);
  });
}

function validateForbiddenPatterns() {
  ACTIVE_DOCS.forEach((doc) => {
    const absolute = path.join(ROOT, doc);
    const content = read(absolute);
    FORBIDDEN_PATTERNS.forEach((pattern) => {
      if (pattern.test(content)) {
        fail(`Rastas draudziamas pattern '${pattern}' faile: ${doc}`);
      }
    });
  });
  if (!process.exitCode) pass('Draudziamu pattern aktyviuose docs nerasta');
}

function validateActiveDocLinks() {
  ACTIVE_DOCS.forEach((doc) => {
    const absolute = path.join(ROOT, doc);
    const content = read(absolute);
    const links = extractMarkdownLinks(content);
    links.forEach((link) => {
      if (isExternalLink(link)) return;
      const resolved = path.resolve(path.dirname(absolute), link);
      if (!fs.existsSync(resolved)) {
        fail(`Broken link faile ${doc}: ${link}`);
      }
    });
  });
  if (!process.exitCode) pass('Aktyviu docs markdown nuorodos validzios');
}

function validateIndexLeanContract() {
  const indexPath = path.join(ROOT, 'docs', 'INDEX.md');
  const content = read(indexPath);

  REQUIRED_INDEX_LINKS.forEach((requiredLink) => {
    if (!content.includes(`(${requiredLink})`)) {
      fail(`INDEX.md neturi privalomos aktyvios nuorodos: ${requiredLink}`);
    }
  });

  const disallowedActiveRefs = [
    'todo.md',
    'MOBILE_UX_IMPROVEMENT_PLAN.md',
    'USER_JOURNEY_ANALYSIS.md',
    '.cursorrules',
    '.github/PULL_REQUEST_TEMPLATE.md'
  ];

  disallowedActiveRefs.forEach((item) => {
    if (content.includes(item)) {
      fail(`INDEX.md turi perteklinę aktyvią nuorodą ar likutį: ${item}`);
    }
  });

  if (!process.exitCode) pass('INDEX.md lean kontraktas validus');
}

function run() {
  console.log('Docs hygiene check pradetas...\n');
  validateActiveDocsExist();
  validateForbiddenPatterns();
  validateActiveDocLinks();
  validateIndexLeanContract();

  if (process.exitCode) {
    console.error('\nDocs hygiene check nepraejo.');
    process.exit(process.exitCode);
  }

  console.log('\nDocs hygiene check praejo.');
}

run();
