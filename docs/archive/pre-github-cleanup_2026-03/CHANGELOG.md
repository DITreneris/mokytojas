# Changelog

Formatas pagal [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), versijavimas – [Semantic Versioning](https://semver.org/).

## [Nereleisuota]

### Prideta
- Šablonų bibliotekoje pridėtas 6-as šablonas: `Vadovo savirefleksija` (CEO savaitinei sprendimų peržiūrai).
- Įvestas globalus šablonų ilgio limitas: iki `1100` simbolių visiems bibliotekos šablonams.
- Bibliotekos šablonų skaitiklis padarytas dinaminis (`libraryTemplateCount`) ir rodo realų šablonų kiekį.
- Dokumentacija: atnaujintas `README.md`, pridėti `todo.md` ir `roadmap.md`.
- `docs/FIRST_RUN_USER_JOURNEY_AUDIT.md` su pirmo paleidimo kelionės analize, mikrocopy paketu, UX backlogu ir QA checklist.
- `index.html` output zonoje pridėti diskretiški mygtukai: `Atidaryti ChatGPT`, `Atidaryti Claude`, `Atidaryti Gemini`.
- Pilnai perrašytas `README.md` pagal dabartinį produktą ir first-run vartotojo kelionę.
- Sukurtas `docs/INDEX.md` kaip centrinis dokumentacijos įėjimo taškas (Start Here, Run and Verify, Release and Deploy, Archive).
- Pridėtas `mixed` testų sluoksnis: Playwright smoke testai (`320/375/768`) ir kritinių first-run kelių E2E testai.
- Pridėtas `playwright.config.js` ir nauji test scriptai: `test:smoke`, `test:e2e`, `test:mixed`.

### Pakeista
- `README.md` papildytas aktyviu `Golden Standard (UI)` skyriumi (violetinė brand kryptis, hierarchija, CTA dominavimas, a11y).
- `style.css` perpoliruotas white/dark režimams: aiškesnė tonalinė hierarchija, layered shadows, stipresnis CTA, input ir sessions vizualinė tvarka.
- `index.html` ir `generator.js` mikrocopy/perrašai suvienodinti į aiškią CEO kalbą (`užklausa` vietoje perteklinių terminų).
- `index.html` bibliotekos tekstai ir sesijų empty state atnaujinti į aiškesnę verslo kalbą.
- `tests/structure.test.js` pritaikytas naujai terminijai (`Kopijuoti užklausą`) su backward-compatible tikrinimu.
- `README.md` sutvarkytas pagal dabartinį projektą (DI Operacinis Centras).
- `index.html` mikrocopy: naudos orientuotas hero tekstas, aiškesni CTA, gylio rekomendacija, "kas toliau" žinutė po kopijavimo, aiškesnis sesijų trynimo tekstas.
- `privatumas.html` terminija ir localStorage aprašas suderinti su `DI Operacinis Centras`.
- `generator.js` papildytas saugiu `open-only` AI įrankių atidarymu su host allowlist (`chatgpt.com`, `claude.ai`, `gemini.google.com`).
- `style.css` papildytas secondary launcher mygtukų stiliais su focus būsena ir mobile 44px ergonomika.
- Dokumentacija suvienodinta pagal produkto pavadinimą `DI Operacinis Centras` (`DEPLOYMENT.md`, `docs/QA_STANDARTAS.md`, `docs/TESTAVIMAS.md`).
- `docs/DOCUMENTATION.md` pridėta terminų taisyklė: pirmas paminėjimas `užklausa (promptas)`, toliau `promptas`.
- CI/deploy hardening: `.github/workflows/ci.yml` ir `.github/workflows/deploy.yml` perkelti į `npm ci`, deploy teste įtraukta pa11y patikra.
- Deploy artefaktas apribotas iki runtime failų, kad į GitHub Pages nepatektų pertekliniai dokumentai.
- `.gitignore` nebeignoruoja `package-lock.json`, o `.eslintrc.json` išvalytas nuo stale override ir sugriežtintas `no-console` produkciniam kodui.
- `generator.js` papildytas klaviatūrine rodyklių navigacija mode tabams ir gylio pasirinkimui (`Arrow`, `Home`, `End`).
- `style.css` atnaujintas mobile remediacijai (`320–768`): touch target’ai 44px, top-nav ir accordion sutalpinimas, output/sessions wrap, `session-item:focus-visible`.
- CI/deploy grandinėje įtraukti smoke testai; CI papildyta Playwright browser diegimo fazė.
- `docs/QA_STANDARTAS.md`, `docs/TESTAVIMAS.md`, `docs/FIRST_RUN_USER_JOURNEY_AUDIT.md`, `DEPLOYMENT.md` papildyti mobile/test gate kriterijais.

### Pataisyta
- A11y kontrasto regresijos (`Pa11y`): `header-step-num`, `.field-help`, `#sessionsEmpty` elementams pakeltas kontrastas iki WCAG 2.1 AA.
- `npm run test:a11y` dabar praeina be klaidų (`/` ir `/privatumas.html`).

---

## [1.2.0] - 2026-02-27

### Prideta
- **Tools „select then CTA"** – įrankių kortelės dabar veikia dviem žingsniais: 1) pasirinkti kortelę, 2) spausti „Kopijuoti + atidaryti" CTA mygtuką. Pašalintas pavojingas 1-click auto-copy+auto-open.
- **Smart prompt kopijavimas** – CTA mygtukas automatiškai parenka Pro promptą (jei užpildytas objektas) arba Mini promptą.
- **Helper text** – po pagrindiniais laukais (Mini + Pro) pridėtas pastovus pavyzdžių tekstas (`field-help`), placeholderiai sutrumpinti.
- **Spalvos chips** – 7 spalvos chips (Auksinė, Mėlyna, Pastelinė, Koralinė, Žalia, Violetinė, Neutrali) su spalvos žymekliais ir dvikrypte sinchronizacija su teksto lauku.
- **Completion x/y** – step status pakeistas iš binarinio „Nepilna/Atlikta" į „0/2 užpildyta" / „1/2 užpildyta" / „2/2 Atlikta" su trimis vizualinėmis būsenomis (info, partial, complete).
- **Stiprumo paaiškinimas** – po „Stiprumas X/7" pill pridėtas dinaminis hint tekstas, keičiantis pagal tier (Silpnas → Premium).
- **Semantinė pill sistema** – bendra `.pill` bazė su `--info`, `--warning`, `--success`, `--premium` modifikatoriais, dark mode palaikymas. Pritaikyta step statusams ir „Rekomenduojama" badge.
- **Prompt highlight diferenciacija** – naujas `.gen-key` (geltona, bold) kritiniams tokenams (stilius, platforma, tonas) ir `.gen-value` (balta, pabraukta) normaliems tokenams.

### Pakeista
- **Hero suspaustas** – sumažinti padding, H1 (52→40px), subtitle, CTA mygtukų dydžiai; container top padding sumažintas. Darbinė zona (mini generatorius) matoma pirmame ekrane.
- **Tipografijos hierarchija sustiprinita** – suderinti H1/H2/section title/step header/label dydžiai vienodesnei skalei.
- Tools sekcijos aprašomasis tekstas atnaujintas pagal naują select-then-CTA elgseną.
- Responsive taisyklės atnaujintos spalvos chips, action bar ir sutraukto hero komponentams.

---

## [1.1.0] - 2026-02-27

### Prideta
- **4 žingsnių proceso navigacija** hero viršuje (Sukurk promptą / Šablonai / Generuok vaizdą / Pro režimas) su aktyvaus žingsnio paryškinimu.
- **Step-badge numeracija** – kiekvieno bloko header'yje apskritas numeris (premium SaaS stilius), vertės eilutė ir nuoseklus vizualinis pattern'as.
- **Accordion (single-open) elgsena** – vienu metu atverta tik viena iš 3 suskleidžiamų sekcijų (Šablonai / Įrankiai / Pro režimas); būsena įsimenama per `localStorage`.
- **Įrankių sekcija padaryta collapsible** (nauja toggle struktūra su `toolsToggle` / `toolsBody`).
- **Hero žingsnių sinchronizacija** su accordion – paspaudus hero žingsnį atidaroma atitinkama sekcija, o atidarius sekciją pažymimas teisingas hero žingsnis.
- Bendra `.collapsible-toggle` CSS sistema – vienodas grid layout visiems toggle header'iams (badge / title / count / chevron / value).
- `.section-header-row` – premium header'is ne-collapsible blokui (mini generatorius).

### Pakeista
- „Ekspertinis generatorius" pervadintas į **„Pro režimas"** (aiškesnis pavadinimas vartotojui).
- Šablonų sekcija default uždaryta (anksčiau buvo atverta).
- `privatumas.html` – atnaujintas `localStorage` aprašas (tema + accordion būsena).
- Pašalinta nenaudojama `applyPreset()` funkcija (`generator.js`).
- HTML semantika sutvarkyta pagal W3C validator'ių (`h2 > button` vietoj `button > h2`; `role="region"` kur reikia).
- Responsive taisyklės atnaujintos naujam `.collapsible-toggle` / `.step-badge` layout'ui.

---

## [1.0.0] - 2026-02-27

### Prideta
- Spin-off Nr. 4: **DI Vaizdo Generatorius** (statinė HTML aplikacija).
- Mini generatorius su šablonais (preset’ai) ir gyva prompto išvestimi.
- Šablonų biblioteka (paruošti promptai) + kopijavimo UX.
- `generator.js` (generatoriaus logika) ir `copy.js` (kopijavimas + toast).
- `style.css` (dizainas + tamsus režimas).
- `tests/structure.test.js` (projekto struktūros testai).

### Pakeista
- `index.html`, `privatumas.html`, `favicon.svg` pritaikyti šiam projektui.
