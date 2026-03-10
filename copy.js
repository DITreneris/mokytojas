(function () {
    'use strict';

    var CONFIG = {
        ACCORDION_KEY: 'di_ops_center_active_section_v1'
    };

    function getStoredAccordionId() {
        try {
            return localStorage.getItem(CONFIG.ACCORDION_KEY) || '';
        } catch (_) {
            return '';
        }
    }

    function setStoredAccordionId(value) {
        try {
            if (value) {
                localStorage.setItem(CONFIG.ACCORDION_KEY, value);
            } else {
                localStorage.removeItem(CONFIG.ACCORDION_KEY);
            }
        } catch (_) { /* ignore */ }
    }

    function setAccordionItem(item, isOpen) {
        if (!item || !item.toggle || !item.body) return;
        item.toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        item.body.hidden = !isOpen;
        if (item.chevron) {
            item.chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
        }
    }

    function setupAccordion() {
        var items = [
            {
                id: 'library',
                toggle: document.getElementById('libraryToggle'),
                body: document.getElementById('libraryBody'),
                chevron: document.querySelector('#libraryToggle .collapsible-chevron')
            },
            {
                id: 'rules',
                toggle: document.getElementById('rulesToggle'),
                body: document.getElementById('rulesBody'),
                chevron: document.querySelector('#rulesToggle .collapsible-chevron')
            }
        ].filter(function (item) { return item.toggle && item.body; });

        function openOnly(targetId) {
            var foundOpen = false;
            items.forEach(function (item) {
                var shouldOpen = item.id === targetId;
                setAccordionItem(item, shouldOpen);
                if (shouldOpen) foundOpen = true;
            });
            setStoredAccordionId(foundOpen ? targetId : '');
        }

        function toggleItem(targetId) {
            var current = items.find(function (i) { return i.id === targetId; });
            if (!current) return;
            var isOpen = current.toggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                setAccordionItem(current, false);
                setStoredAccordionId('');
                return;
            }
            openOnly(targetId);
        }

        items.forEach(function (item) {
            item.toggle.addEventListener('click', function () {
                toggleItem(item.id);
            });
        });

        window.openAccordionSection = function (sectionId) {
            if (!sectionId) return;
            openOnly(sectionId);
        };

        var scrollSpySectionIds = ['operationsCenter', 'opsForm', 'opsOutputSection', 'library'];
        var scrollSpySections = scrollSpySectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
        var activeSectionId = scrollSpySectionIds[0];

        function setActiveStepBySectionId(sectionId) {
            if (!sectionId) return;
            activeSectionId = sectionId;
            var steps = document.querySelectorAll('.header-steps .header-step');
            steps.forEach(function (link) {
                var href = link.getAttribute('href') || '';
                var isMatch = href === '#' + sectionId;
                link.classList.toggle('is-active', isMatch);
            });
        }

        if (scrollSpySections.length > 0 && typeof IntersectionObserver !== 'undefined') {
            var observer = new IntersectionObserver(function (entries) {
                var intersecting = {};
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.id;
                        if (scrollSpySectionIds.indexOf(id) !== -1) {
                            intersecting[id] = entry.intersectionRatio;
                        }
                    }
                });
                for (var i = 0; i < scrollSpySectionIds.length; i++) {
                    if (intersecting[scrollSpySectionIds[i]]) {
                        setActiveStepBySectionId(scrollSpySectionIds[i]);
                        return;
                    }
                }
            }, { root: null, rootMargin: '-80px 0px -40% 0px', threshold: [0, 0.1, 0.2] });
            scrollSpySections.forEach(function (el) { observer.observe(el); });
        }

        var heroLinks = document.querySelectorAll('.header-step[href]');
        heroLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                var hash = link.getAttribute('href');
                if (!hash || hash === '#') return;
                var sectionId = hash.replace('#', '');
                var target = document.getElementById(sectionId);
                if (!target) return;
                e.preventDefault();
                if (sectionId === 'library' || sectionId === 'rules') {
                    openOnly(sectionId);
                }
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveStepBySectionId(sectionId);
            });
        });

        var stored = getStoredAccordionId();
        if (stored) {
            openOnly(stored);
        }
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            var toast = document.getElementById('toast');
            if (toast) { toast.classList.remove('show'); }
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        setupAccordion();
    });
})();
