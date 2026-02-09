
# Personal Budget Tracker

Yksinkertainen ja moderni verkkosovellus tulojen, menojen, budjettien ja taloudellisten tavoitteiden seurantaan.  
Rakennettu **Next.js:llä (App Router)**, **Bunilla** ja **MongoDB:llä**. (Alunperin testattu Angular CLI:n avulla. En lisännyt ohjeita sille sillä minun palvelin ei lähetenyt Angular:in avulla toimimaan kun käytän Dockerfile.)

---

## Vaatimukset

- Node.js (LTS)
- Bun (pakettienhallintaan ja skripteihin)
- MongoDB-instanssi (Atlas tai oma palvelin)

Luo projektin juureen `.env`-tiedosto, johon lisäät MongoDB-yhteysmerkkijonon (esimerkki alla).  
**Pidä `.env` poissa versionhallinnasta** ja lisää se `.gitignore`-tiedostoon.

---

## Ympäristö (`.env` esimerkki)

```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/your-db-name?retryWrites=true&w=majority"
NEXT_PUBLIC_APP_NAME="Personal Finance Tracker"
PORT=3000
```

---

## 🚀 Pikakäynnistys

```bash
# Asenna riippuvuudet
bun install

# Käynnistä kehityspalvelin
bun run dev

# Rakenna tuotantoon
bun run build

# Käynnistä tuotantopalvelin
bun start
```

---

## 📁 Projektirakenne

```text
src/
├── app/                 # Next.js App Router -sivut
├── components/          # Uudelleenkäytettävät React-komponentit
│   └── ui/              # shadcn/ui-komponentit
├── hooks/               # Mukautetut React-hookit
└── lib/                 # Apu- ja konfiguraatiotoiminnot
```

---

## Ominaisuudet

- Tapahtumien seuranta (tulot / menot)
- Kategoriat ja tagit
- Toistuvat tapahtumat
- Budjetit ja tavoitteiden seuranta
- Perusanalytiikka (kuukausiyhteenveto, kategoriakohtainen jakauma)
- Käyttäjätunnistus (JWT / sessio, toteutuksesta riippuen)

---

## Teknologiat

- **Frontend:** Next.js (App Router), React, shadcn/ui
- **Backend:** Next.js API -reitit / server componentit, Node-ajoympäristö Bunin kautta
- **Tietokanta:** MongoDB
- **Työkalut:** Bun (asennus, build, ajot)

---

## Ympäristömuuttujat

| Avain | Kuvaus |
|------|-------|
| `MONGODB_URI` | MongoDB-yhteysmerkkijono |

---

## Kehityshuomiot

- Node.js ja Bun tulee olla asennettuna paikallisesti.
- Palvelin yhdistää MongoDB:hen käyttäen `.env`-tiedoston `MONGODB_URI`-arvoa.
- UI-komponentit sijaitsevat hakemistossa `src/components/ui`.

---


## Vianmääritys

- **MongoDB `ECONNREFUSED`:** tarkista `MONGODB_URI` ja IP-whitelist (Atlas).
- **Bun ei toimi:** varmista, että Bun löytyy `PATH`:sta.
- **Ympäristömuuttujat eivät lataudu:** varmista `.env`-tiedoston sijainti.

---
