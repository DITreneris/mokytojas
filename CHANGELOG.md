# Changelog

Formatas pagal [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), versijavimas – [Semantic Versioning](https://semver.org/).

## [Nereleisuota]

### Prideta
- **Mobile UX / vartotojo kelionė:** hero žingsnių scroll-spy (IntersectionObserver) – aktyvus žingsnis atspindi scroll poziciją (Režimas / Forma / Rezultatas / Biblioteka).
- Aiškūs anchor'iai: žingsnis „Rezultatas“ nukreiptas į `#opsOutputSection`, „Forma“ į `#opsForm`; scroll-margin taikomas output ir formos sekcijoms.
- Mobilėje: nuoroda „Žiūrėti sugeneruotą užklausą“ po forma (`.journey-next-wrap`) – orientacija į kitą žingsnį.
- DPK paaiškinimas: `title="DI Pamokų Kūrėjas"` ant top-nav brand (tooltip hover/focus).
- 320px/360px layout: `min-width: 0` ir `word-break` pataisos, kad išvengtum horizontalaus scroll siauroms ekranams.

### Pakeista
- Hero nuorodų click: visi keturi žingsniai scroll'ina į teisingą sekciją; accordion atidaromas tik „Biblioteka“ ir „Taisyklės“.
- Nuorodos į „Promptų anatomija“ nukreiptos į https://www.promptanatomy.app/ (hero badge ir community CTA).
- Footeryje pridėtas kontaktų el. paštas: info@promptanatomy.app (mailto nuoroda).
