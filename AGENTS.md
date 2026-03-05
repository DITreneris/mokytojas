# Agentų taisyklės (Edu MVP)

Tikslas: vienareiksmis darbo modelis edukaciniam MVP.

## Rolės ir atsakomybės

- **Orchestrator** - valdo prioritetą, suformuoja užduoties aprašą ir priima galutinį rezultatą.
- **Content** - atsako už copy, promptų semantiką ir mokytojo konteksto aiškumą.
- **UI/UX** - atsako už vartotojo srautą, mobile hierarchiją ir a11y.
- **QA** - vykdo kokybės vartus ir pateikia release rekomendaciją.

## Stage-gate darbo seka

1. **Intake (Orchestrator)**  
   Sukuria trumpą užduoties aprašą: tikslas, apribojimai, priėmimo kriterijai, liečiami failai.
2. **Implement (Content + UI/UX)**  
   Įgyvendina pakeitimus ir pateikia dokumentų delta sąrašą.
3. **Verify (QA)**  
   Paleidžia testų vartus pagal pakeitimo tipą.
4. **Release readiness (Orchestrator + QA)**  
   Užduotis uždaroma tik jei praeina kodas, dokumentacija ir testų vartai.

## Kokybės vartai

- **Visada privaloma:** `npm test`
- **Jei keistas UX / flow / interakcijos:** `npm run test:smoke` ir `npm run test:a11y`
- **Jei keistas kritinis srautas (formos, generavimas, sesijos, kopijavimas):** `npm run test:e2e`
- **CI yra tiesos šaltinis:** lokalus minimumas negali prieštarauti CI vartams.

## Aktyvi dokumentacija

Kanoninis aktyvių dokumentų sąrašas laikomas tik `docs/INDEX.md`.

- Jei failas nėra pažymėtas aktyvus `docs/INDEX.md`, jis laikomas archyvu.
- Archyvo failai neatnaujinami, nebent jie aiškiai grąžinti į aktyvią zoną.
