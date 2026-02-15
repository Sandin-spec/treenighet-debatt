# Bibelversdatabas (GitHub Pages)

Den här sajten är byggd för att du ska kunna lägga till och ändra svar i efterhand utan att behöva göra om allt.

## Struktur

- `index.html` - start
- `assets/` - CSS och JavaScript
  - `assets/app.js` - logik (laddar index + en vers i taget)
- `data/`
  - `data/index.json` - lista över alla verser (snabb att ladda, används för sök/lista)
  - `data/verses/` - en fil per vers, t.ex. `data/verses/v001.json`

## Så redigerar du ett enskilt svar

1. Öppna filen för versen du vill ändra:
   - `data/verses/<id>.json`
2. Ändra t.ex.:
   - `short` (kort sammanfattning)
   - `answers[].text` (själva svaret)
   - `expanded.logic / expanded.context / expanded.keywords` (fördjupning)
3. Spara och commit/pusha.

Du behöver inte röra övriga filer.

## Så lägger du till en ny vers

1. Skapa en ny fil i `data/verses/` med ett nytt `id`.
2. Lägg till en rad i `data/index.json` med samma `id` och grundinfo (`ref`, `short`, `tags`, `relatedIds`).
3. Commit/pusha.

Tips: håll `id` unikt och konsekvent.

## GitHub Pages

- Lägg hela projektet i ett repo.
- I repo-inställningar: **Pages** -> välj branch (`main`) och root (`/`).

