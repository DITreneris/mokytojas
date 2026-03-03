# DI Operacinis Centras

Trumpas įrankis CEO/COO darbui: iš įvestų verslo duomenų suformuoja aiškią DI užklausą, kurią gali iškart kopijuoti ir analizuoti.

## Greitas startas

- Atidaryk `index.html` naršyklėje.
- Arba paleisk lokalų serverį:

```bash
npx serve -s . -l 3000
```

## Kasdienis workflow

1. Pasirink režimą ir analizės gylį.
2. Užpildyk pagrindinius laukus.
3. Nukopijuok sugeneruotą promptą.
4. Įklijuok į pasirinktą DI įrankį.

## Kokybės vartai

```bash
npm test
```

## Golden Standard (UI)

Šis standartas taikomas kaip bazė kiekvienam UI pakeitimui.

- Brand identitetas: violetinė paliekama tiek `light`, tiek `dark` režime.
- White mode: švarus premium vaizdas su šiltu pilku fonu ir aiškiai atskirtomis baltomis kortelėmis.
- Kontrastas: input, placeholder ir pagalbiniai tekstai turi būti lengvai skaitomi be įtampos.
- Hierarchija: aiškūs skirtumai tarp `background`, `card`, `input` (tonų skirtumas 2-5%).
- CTA dominavimas: vienas pagrindinis CTA vizualiai stipriausias (svoris, mikro animacija, subtilus glow).
- Depth sistema: naudojami 2-3 nuoseklūs elevation lygiai, be atsitiktinių shadow reikšmių.
- Sessions blokas: aiškus header, tvarkingas empty state su pozityvia žinute.
- A11y: privalomas aiškus `:focus-visible`, klaviatūros navigacija ir pakankamas kontrastas.

## Dokumentacija

Visas aktyvus docs įėjimas yra `docs/INDEX.md`.
