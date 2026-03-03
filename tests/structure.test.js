/**
 * Struktūriniai testai – DI Operacinis Centras (index.html)
 * Tikrina, kad puslapyje yra visi būtini elementai:
 * režimų perjungiklis, formos, output, sesijos, biblioteka, taisyklės, a11y.
 * Paleisti: node tests/structure.test.js (arba npm test)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'index.html');
const PRIVATUMAS_PATH = path.join(__dirname, '..', 'privatumas.html');
const STYLE_PATH = path.join(__dirname, '..', 'style.css');
const GENERATOR_PATH = path.join(__dirname, '..', 'generator.js');
const COPY_PATH = path.join(__dirname, '..', 'copy.js');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error(`\u274C ${message}`);
    return false;
  }
  console.log(`\u2705 ${message}`);
  return true;
}

function run() {
  let passed = 0;
  let failed = 0;

  const html = readFile(INDEX_PATH);
  if (!html) {
    console.error('\u274C index.html nerastas:', INDEX_PATH);
    process.exit(1);
  }

  // --- Operacinis centras ---
  if (assert(html.includes('id="operationsCenter"'), 'Operacinis centras sekcija egzistuoja')) passed++;
  else failed++;

  // --- Režimų perjungiklis (3 režimai) ---
  if (assert(html.includes('data-mode="MASTER"'), 'MASTER režimo tab egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('data-mode="DIENOS"'), 'DIENOS režimo tab egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('data-mode="SAVAITES"'), 'SAVAITĖS režimo tab egzistuoja')) passed++;
  else failed++;

  // --- Režimų formos ---
  if (assert(html.includes('id="form-master"'), 'MASTER forma egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="form-dienos"'), 'DIENOS forma egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="form-savaites"'), 'SAVAITĖS forma egzistuoja')) passed++;
  else failed++;

  // --- Gylio pasirinkimas (3 lygiai) ---
  if (assert(html.includes('data-depth="GREITA"'), 'Gylis: GREITA egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('data-depth="GILU"'), 'Gylis: GILU egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('data-depth="BOARD"'), 'Gylis: BOARD egzistuoja')) passed++;
  else failed++;

  // --- Output ---
  if (assert(html.includes('id="opsOutput"'), 'Output sekcija (opsOutput) egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="outputCharCount"'), 'Simbolių skaičiuoklė (outputCharCount) egzistuoja')) passed++;
  else failed++;

  // --- Sesijų panelė ---
  if (assert(html.includes('id="sessionsPanel"'), 'Sesijų panelė egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="sessionSaveBtn"'), 'Sesijos išsaugojimo mygtukas')) passed++;
  else failed++;
  if (assert(html.includes('id="sessionList"'), 'Sesijų sąrašas egzistuoja')) passed++;
  else failed++;

  // --- Biblioteka ---
  if (assert(html.includes('id="library"'), 'Bibliotekos sekcija egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="libraryGrid"'), 'Bibliotekos grid egzistuoja')) passed++;
  else failed++;

  // --- Taisyklės ---
  if (assert(html.includes('id="rules"'), 'Taisyklių sekcija egzistuoja')) passed++;
  else failed++;
  if (assert(html.includes('id="rulesList"'), 'Taisyklių sąrašas egzistuoja')) passed++;
  else failed++;

  // --- Kopijavimo mygtukas ---
  if (assert(html.includes('Kopijuoti užklaus') || html.includes('Kopijuoti prompt'), 'Kopijavimo mygtukas egzistuoja')) passed++;
  else failed++;

  // --- Prieinamumas / semantika ---
  if (assert(html.includes('href="#main-content"') && html.includes('skip-link'), 'Skip link į main-content')) passed++;
  else failed++;
  if (assert(html.includes('id="main-content"') && html.includes('<main'), 'Main region (main-content)')) passed++;
  else failed++;
  if (assert(html.includes('id="toast"') && html.includes('role="status"'), 'Toast pranešimas')) passed++;
  else failed++;
  if (assert(html.includes('privatumas.html'), 'Nuoroda į privatumas.html')) passed++;
  else failed++;
  if (assert(html.includes('lang="lt"'), 'HTML lang="lt"')) passed++;
  else failed++;

  // --- ARIA ---
  if (assert(html.includes('role="tablist"'), 'Mode tabs turi role="tablist"')) passed++;
  else failed++;
  if (assert(html.includes('role="tabpanel"'), 'Form panels turi role="tabpanel"')) passed++;
  else failed++;
  if (assert(html.includes('role="radiogroup"'), 'Depth selector turi role="radiogroup"')) passed++;
  else failed++;
  if (assert(html.includes('aria-live="polite"'), 'Live region output')) passed++;
  else failed++;

  // --- Moduliniai failai ---
  if (assert(html.includes('href="style.css"'), 'Link į style.css')) passed++;
  else failed++;
  if (assert(html.includes('src="generator.js"'), 'Script src generator.js')) passed++;
  else failed++;
  if (assert(html.includes('src="copy.js"'), 'Script src copy.js')) passed++;
  else failed++;
  if (assert(html.includes('hiddenTextarea'), 'Fallback textarea kopijavimui')) passed++;
  else failed++;

  // --- Failų egzistavimas ---
  const styleFile = readFile(STYLE_PATH);
  if (assert(styleFile !== null && styleFile.length > 0, 'style.css failas egzistuoja')) passed++;
  else failed++;
  const generatorFile = readFile(GENERATOR_PATH);
  if (assert(generatorFile !== null && generatorFile.length > 0, 'generator.js failas egzistuoja')) passed++;
  else failed++;
  const copyFile = readFile(COPY_PATH);
  if (assert(copyFile !== null && copyFile.length > 0, 'copy.js failas egzistuoja')) passed++;
  else failed++;

  // --- Privatumas.html egzistuoja ---
  const privatumas = readFile(PRIVATUMAS_PATH);
  if (assert(privatumas !== null && privatumas.length > 0, 'privatumas.html egzistuoja')) passed++;
  else failed++;

  // --- generator.js tikrinimas ---
  if (assert(generatorFile && generatorFile.includes('localStorage'), 'localStorage naudojamas (generator.js)')) passed++;
  else failed++;
  if (assert(generatorFile && generatorFile.includes('LIBRARY_PROMPTS'), 'LIBRARY_PROMPTS apibrėžti (generator.js)')) passed++;
  else failed++;
  if (assert(generatorFile && generatorFile.includes('DEPTH_LEVELS'), 'DEPTH_LEVELS apibrėžti (generator.js)')) passed++;
  else failed++;
  if (assert(generatorFile && generatorFile.includes('MODES'), 'MODES apibrėžti (generator.js)')) passed++;
  else failed++;

  // --- CSS kintamieji ---
  if (assert(styleFile && styleFile.includes('--primary: #4A148C'), 'CSS kintamasis --primary: #4A148C')) passed++;
  else failed++;

  console.log('\n---');
  console.log(`Rezultatas: ${passed} praeina, ${failed} nepraeina.`);
  if (failed > 0) {
    process.exit(1);
  }
  console.log('Visi strukt\u016Briniai testai praeina.\n');
}

run();
