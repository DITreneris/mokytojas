(function () {
    'use strict';

    var APP_ID = 'di_ops_center';
    var MAX_SESSIONS = 5;
    var TEMPLATE_CHAR_LIMIT = 1100;
    var THEME_KEY = APP_ID + '_theme';
    var DEPTH_KEY = APP_ID + '_depth';
    var SESSIONS_KEY = APP_ID + '_sessions';
    var AI_TOOL_URLS = {
        chatgpt: 'https://chatgpt.com/',
        claude: 'https://claude.ai/',
        gemini: 'https://gemini.google.com/'
    };
    var AI_TOOL_ALLOWED_HOSTS = {
        'chatgpt.com': true,
        'claude.ai': true,
        'gemini.google.com': true
    };

    /* ===== CONSTANTS ===== */

    var MODES = {
        MASTER: {
            label: 'STRATEGINIS',
            desc: 'Strateginis savaitės/mėnesio kontekstas',
            formId: 'form-master',
            fields: ['goal', 'horizon', 'income', 'expenses', 'profit', 'cash', 'runway', 'facts', 'question']
        },
        DIENOS: {
            label: 'DIENOS',
            desc: 'Vakarykštės operacijos apžvalga',
            formId: 'form-dienos',
            fields: ['v_pajamos', 'v_klientai', 'v_islaidos', 'v_ivykiai', 'question']
        },
        SAVAITES: {
            label: 'SAVAITĖS',
            desc: 'Savaitės projektai ir veikimo rezervas',
            formId: 'form-savaites',
            fields: ['s_pajamos', 's_sanaudos', 's_likutis', 'projektai', 's_pipeline', 'question']
        }
    };

    var DEPTH_LEVELS = {
        GREITA: {
            label: 'Greita',
            instruction: 'Atsakyk trumpai ir aiškiai: daugiausia 3 punktai, kiekvienas po 1-2 sakinius, be įžangos.',
            format: '3 prioritetai + 3 veiksmai + 1 rizika'
        },
        GILU: {
            label: 'Gilu',
            instruction: 'Pateik išsamią analizę su kontekstu ir pagrindimu. Kiekvienam punktui nurodyk, kodėl svarbu ir koks poveikis. Remkis skaičiais.',
            format: '3 prioritetai (su naudos pagrindimu) + 5 veiksmai (su terminais) + 2 rizikos (su mažinimo planais) + 1 ilgalaikė rekomendacija'
        },
        BOARD: {
            label: 'Valdybai',
            instruction: 'Parenk valdybos lygio santrauką. Tik faktai ir skaičiai, be nuomonių. Struktūra: Santrauka -> Finansai -> Veiksmai -> Rizikos. Kalba formali.',
            format: 'Santrauka (3 sakiniai) + Finansinė padėtis (lentelė) + TOP 3 prioritetai + 5 veiksmai su rodikliais + Rizikų matrica + Rekomendacija valdybai'
        }
    };

    var LIBRARY_PROMPTS = [
        {
            id: 'unit_economics',
            title: 'Vieneto ekonomika',
            desc: 'Vieneto ekonomikos analizė',
            icon: 'calculator',
            prompt: 'Esi finansų analitikas. Mano verslo duomenys:\n- Vidutinės pajamos iš kliento (ARPU): [suma]\n- Kliento pritraukimo kaina (CAC): [suma]\n- Kliento gyvavimo vertė (LTV): [suma]\n- Bendroji marža: [%]\n\nAtlik vieneto ekonomikos analizę:\n1. Įvertink LTV/CAC santykį\n2. Nustatyk atsipirkimo laikotarpį\n3. Įvardyk didžiausius svertus (ARPU didinimas, CAC mažinimas, išlaikymo gerinimas)\n4. Pasiūlyk 3 konkrečius veiksmus'
        },
        {
            id: 'augimo_svertai',
            title: 'Augimo svertai',
            desc: 'Augimo galimybių identifikavimas',
            icon: 'trending-up',
            prompt: 'Esi augimo strategas. Mano verslo situacija:\n- Dabartinės mėnesio pajamos: [suma]\n- Tikslas per [laikotarpis]: [suma]\n- Dabartiniai kanalai: [kanalai]\n- Konversijos rodiklis: [%]\n\nNustatyk augimo svertus:\n1. TOP 3 svertai su didžiausiu naudos potencialu\n2. Kiekvienam svertui nurodyk: ką darome, kokį poveikį tikimės gauti ir per kiek laiko\n3. Greitos pergalės (iki 2 savaičių)\n4. Pagrindinės rizikos ir priklausomybės'
        },
        {
            id: 'cash_runway',
            title: 'Pinigų rezervas',
            desc: 'Pinigų srauto analizė ir planavimas',
            icon: 'wallet',
            prompt: 'Esi finansų konsultantas. Mano situacija:\n- Grynųjų likutis: [suma]\n- Mėnesio pajamos: [suma]\n- Mėnesio išlaidos: [suma]\n- Išlaidų tempo tendencija: [didėja/mažėja/stabili]\n\nAtlik pinigų rezervo analizę:\n1. Įvertink dabartinį veikimo rezervą mėnesiais\n2. Pateik scenarijus: optimistinis / bazinis / pesimistinis\n3. Pasiūlyk pinigų srauto gerinimo veiksmus (30/60/90 dienų)\n4. Įvardyk raudonos zonos rodiklius - kada reikia veikti'
        },
        {
            id: 'kainodara',
            title: 'Kainodara',
            desc: 'Kainodaros strategijos optimizavimas',
            icon: 'tag',
            prompt: 'Esi kainodaros ekspertas. Mano produktas/paslauga:\n- Dabartinė kaina: [kaina]\n- Konkurentų kainų diapazonas: [nuo-iki]\n- Bendroji marža: [%]\n- Klientų tipai: [segmentai]\n\nPateik kainodaros rekomendacijas:\n1. Įvertink dabartinę kainą rinkos kontekste\n2. Pagrįsk vertę per kliento gaunamą naudą\n3. Pasiūlyk kelių planų kainodaros variantus\n4. Parenk kainos testavimo planą'
        },
        {
            id: 'riziku_valdymas',
            title: 'Rizikų valdymas',
            desc: 'Pagrindinių rizikų identifikavimas',
            icon: 'shield-alert',
            prompt: 'Esi rizikų valdymo specialistas. Mano verslo kontekstas:\n- Sritis: [sritis]\n- Komandos dydis: [žmonės]\n- Pagrindiniai klientai: [kiek, koncentracija]\n- Pajamų šaltiniai: [šaltiniai]\n\nAtlik rizikų auditą:\n1. Išskirk TOP 5 rizikas (tikimybė x poveikis)\n2. Kiekvienai rizikai pateik prevencijos ir mažinimo planą\n3. Įvardyk ankstyvuosius įspėjamuosius rodiklius\n4. Parenk veiksmų planą, jei rizika realizuojasi'
        },
        {
            id: 'vadovo_savirefleksija',
            title: 'Vadovo savirefleksija',
            desc: 'Sprendimų kokybės peržiūra',
            icon: 'brain',
            prompt: 'Esi mano strateginis koučeris. Padėk man, kaip CEO, atlikti savaitės savirefleksiją remiantis faktais.\n\nKontekstas:\n- Šios savaitės tikslas: [tikslas]\n- Svarbiausi sprendimai: [sprendimai]\n- Ką padariau gerai: [stiprybės]\n- Kur strigau: [silpnos vietos]\n- Komandos signalai: [faktai]\n- Finansinis rezultatas: [pajamos / išlaidos / marža]\n\nPateik atsakymą 4 dalimis:\n1. 5 tikslūs klausimai man, kurių vengiu, bet turiu sau atsakyti\n2. 3 pagrindinės vadovo klaidos rizikos šioje situacijoje\n3. 3 sprendimai kitai savaitei su aiškiu prioritetu (A/B/C)\n4. Viena asmeninė disciplina 7 dienoms, kuri turės didžiausią poveikį'
        }
    ];

    function applyLibraryPromptLimit() {
        LIBRARY_PROMPTS.forEach(function (item) {
            if (!item || typeof item.prompt !== 'string') return;

            var text = item.prompt.replace(/\r\n/g, '\n').trim();
            if (text.length > TEMPLATE_CHAR_LIMIT) {
                var truncated = text.slice(0, TEMPLATE_CHAR_LIMIT).trim();
                var breakAt = Math.max(truncated.lastIndexOf('\n'), truncated.lastIndexOf('. '));
                if (breakAt > Math.floor(TEMPLATE_CHAR_LIMIT * 0.7)) {
                    truncated = truncated.slice(0, breakAt).trim();
                }
                text = truncated;
            }

            item.prompt = text;
        });
    }

    applyLibraryPromptLimit();

    var RULES = [
        { text: 'Kiekvienas sprendimas turi aiškų verslo naudos pagrindimą', icon: 'check-circle' },
        { text: 'Pinigų srautas > pelnas > pajamos: tokia prioritetų seka', icon: 'check-circle' },
        { text: 'Veikimo rezervas < 6 mėn. = raudona zona, reikia veiksmų plano', icon: 'alert-triangle' },
        { text: 'Kiekviena savaitė turi 3 prioritetus, ne daugiau', icon: 'check-circle' },
        { text: 'Problemas spręsk „5 Kodėl" metodu', icon: 'check-circle' },
        { text: 'Valdybos ataskaitoje – tik faktai ir skaičiai, be nuomonių', icon: 'check-circle' },
        { text: 'Kiekvienas veiksmas turi terminą ir atsakingą asmenį', icon: 'check-circle' },
        { text: 'Savaitės peržiūra: kas pavyko, kas nepavyko, ką keičiame', icon: 'check-circle' }
    ];

    /* ===== STATE ===== */

    var activeMode = 'MASTER';
    var activeDepth = 'GREITA';
    var formData = {};

    function initFormData() {
        formData = {};
        Object.keys(MODES).forEach(function (mode) {
            formData[mode] = {};
            MODES[mode].fields.forEach(function (field) {
                formData[mode][field] = '';
            });
        });
    }

    initFormData();

    /* ===== HELPERS ===== */

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isFilled(value) {
        return String(value || '').trim().length > 0;
    }

    /* ===== PROMPT GENERATION ===== */

    function buildMasterPrompt(data, depth) {
        var parts = [];

        parts.push('ROLĖ: Esi strateginis verslo konsultantas, dirbantis su CEO/COO.');
        parts.push('');

        if (isFilled(data.goal)) {
            parts.push('KONTEKSTAS:');
            parts.push('- Strateginis tikslas: ' + data.goal);
            if (isFilled(data.horizon)) parts.push('- Laiko horizontas: ' + data.horizon);
            parts.push('');
        }

        var hasFinancials = isFilled(data.income) || isFilled(data.expenses) || isFilled(data.profit) || isFilled(data.cash) || isFilled(data.runway);
        if (hasFinancials) {
            parts.push('FINANSAI:');
            if (isFilled(data.income)) parts.push('- Pajamos (mėn.): ' + data.income);
            if (isFilled(data.expenses)) parts.push('- Išlaidos (mėn.): ' + data.expenses);
            if (isFilled(data.profit)) parts.push('- Pelnas (mėn.): ' + data.profit);
            if (isFilled(data.cash)) parts.push('- Grynieji likučiai: ' + data.cash);
            if (isFilled(data.runway)) parts.push('- Veikimo rezervas (mėn.): ' + data.runway);
            parts.push('');
        }

        if (isFilled(data.facts)) {
            parts.push('FAKTAI: ' + data.facts);
            parts.push('');
        }

        if (isFilled(data.question)) {
            parts.push('KLAUSIMAS: ' + data.question);
        } else {
            parts.push('KLAUSIMAS: Kokie yra 3 svarbiausi šios savaitės prioritetai ir veiksmai?');
        }

        parts.push('');
        parts.push('GYLIS: ' + depth.instruction);
        parts.push('');
        parts.push('IŠVESTIES FORMATAS: ' + depth.format);

        return parts.join('\n');
    }

    function buildDienosPrompt(data, depth) {
        var parts = [];

        parts.push('ROLĖ: Esi operacijų analitikas, padedantis CEO/COO įvertinti vakarykštę dieną.');
        parts.push('');

        parts.push('VAKARYKŠTĖS DUOMENYS:');
        if (isFilled(data.v_pajamos)) parts.push('- Pajamos: ' + data.v_pajamos);
        if (isFilled(data.v_klientai)) parts.push('- Nauji klientai / užklausos: ' + data.v_klientai);
        if (isFilled(data.v_islaidos)) parts.push('- Išlaidos: ' + data.v_islaidos);
        parts.push('');

        if (isFilled(data.v_ivykiai)) {
            parts.push('SVARBIAUSI ĮVYKIAI: ' + data.v_ivykiai);
            parts.push('');
        }

        if (isFilled(data.question)) {
            parts.push('KLAUSIMAS: ' + data.question);
        } else {
            parts.push('KLAUSIMAS: Ką šiandien turėčiau daryti kitaip, remiantis vakarykščiais duomenimis?');
        }

        parts.push('');
        parts.push('GYLIS: ' + depth.instruction);
        parts.push('');
        parts.push('IŠVESTIES FORMATAS: ' + depth.format);

        return parts.join('\n');
    }

    function buildSavaitesPrompt(data, depth) {
        var parts = [];

        parts.push('ROLĖ: Esi savaitės veiklos analitikas, rengiantis CEO/COO savaitės apžvalgą.');
        parts.push('');

        parts.push('SAVAITĖS DUOMENYS:');
        if (isFilled(data.s_pajamos)) parts.push('- Pajamos: ' + data.s_pajamos);
        if (isFilled(data.s_sanaudos)) parts.push('- Sąnaudos: ' + data.s_sanaudos);
        if (isFilled(data.s_likutis)) parts.push('- Grynųjų likutis: ' + data.s_likutis);
        parts.push('');

        if (isFilled(data.projektai)) {
            parts.push('AKTYVŪS PROJEKTAI: ' + data.projektai);
            parts.push('');
        }

        if (isFilled(data.s_pipeline)) {
            parts.push('PARDAVIMŲ EILĖ: ' + data.s_pipeline);
            parts.push('');
        }

        if (isFilled(data.question)) {
            parts.push('KLAUSIMAS: ' + data.question);
        } else {
            parts.push('KLAUSIMAS: Kuriuos projektus prioritetizuoti ir kokie 3 svarbiausi šios savaitės veiksmai?');
        }

        parts.push('');
        parts.push('GYLIS: ' + depth.instruction);
        parts.push('');
        parts.push('IŠVESTIES FORMATAS: ' + depth.format);

        return parts.join('\n');
    }

    function getGeneratedPrompt() {
        var data = formData[activeMode] || {};
        var depth = DEPTH_LEVELS[activeDepth];

        if (activeMode === 'MASTER') return buildMasterPrompt(data, depth);
        if (activeMode === 'DIENOS') return buildDienosPrompt(data, depth);
        return buildSavaitesPrompt(data, depth);
    }

    /* ===== OUTPUT UPDATE ===== */

    function updateOutput() {
        var el = document.getElementById('opsOutput');
        if (!el) return;

        var prompt = getGeneratedPrompt();

        el.classList.remove('is-refreshing');
        void el.offsetWidth;
        el.classList.add('is-refreshing');

        el.textContent = prompt;

        var countEl = document.getElementById('outputCharCount');
        if (countEl) countEl.textContent = String(prompt.length);

        var depthBadge = document.getElementById('depthBadge');
        if (depthBadge) depthBadge.textContent = DEPTH_LEVELS[activeDepth].label;
    }

    /* ===== MODE SWITCHING ===== */

    function switchMode(newMode) {
        if (!MODES[newMode] || newMode === activeMode) return;

        activeMode = newMode;

        document.querySelectorAll('.mode-tab').forEach(function (tab) {
            var isTarget = tab.getAttribute('data-mode') === newMode;
            tab.classList.toggle('is-active', isTarget);
            tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        });

        Object.keys(MODES).forEach(function (mode) {
            var panel = document.getElementById(MODES[mode].formId);
            if (panel) panel.hidden = mode !== newMode;
        });

        updateOutput();
    }

    function setupModeTabsKeyboard() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));
        if (!tabs.length) return;

        tabs.forEach(function (tab, index) {
            tab.addEventListener('keydown', function (e) {
                var targetIndex = index;
                if (e.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
                else if (e.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
                else if (e.key === 'Home') targetIndex = 0;
                else if (e.key === 'End') targetIndex = tabs.length - 1;
                else return;

                e.preventDefault();
                var targetTab = tabs[targetIndex];
                if (!targetTab) return;
                switchMode(targetTab.getAttribute('data-mode'));
                targetTab.focus();
            });
        });
    }

    /* ===== DEPTH SWITCHING ===== */

    function switchDepth(newDepth) {
        if (!DEPTH_LEVELS[newDepth] || newDepth === activeDepth) return;

        activeDepth = newDepth;

        document.querySelectorAll('.depth-btn').forEach(function (btn) {
            var isTarget = btn.getAttribute('data-depth') === newDepth;
            btn.classList.toggle('is-active', isTarget);
            btn.setAttribute('aria-checked', isTarget ? 'true' : 'false');
        });

        try { localStorage.setItem(DEPTH_KEY, newDepth); } catch (_) { /* ignore */ }

        updateOutput();
    }

    function setupDepthKeyboard() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.depth-btn'));
        if (!buttons.length) return;

        buttons.forEach(function (btn, index) {
            btn.addEventListener('keydown', function (e) {
                var targetIndex = index;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') targetIndex = (index + 1) % buttons.length;
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') targetIndex = (index - 1 + buttons.length) % buttons.length;
                else if (e.key === 'Home') targetIndex = 0;
                else if (e.key === 'End') targetIndex = buttons.length - 1;
                else return;

                e.preventDefault();
                var targetBtn = buttons[targetIndex];
                if (!targetBtn) return;
                switchDepth(targetBtn.getAttribute('data-depth'));
                targetBtn.focus();
            });
        });
    }

    /* ===== FORM INPUT HANDLING ===== */

    function handleFormInput(e) {
        var field = e.target;
        var name = field.name;
        if (!name) return;

        if (formData[activeMode] && MODES[activeMode].fields.indexOf(name) !== -1) {
            formData[activeMode][name] = field.value;
            updateOutput();
        }
    }

    /* ===== SESSIONS ===== */

    function getSessions() {
        try {
            var raw = localStorage.getItem(SESSIONS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    }

    function saveSessions(sessions) {
        try {
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        } catch (_) { /* ignore */ }
    }

    function saveSession() {
        var sessions = getSessions();

        var session = {
            id: Date.now(),
            mode: activeMode,
            depth: activeDepth,
            data: JSON.parse(JSON.stringify(formData[activeMode])),
            date: new Date().toLocaleString('lt-LT')
        };

        sessions.unshift(session);
        if (sessions.length > MAX_SESSIONS) sessions = sessions.slice(0, MAX_SESSIONS);

        saveSessions(sessions);
        renderSessions();
    }

    function loadSession(session) {
        if (!session || !session.mode || !MODES[session.mode]) return;

        switchMode(session.mode);

        if (session.depth && DEPTH_LEVELS[session.depth]) {
            switchDepth(session.depth);
        }

        if (session.data) {
            formData[session.mode] = JSON.parse(JSON.stringify(session.data));

            var formEl = document.getElementById(MODES[session.mode].formId);
            if (formEl) {
                MODES[session.mode].fields.forEach(function (fieldName) {
                    var input = formEl.querySelector('[name="' + fieldName + '"]');
                    if (input && session.data[fieldName] !== undefined) {
                        input.value = session.data[fieldName];
                    }
                });
            }
        }

        updateOutput();
    }

    function clearSessions() {
        try { localStorage.removeItem(SESSIONS_KEY); } catch (_) { /* ignore */ }
        renderSessions();
    }

    function renderSessions() {
        var list = document.getElementById('sessionList');
        if (!list) return;

        var sessions = getSessions();

        list.innerHTML = '';

        if (sessions.length === 0) {
            var li = document.createElement('li');
            li.className = 'sessions-empty';
            li.id = 'sessionsEmpty';
            li.innerHTML =
                '<span class="sessions-empty-icon" aria-hidden="true">' +
                    '<i data-lucide="sparkles" class="icon icon--sm"></i>' +
                '</span>' +
                'Sesijų dar nėra. Sukurk pirmą analizę.';
            list.appendChild(li);
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons({ root: list });
            }
            return;
        }

        sessions.forEach(function (session) {
            var li = document.createElement('li');
            li.className = 'session-item';
            li.setAttribute('role', 'button');
            li.setAttribute('tabindex', '0');
            li.setAttribute('aria-label', 'Įkelti ' + (MODES[session.mode] ? MODES[session.mode].label : session.mode) + ' sesiją nuo ' + session.date);

            li.innerHTML =
                '<div class="session-item-info">' +
                    '<span class="session-item-mode">' + escapeHtml(MODES[session.mode] ? MODES[session.mode].label : session.mode) + '</span>' +
                    '<span class="session-item-date">' + escapeHtml(session.date) + '</span>' +
                '</div>' +
                '<span class="session-item-load">Įkelti →</span>';

            li.addEventListener('click', function () { loadSession(session); });
            li.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    loadSession(session);
                }
            });

            list.appendChild(li);
        });

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons({ root: list });
        }
    }

    /* ===== LIBRARY ===== */

    function renderLibrary() {
        var grid = document.getElementById('libraryGrid');
        if (!grid) return;

        var countEl = document.getElementById('libraryTemplateCount');
        if (countEl) {
            countEl.textContent = LIBRARY_PROMPTS.length + ' šablonai';
        }

        grid.innerHTML = '';

        LIBRARY_PROMPTS.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'library-card';

            card.innerHTML =
                '<div class="library-card-header">' +
                    '<div class="library-card-icon"><i data-lucide="' + escapeHtml(item.icon) + '" class="icon icon--md"></i></div>' +
                    '<div>' +
                        '<div class="library-card-title">' + escapeHtml(item.title) + '</div>' +
                        '<div class="library-card-desc">' + escapeHtml(item.desc) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="library-card-prompt">' + escapeHtml(item.prompt) + '</div>' +
                '<div class="library-card-actions">' +
                    '<button type="button" class="library-btn library-btn--primary" data-library-apply="' + escapeHtml(item.id) + '">' +
                        '<i data-lucide="file-input" class="icon icon--sm"></i> Taikyti formoje' +
                    '</button>' +
                    '<button type="button" class="library-btn" data-library-copy="' + escapeHtml(item.id) + '">' +
                        '<i data-lucide="copy" class="icon icon--sm"></i> Kopijuoti' +
                    '</button>' +
                '</div>';

            grid.appendChild(card);
        });

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons({ root: grid });
        }

        grid.addEventListener('click', function (e) {
            var applyBtn = e.target.closest('[data-library-apply]');
            if (applyBtn) {
                var id = applyBtn.getAttribute('data-library-apply');
                applyLibraryPrompt(id);
                return;
            }

            var copyBtn = e.target.closest('[data-library-copy]');
            if (copyBtn) {
                var copyId = copyBtn.getAttribute('data-library-copy');
                copyLibraryPrompt(copyId);
            }
        });
    }

    function applyLibraryPrompt(id) {
        var item = LIBRARY_PROMPTS.find(function (p) { return p.id === id; });
        if (!item) return;

        var questionField = document.querySelector('#' + MODES[activeMode].formId + ' [name="question"]');
        if (questionField) {
            questionField.value = item.prompt;
            formData[activeMode].question = item.prompt;
            updateOutput();
        }
    }

    function copyLibraryPrompt(id) {
        var item = LIBRARY_PROMPTS.find(function (p) { return p.id === id; });
        if (!item) return;

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(item.prompt).then(function () {
                showToastIfAvailable();
            });
        } else {
            fallbackCopy(item.prompt);
            showToastIfAvailable();
        }
    }

    /* ===== RULES ===== */

    function renderRules() {
        var list = document.getElementById('rulesList');
        if (!list) return;

        list.innerHTML = '';

        RULES.forEach(function (rule) {
            var li = document.createElement('li');
            li.className = 'rules-item';
            li.innerHTML =
                '<i data-lucide="' + escapeHtml(rule.icon) + '" class="icon icon--md"></i>' +
                '<span>' + escapeHtml(rule.text) + '</span>';
            list.appendChild(li);
        });

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons({ root: list });
        }
    }

    /* ===== COPY ===== */

    function fallbackCopy(text) {
        var ta = document.getElementById('hiddenTextarea');
        if (!ta) return;
        ta.style.position = 'fixed';
        ta.style.left = '0';
        ta.style.top = '0';
        ta.style.opacity = '0';
        ta.value = text;
        ta.focus();
        ta.select();
        try { document.execCommand('copy'); } catch (_) { /* ignore */ }
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
    }

    function showToastIfAvailable() {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.classList.add('show');
        var progress = document.getElementById('toastProgress');
        if (progress) {
            progress.style.animation = 'none';
            void progress.offsetWidth;
            progress.style.animation = 'toastProgress 3000ms linear forwards';
        }
        setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }

    function doCopyOutput() {
        var text = getGeneratedPrompt();
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(text).then(function () {
                showToastIfAvailable();
            });
        } else {
            fallbackCopy(text);
            showToastIfAvailable();
        }
    }

    function openExternalTool(toolKey) {
        var rawUrl = AI_TOOL_URLS[toolKey];
        if (!rawUrl) return;

        var parsed;
        try {
            parsed = new URL(rawUrl);
        } catch (_) {
            return;
        }

        if (!AI_TOOL_ALLOWED_HOSTS[parsed.hostname]) return;
        window.open(parsed.toString(), '_blank', 'noopener,noreferrer');
    }

    function setupAiToolLaunchers() {
        document.querySelectorAll('[data-ai-tool]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tool = btn.getAttribute('data-ai-tool');
                openExternalTool(tool);
            });
        });
    }

    /* ===== THEME ===== */

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (_) { /* ignore */ }

        var icon = document.querySelector('#themeToggleBtn i');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons({ root: document.getElementById('themeToggleBtn') });
            }
        }
    }

    function setupThemeToggle() {
        var btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        var initial = 'light';
        try { initial = localStorage.getItem(THEME_KEY) || initial; } catch (_) { /* ignore */ }
        setTheme(initial);

        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    /* ===== EXPOSE FOR COPY.JS ===== */

    window._getGeneratorPromptText = getGeneratedPrompt;
    window._getMiniPromptText = getGeneratedPrompt;

    /* ===== INIT ===== */

    document.addEventListener('DOMContentLoaded', function () {
        // Restore depth
        try {
            var storedDepth = localStorage.getItem(DEPTH_KEY);
            if (storedDepth && DEPTH_LEVELS[storedDepth]) {
                activeDepth = storedDepth;
                document.querySelectorAll('.depth-btn').forEach(function (btn) {
                    var isTarget = btn.getAttribute('data-depth') === storedDepth;
                    btn.classList.toggle('is-active', isTarget);
                    btn.setAttribute('aria-checked', isTarget ? 'true' : 'false');
                });
            }
        } catch (_) { /* ignore */ }

        // Mode tabs
        document.querySelectorAll('.mode-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                switchMode(tab.getAttribute('data-mode'));
            });
        });
        setupModeTabsKeyboard();

        // Depth buttons
        document.querySelectorAll('.depth-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchDepth(btn.getAttribute('data-depth'));
            });
        });
        setupDepthKeyboard();

        // Form inputs
        document.querySelectorAll('.ops-form input, .ops-form select, .ops-form textarea').forEach(function (field) {
            field.addEventListener('input', handleFormInput);
            field.addEventListener('change', handleFormInput);
        });

        // Copy buttons
        var copyBtn = document.getElementById('outputCopyBtn');
        var copyCta = document.getElementById('outputCopyCta');
        var stickyCopy = document.getElementById('stickyCopyBtn');

        if (copyBtn) copyBtn.addEventListener('click', doCopyOutput);
        if (copyCta) copyCta.addEventListener('click', doCopyOutput);
        if (stickyCopy) stickyCopy.addEventListener('click', doCopyOutput);
        setupAiToolLaunchers();

        // Sessions
        var saveBtn = document.getElementById('sessionSaveBtn');
        var clearBtn = document.getElementById('sessionClearBtn');

        if (saveBtn) saveBtn.addEventListener('click', saveSession);
        if (clearBtn) clearBtn.addEventListener('click', clearSessions);

        // Render dynamic content
        renderLibrary();
        renderRules();
        renderSessions();

        // Theme
        setupThemeToggle();

        // Initial output
        updateOutput();
    });
})();
