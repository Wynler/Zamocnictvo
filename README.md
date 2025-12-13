# Zámočnícka správa - Aplikácia

Kompletná aplikácia na správu zámočníckych zákaziek s databázou.

## 🚀 Rýchle nasadenie (15-30 minút)

### KROK 1: Nastavenie Supabase databázy

1. **Vytvor účet na Supabase** (zadarmo)
   - Choď na https://supabase.com
   - Klikni "Start your project"
   - Zaregistruj sa (môžeš použiť GitHub)

2. **Vytvor nový projekt**
   - Klikni "New Project"
   - Zadaj názov: `zamocnicka-sprava`
   - Vytvor heslo pre databázu (ulož si ho!)
   - Vyber región: `Central EU (Frankfurt)` (najbližšie k SR)
   - Klikni "Create new project" (chvíľu to trvá)

3. **Vytvor tabuľky v databáze**
   - V ľavom menu klikni na "SQL Editor"
   - Klikni "New query"
   - Skopíruj a vlož tento SQL kód:

```sql
-- Vytvorenie tabuľky pre zákazky
CREATE TABLE zakazky (
  id BIGSERIAL PRIMARY KEY,
  nazov TEXT NOT NULL,
  zakaznik TEXT NOT NULL,
  kontaktna_osoba TEXT,
  telefon TEXT,
  email TEXT,
  nazov_firmy TEXT,
  ico TEXT,
  dic TEXT,
  adresa TEXT,
  stav TEXT DEFAULT 'priprava',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvorenie tabuľky pre etapy
CREATE TABLE etapy (
  id BIGSERIAL PRIMARY KEY,
  zakazka_id BIGINT REFERENCES zakazky(id) ON DELETE CASCADE,
  nazov TEXT NOT NULL,
  kontaktna_osoba TEXT,
  telefon TEXT,
  email TEXT,
  hmotnost_podla_vykazu NUMERIC,
  datum_ukoncenia DATE,
  datum_vyroby_od DATE,
  datum_vyroby_do DATE,
  datum_povrchovej_upravy_od DATE,
  datum_povrchovej_upravy_do DATE,
  datum_montaze_od DATE,
  datum_montaze_do DATE,
  zinkovanie TEXT DEFAULT 'nic',
  farba TEXT DEFAULT 'nic',
  farba_ton TEXT,
  popis TEXT,
  stav TEXT DEFAULT 'planovane',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vytvorenie tabuľky pre dielce
CREATE TABLE dielce (
  id BIGSERIAL PRIMARY KEY,
  etapa_id BIGINT REFERENCES etapy(id) ON DELETE CASCADE,
  nazov TEXT NOT NULL,
  hmotnost_jedneho_ks NUMERIC,
  mnozstvo NUMERIC NOT NULL,
  jednotka TEXT DEFAULT 'ks',
  poznamka TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Povoliť Row Level Security
ALTER TABLE zakazky ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapy ENABLE ROW LEVEL SECURITY;
ALTER TABLE dielce ENABLE ROW LEVEL SECURITY;

-- Vytvorenie politík (zatiaľ povoliť všetko - neskôr môžeš pridať autentifikáciu)
CREATE POLICY "Povoliť všetko pre zákazky" ON zakazky FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Povoliť všetko pre etapy" ON etapy FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Povoliť všetko pre dielce" ON dielce FOR ALL USING (true) WITH CHECK (true);
```

   - Klikni "RUN" (alebo F5)
   - Malo by to ukázať "Success. No rows returned"

4. **Skopíruj API údaje**
   - V ľavom menu klikni na ikonu ⚙️ "Project Settings"
   - Klikni na "API"
   - Skopíruj si:
     - `Project URL` (bude niečo ako `https://xxxxx.supabase.co`)
     - `anon public` key (dlhý reťazec)

### KROK 2: Nasadenie na Vercel

1. **Vytvor GitHub repository**
   - Choď na https://github.com
   - Klikni "New repository"
   - Názov: `zamocnicka-app`
   - Public alebo Private (jedno)
   - Klikni "Create repository"

2. **Nahraj kód na GitHub**
   - Otvor terminál v priečinku projektu
   - Spusti tieto príkazy:

```bash
cd zamocnicka-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TVOJ-USERNAME/zamocnicka-app.git
git push -u origin main
```

3. **Deploy na Vercel**
   - Choď na https://vercel.com
   - Klikni "Sign Up" a prihlás sa cez GitHub
   - Klikni "Add New Project"
   - Import svoj `zamocnicka-app` repository
   - V sekcii "Environment Variables" pridaj:
     - `NEXT_PUBLIC_SUPABASE_URL` = tvoja URL zo Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tvoj anon key zo Supabase
   - Klikni "Deploy"
   - Počkaj 2-3 minúty

4. **HOTOVO! 🎉**
   - Vercel ti dá URL typu `https://zamocnicka-app.vercel.app`
   - Aplikácia je nažive a funguje!

## 📱 Lokálne spustenie (pre vývoj)

```bash
# Nainštaluj závislosti
npm install

# Vytvor .env.local súbor a vlož svoje údaje
cp .env.example .env.local
# Uprav .env.local a vlož svoje Supabase údaje

# Spusti vývojový server
npm run dev

# Otvor http://localhost:3000
```

## 🔧 Ďalšie možnosti

### Pridanie autentifikácie
V Supabase môžeš jednoducho zapnúť:
- Email/Password login
- Google login
- GitHub login

### Vlastná doména
V Vercel Settings môžeš pridať vlastnú doménu (napr. `zakazky.tvojafirma.sk`)

### Automatické updaty
Každý push do GitHub = automatický deploy na Vercel

## 🆘 Potrebuješ pomoc?

- Supabase dokumentácia: https://supabase.com/docs
- Vercel dokumentácia: https://vercel.com/docs
- Next.js dokumentácia: https://nextjs.org/docs

## 💰 Cena

- Supabase Free tier: 500MB databáza, 2GB storage (viac ako dosť!)
- Vercel Free tier: Unlimited deployments, 100GB bandwidth
- **CELKOM: 0 EUR mesačne** 🎉
