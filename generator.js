(function () {
    'use strict';

    var APP_ID = 'di_ops_center';
    var MAX_SESSIONS = 5;
    var TEMPLATE_CHAR_LIMIT = 1100;
    var THEME_KEY = APP_ID + '_theme';
    var CLASS_LEVEL_KEY = APP_ID + '_class_level';
    var SESSIONS_KEY = APP_ID + '_sessions';
    var CLEAR_SESSIONS_UNDO_MS = 8000;
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
    var DEFAULT_SOT = {
        modes: {
            LESSON: {
                label: 'PAMOKA',
                desc: 'Pilnas pamokos planas',
                formId: 'form-lesson',
                fields: ['topic', 'duration', 'goal', 'context', 'question']
            },
            ASSESSMENT: {
                label: 'PATIKRINIMAS',
                desc: 'Žinių patikrinimo užklausa',
                formId: 'form-assessment',
                fields: ['topic', 'format', 'difficulty', 'question']
            },
            TASKS: {
                label: 'UŽDUOTYS',
                desc: 'Klasės ir namų darbai',
                formId: 'form-tasks',
                fields: ['topic', 'task_type', 'constraints', 'question']
            },
            PRESENTATION: {
                label: 'PREZENTACIJA',
                desc: 'Skaidrių struktūros užklausa',
                formId: 'form-presentation',
                fields: ['topic', 'slides', 'style', 'question']
            },
            STRATEGY: {
                label: 'STRATEGIJA',
                desc: 'Mokymo metodika ir planas',
                formId: 'form-strategy',
                fields: ['topic', 'goal', 'challenges', 'question']
            }
        },
        libraryPrompts: [
            {
                id: 'lesson_plan',
                title: 'Pilnas pamokos planas',
                desc: 'Nuo įvado iki refleksijos',
                icon: 'book-open',
                prompt: 'Rolė: esi patyręs mokytojo asistentas, remkis formoje pateiktais duomenimis.\nOUTPUT:\n- Pamokos eiga etapais: įvadas, pagrindinė dalis, refleksija.\n- 3 aiškios veiklos su trukme ir mokytojo instrukcija.\n- 5 diskusijos klausimai mokinių įsitraukimui.\n- Praktinė užduotis su vertinimo kriterijais.'
            },
            {
                id: 'assessment_quiz',
                title: 'Greitas patikrinimas',
                desc: 'Testas ir atviri klausimai',
                icon: 'clipboard-check',
                prompt: 'Rolė: esi vertinimo dizaino asistentas, remkis formoje pateiktais duomenimis.\nOUTPUT:\n- Multiple choice klausimai (4 variantai, 1 teisingas), kiekius pritaikyk pagal klasę ir sudėtingumą.\n- Atviri klausimai, orientuoti į supratimą ir taikymą.\n- Aiškus atsakymų raktas.\n- Trumpi vertinimo kriterijai atviriems klausimams.'
            },
            {
                id: 'homework_tasks',
                title: 'Diferencijuotos užduotys',
                desc: 'Silpnesniems, bazinis, stipresniems',
                icon: 'pencil-ruler',
                prompt: 'Rolė: esi diferencijuotų užduočių kūrimo asistentas, remkis formos duomenimis.\nOUTPUT:\n- Užduotis silpnesniems su aiškia pagalbos užuomina.\n- Bazinė užduotis visai klasei.\n- Išplėsta užduotis stipresniems.\n- Vertinimo kriterijai kiekvienam lygiui.'
            },
            {
                id: 'presentation_outline',
                title: 'Prezentacijos struktūra',
                desc: 'Skaidrių planas ir tekstas',
                icon: 'presentation',
                prompt: 'Rolė: esi edukacinių skaidrių struktūros asistentas, remkis formos duomenimis.\nOUTPUT:\n- Skaidrių planas numeruotu sąrašu.\n- Kiekvienai skaidrei: tikslas, 2-3 punktai, vizualinė idėja.\n- Nuoseklus perėjimas tarp skaidrių.\n- Pabaigoje vienas refleksijos klausimas mokiniams.'
            },
            {
                id: 'teaching_strategy',
                title: 'Mokymo strategija',
                desc: 'Metodika ir savaitės fokusas',
                icon: 'brain',
                prompt: 'Rolė: esi mokymo strategijos asistentas, remkis formoje nurodytu tikslu ir iššūkiais.\nOUTPUT:\n- 3 prioritetiniai metodiniai sprendimai.\n- Trumpa veiklų seka savaitei.\n- Rizikos ir prevenciniai veiksmai.\n- 2-3 pažangos matavimo rodikliai.'
            },
            {
                id: 'lesson_reflection',
                title: 'Pamokos refleksija',
                desc: 'Kas pavyko ir ką tobulinti',
                icon: 'refresh-ccw',
                prompt: 'Rolė: esi refleksijos ir kokybės gerinimo asistentas, remkis formos duomenimis.\nOUTPUT:\n- 3 dalykai, kuriuos verta kartoti.\n- 3 dalykai, kuriuos verta keisti.\n- 5 žingsnių korekcijos planas kitai pamokai.\n- Viena trumpa mokytojo savirefleksijos rekomendacija.'
            }
        ],
        rules: [
            { text: 'Užklausa turi vesti į aiškų, pritaikomą pamokos rezultatą', icon: 'check-circle' },
            { text: 'Aiškumas > sudėtingumas: vienas režimas, vienas tikslas', icon: 'check-circle' },
            { text: 'Kiekvienas veiksmas turi būti įgyvendinamas klasėje', icon: 'check-circle' },
            { text: 'Vertinimo kriterijai turi būti apibrėžiami iš anksto', icon: 'check-circle' },
            { text: 'Prezentacija MVP etape yra tik tekstinis užklausos rezultatas', icon: 'check-circle' }
        ],
        copy: {},
        theme: {
            light: {
                '--primary': '#0F2A44',
                '--primary-hover': '#0B2238',
                '--primary-light': '#2F6FED',
                '--accent-gold': '#F5C518',
                '--accent-gold-hover': '#E6B800',
                '--surface-0': '#F4F7FB',
                '--surface-1': '#FFFFFF',
                '--text': '#1C2B3A',
                '--text-light': '#6B7A8C',
                '--border': '#E6ECF2',
                '--output-bg': '#0F2A44'
            },
            dark: {
                '--primary': '#2F6FED',
                '--primary-hover': '#2458BD',
                '--primary-light': '#4E87F2',
                '--accent-gold': '#F5C518',
                '--accent-gold-hover': '#E6B800',
                '--surface-0': '#0B1422',
                '--surface-1': '#111D2D',
                '--text': '#E8EEF6',
                '--text-light': '#A4B2C3',
                '--border': '#273649',
                '--output-bg': '#0B1625'
            }
        }
    };

    var MODES = cloneJson(DEFAULT_SOT.modes);
    var LIBRARY_PROMPTS = cloneJson(DEFAULT_SOT.libraryPrompts);

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

    var RULES = cloneJson(DEFAULT_SOT.rules);
    var COPY_TEXT = {};
    var THEME_TOKENS = DEFAULT_SOT.theme;

    function cloneJson(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function assignSotConfig(sot) {
        if (!sot || typeof sot !== 'object') return;
        if (sot.modes && typeof sot.modes === 'object') MODES = sot.modes;
        if (Array.isArray(sot.libraryPrompts)) LIBRARY_PROMPTS = sot.libraryPrompts;
        if (Array.isArray(sot.rules)) RULES = sot.rules;
        if (sot.copy && typeof sot.copy === 'object') COPY_TEXT = sot.copy;
        if (sot.theme && typeof sot.theme === 'object') THEME_TOKENS = sot.theme;
        applyLibraryPromptLimit();
    }

    function loadSotConfig() {
        // Local file mode (file://) commonly blocks fetch in browsers.
        if (window.location && window.location.protocol === 'file:') {
            return Promise.resolve(cloneJson(DEFAULT_SOT));
        }

        return fetch('config/sot.json', { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed loading config/sot.json');
                }
                return response.json();
            })
            .then(function (remoteConfig) {
                var merged = cloneJson(DEFAULT_SOT);
                Object.assign(merged, remoteConfig || {});
                return merged;
            })
            .catch(function () {
                return cloneJson(DEFAULT_SOT);
            });
    }

    /* ===== STATE ===== */

    var activeMode = 'LESSON';
    var activeClassLevel = '7';
    var formData = {};
    var lastClearedSessions = null;
    var clearUndoTimer = null;

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

    function hasAnyFormInput() {
        return Object.keys(MODES).some(function (mode) {
            if (!formData[mode]) return false;
            return MODES[mode].fields.some(function (field) {
                return isFilled(formData[mode][field]);
            });
        });
    }

    function updateStickyCopyVisibility() {
        var stickyCopy = document.getElementById('stickyCopyBtn');
        if (!stickyCopy) return;
        var shouldShow = hasAnyFormInput();
        stickyCopy.classList.toggle('is-hidden', !shouldShow);
        stickyCopy.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        stickyCopy.disabled = !shouldShow;
    }

    /* ===== PROMPT GENERATION ===== */

    function buildLessonPrompt(data) {
        var parts = [];

        parts.push('Rolė: esi patyręs mokytojo asistentas, kuriantis aiškų pamokos planą.');
        parts.push('');

        parts.push('PAMOKOS KONTEKSTAS:');
        parts.push('- Klasė: ' + activeClassLevel + ' klasė');
        if (isFilled(data.topic)) parts.push('- Tema: ' + data.topic);
        if (isFilled(data.duration)) parts.push('- Trukmė: ' + data.duration);
        if (isFilled(data.goal)) parts.push('- Tikslas: ' + data.goal);
        parts.push('');

        if (isFilled(data.context)) {
            parts.push('PAPILDOMAS KONTEKSTAS: ' + data.context);
            parts.push('');
        }

        parts.push('UŽDUOTIS:');
        if (isFilled(data.question)) {
            parts.push(data.question);
        } else {
            parts.push('Paruošk pilną pamokos planą su įvadu, veiklomis, diskusijos klausimais, praktine užduotimi ir refleksija.');
        }

        return parts.join('\n');
    }

    function buildAssessmentPrompt(data) {
        var parts = [];

        parts.push('Rolė: esi vertinimo dizaino asistentas mokytojui.');
        parts.push('');
        parts.push('PATIKRINIMO KONTEKSTAS:');
        parts.push('- Klasė: ' + activeClassLevel + ' klasė');
        if (isFilled(data.topic)) parts.push('- Tema: ' + data.topic);
        if (isFilled(data.format)) parts.push('- Formatas: ' + data.format);
        if (isFilled(data.difficulty)) parts.push('- Sudėtingumas: ' + data.difficulty);
        parts.push('');
        parts.push('UŽDUOTIS:');
        if (isFilled(data.question)) {
            parts.push(data.question);
        } else {
            parts.push('Sukurk testą su multiple choice ir atvirais klausimais, pridėk atsakymų raktą.');
        }
        return parts.join('\n');
    }

    function buildTasksPrompt(data) {
        var parts = [];

        parts.push('Rolė: esi mokymosi užduočių kūrimo asistentas.');
        parts.push('');
        parts.push('UŽDUOČIŲ KONTEKSTAS:');
        parts.push('- Klasė: ' + activeClassLevel + ' klasė');
        if (isFilled(data.topic)) parts.push('- Tema: ' + data.topic);
        if (isFilled(data.task_type)) parts.push('- Užduočių tipas: ' + data.task_type);
        if (isFilled(data.constraints)) parts.push('- Apribojimai: ' + data.constraints);
        parts.push('');
        parts.push('UŽDUOTIS:');
        if (isFilled(data.question)) {
            parts.push(data.question);
        } else {
            parts.push('Sukurk klasės, namų ir projektines užduotis su vertinimo kriterijais.');
        }
        return parts.join('\n');
    }

    function buildPresentationPrompt(data) {
        var parts = [];

        parts.push('Rolė: esi edukacinių prezentacijų struktūros asistentas.');
        parts.push('');
        parts.push('PREZENTACIJOS KONTEKSTAS:');
        parts.push('- Klasė: ' + activeClassLevel + ' klasė');
        if (isFilled(data.topic)) parts.push('- Tema: ' + data.topic);
        if (isFilled(data.slides)) parts.push('- Skaidrių kiekis: ' + data.slides);
        if (isFilled(data.style)) parts.push('- Stilius: ' + data.style);
        parts.push('');
        parts.push('UŽDUOTIS:');
        if (isFilled(data.question)) {
            parts.push(data.question);
        } else {
            parts.push('Paruošk skaidrių planą, skaidrių tekstą ir vizualines idėjas. Integracijų su įrankiais nesiūlyk.');
        }
        return parts.join('\n');
    }

    function buildStrategyPrompt(data) {
        var parts = [];

        parts.push('Rolė: esi mokymo strategijos asistentas mokytojui.');
        parts.push('');
        parts.push('STRATEGIJOS KONTEKSTAS:');
        parts.push('- Klasė: ' + activeClassLevel + ' klasė');
        if (isFilled(data.topic)) parts.push('- Tema: ' + data.topic);
        if (isFilled(data.goal)) parts.push('- Tikslas: ' + data.goal);
        if (isFilled(data.challenges)) parts.push('- Iššūkiai: ' + data.challenges);
        parts.push('');
        parts.push('UŽDUOTIS:');
        if (isFilled(data.question)) {
            parts.push(data.question);
        } else {
            parts.push('Pasiūlyk metodiką, veiklų modelį, diskusijų metodus ir aktyvaus mokymosi idėjas.');
        }
        return parts.join('\n');
    }

    function getGeneratedPrompt() {
        var data = formData[activeMode] || {};
        if (activeMode === 'LESSON') return buildLessonPrompt(data);
        if (activeMode === 'ASSESSMENT') return buildAssessmentPrompt(data);
        if (activeMode === 'TASKS') return buildTasksPrompt(data);
        if (activeMode === 'PRESENTATION') return buildPresentationPrompt(data);
        return buildStrategyPrompt(data);
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

        var classBadge = document.getElementById('classBadge');
        if (classBadge) classBadge.textContent = activeClassLevel + ' klasė';

        updateStickyCopyVisibility();
    }

    function setText(id, text) {
        if (!text) return;
        var element = document.getElementById(id);
        if (!element) return;
        element.textContent = text;
    }

    function applyCopyFromSot() {
        setText('heroTitle', COPY_TEXT.heroTitle);
        setText('heroSubtitle', COPY_TEXT.heroSubtitle);
        setText('heroCtaPrimary', COPY_TEXT.heroCtaPrimary);
        setText('heroCtaSecondary', COPY_TEXT.heroCtaSecondary);
        setText('heroCtaMeta', COPY_TEXT.heroCtaMeta);
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

    /* ===== CLASS LEVEL ===== */

    function setClassLevel(level) {
        var normalized = String(level || '').trim();
        if (!/^(?:[1-9]|1[0-2])$/.test(normalized)) return;
        activeClassLevel = normalized;
        try { localStorage.setItem(CLASS_LEVEL_KEY, activeClassLevel); } catch (_) { /* ignore */ }
        updateOutput();
    }

    function setupClassLevelSelector() {
        var select = document.getElementById('classLevelSelect');
        if (!select) return;
        select.value = activeClassLevel;
        select.addEventListener('change', function () {
            setClassLevel(select.value);
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
            classLevel: activeClassLevel,
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

        if (session.classLevel) {
            setClassLevel(session.classLevel);
            var classSelect = document.getElementById('classLevelSelect');
            if (classSelect) classSelect.value = activeClassLevel;
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
        var clearBtn = document.getElementById('sessionClearBtn');
        if (lastClearedSessions) {
            saveSessions(lastClearedSessions);
            lastClearedSessions = null;
            if (clearUndoTimer) {
                clearTimeout(clearUndoTimer);
                clearUndoTimer = null;
            }
            if (clearBtn) clearBtn.innerHTML = '<i data-lucide="trash-2" class="icon icon--sm"></i> Ištrinti sesijas';
            if (window.lucide && typeof window.lucide.createIcons === 'function' && clearBtn) {
                window.lucide.createIcons({ root: clearBtn });
            }
            renderSessions();
            showToastIfAvailable('Sesijos atkurtos.', 'success');
            return;
        }

        var sessions = getSessions();
        if (!sessions.length) {
            showToastIfAvailable('Sesijų sąrašas jau tuščias.', 'error');
            return;
        }

        if (!window.confirm('Ar tikrai nori ištrinti visas išsaugotas sesijas?')) {
            return;
        }

        lastClearedSessions = sessions;
        try { localStorage.removeItem(SESSIONS_KEY); } catch (_) { /* ignore */ }
        renderSessions();
        if (clearBtn) clearBtn.innerHTML = '<i data-lucide="rotate-ccw" class="icon icon--sm"></i> Atkurti sesijas';
        if (window.lucide && typeof window.lucide.createIcons === 'function' && clearBtn) {
            window.lucide.createIcons({ root: clearBtn });
        }
        showToastIfAvailable('Sesijos ištrintos. Spausk „Atkurti sesijas“ per 8 s.', 'error');

        clearUndoTimer = setTimeout(function () {
            lastClearedSessions = null;
            clearUndoTimer = null;
            if (clearBtn) clearBtn.innerHTML = '<i data-lucide="trash-2" class="icon icon--sm"></i> Ištrinti sesijas';
            if (window.lucide && typeof window.lucide.createIcons === 'function' && clearBtn) {
                window.lucide.createIcons({ root: clearBtn });
            }
        }, CLEAR_SESSIONS_UNDO_MS);
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
                '</div>' +
                '<p class="library-card-hint">Įrašo į lauką „Pagrindinis klausimas DI“ – redaguokite formoje.</p>';

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
            questionField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            questionField.focus();
            showToastIfAvailable('Šablonas įrašytas į klausimo lauką. Redaguokite formoje pagal poreikius.');
        }
    }

    function copyLibraryPrompt(id) {
        var item = LIBRARY_PROMPTS.find(function (p) { return p.id === id; });
        if (!item) return;
        copyTextWithFallback(item.prompt, 'Šablonas nukopijuotas.');
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
        if (!ta) return false;
        ta.style.position = 'fixed';
        ta.style.left = '0';
        ta.style.top = '0';
        ta.style.opacity = '0';
        ta.value = text;
        ta.focus();
        ta.select();
        var copied = false;
        try { copied = !!document.execCommand('copy'); } catch (_) { /* ignore */ }
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        ta.style.opacity = '0';
        return copied;
    }

    function tryNativeShare(text) {
        if (!navigator.share || typeof navigator.share !== 'function') {
            return Promise.resolve(false);
        }
        return navigator.share({
            title: 'DI užklausa',
            text: text
        }).then(function () {
            return true;
        }).catch(function () {
            return false;
        });
    }

    function copyTextWithFallback(text, successMessage) {
        var okMessage = successMessage || 'Užklausa nukopijuota.';
        var errorMessage = 'Nepavyko nukopijuoti. Pažymėk tekstą ir pasirink „Kopijuoti“.';
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(text).then(function () {
                showToastIfAvailable(okMessage, 'success');
            }).catch(function () {
                if (fallbackCopy(text)) {
                    showToastIfAvailable(okMessage, 'success');
                    return;
                }
                tryNativeShare(text).then(function (shared) {
                    if (shared) {
                        showToastIfAvailable('Atidarytas bendrinimo langas.', 'success');
                        return;
                    }
                    showToastIfAvailable(errorMessage, 'error');
                });
            });
            return;
        }

        if (fallbackCopy(text)) {
            showToastIfAvailable(okMessage, 'success');
            return;
        }
        tryNativeShare(text).then(function (shared) {
            if (shared) {
                showToastIfAvailable('Atidarytas bendrinimo langas.', 'success');
                return;
            }
            showToastIfAvailable(errorMessage, 'error');
        });
    }

    function showToastIfAvailable(message, status) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        var msgEl = document.getElementById('toastMessage');
        if (msgEl) msgEl.textContent = message !== undefined ? message : 'Užklausa nukopijuota.';
        var tone = status === 'error' ? 'error' : 'success';
        toast.classList.remove('is-success', 'is-error');
        toast.classList.add(tone === 'error' ? 'is-error' : 'is-success');
        toast.setAttribute('aria-label', tone === 'error' ? 'Klaidos pranešimas' : 'Sėkmės pranešimas');
        var icon = toast.querySelector('.toast-icon .icon');
        if (icon) {
            icon.setAttribute('data-lucide', tone === 'error' ? 'alert-circle' : 'check');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons({ root: toast });
            }
        }
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
        copyTextWithFallback(text, 'Užklausa nukopijuota.');
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
        var palette = THEME_TOKENS && THEME_TOKENS[theme];
        if (palette && typeof palette === 'object') {
            Object.keys(palette).forEach(function (key) {
                document.documentElement.style.setProperty(key, String(palette[key]));
            });
        }

        var icon = document.querySelector('#themeToggleBtn i');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons({ root: document.getElementById('themeToggleBtn') });
            }
        }
        updateThemeToggleA11y(theme);
    }

    function updateThemeToggleA11y(theme) {
        var btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        var isDark = theme === 'dark';
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        btn.setAttribute('aria-label', isDark ? 'Perjungti į šviesų režimą' : 'Perjungti į tamsų režimą');
        btn.setAttribute('title', 'Keisti spalvų režimą');
    }

    function setupThemeToggle() {
        var btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        var initial = 'light';
        var storedTheme = null;
        try { storedTheme = localStorage.getItem(THEME_KEY); } catch (_) { /* ignore */ }
        if (storedTheme === 'light' || storedTheme === 'dark') {
            initial = storedTheme;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            initial = 'dark';
        }
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
    function initializeApp() {
        // Restore class level
        try {
            var storedClassLevel = localStorage.getItem(CLASS_LEVEL_KEY);
            if (storedClassLevel) setClassLevel(storedClassLevel);
        } catch (_) { /* ignore */ }

        // Mode tabs
        document.querySelectorAll('.mode-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                switchMode(tab.getAttribute('data-mode'));
            });
        });
        setupModeTabsKeyboard();

        // Class selector
        setupClassLevelSelector();

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
        applyCopyFromSot();

        // Initial output
        updateOutput();
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadSotConfig().then(function (config) {
            assignSotConfig(config);
            initFormData();
            initializeApp();
        });
    });
})();
