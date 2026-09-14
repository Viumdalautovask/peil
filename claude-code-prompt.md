# Oppstartsprompt til Claude Code

Legg `peil-laering.html` i en tom mappe, åpne mappa i Claude Code, og lim inn prompten under.

---

## Prompt

```
Jeg har en fungerende prototype av en norsk leksehjelpsapp i peil-laering.html.
Den er én selvstendig HTML-fil med all logikk og alt innhold. Les den først, og
lag deg et bilde av strukturen før du gjør noe.

Kort om produktet: Peil er leksehjelp for elever på 8.-10. trinn. Den gir aldri
svaret direkte, men stiller spørsmål tilbake og gir ett hint om gangen.
Innholdet er forankret i kompetansemål fra Utdanningsdirektoratet.

Oppgaven din er å bygge dette om til en ekte produksjonsapp. Ikke gjør alt på
én gang — følg rekkefølgen under og vis meg resultatet etter hvert steg.

TEKNOLOGI
- Next.js 15 med App Router og TypeScript
- Supabase (Postgres + Auth), region i EU
- Tailwind CSS
- Claude API (Haiku) for den sokratiske veiledningen
- Vipps Recurring for abonnement
- PWA slik at appen kan installeres på hjemskjermen

STEG 1 — Kartlegging
Les HTML-fila og skriv en kort oversikt til meg over:
- objektene LAEREPLAN, FAG, EMNE og EMNER, og hvordan de henger sammen
- skjermene og navigasjonen mellom dem
- spillet, hjelpestigen, testlogikken og kontoflyten
Ikke skriv kode ennå.

STEG 2 — Prosjekt og database
- Sett opp Next.js-prosjektet med Tailwind og TypeScript
- Lag SQL-migrasjon i supabase/migrations/001_init.sql for:
  laereplan, kompetansemaal, emne, laeredel, oving, ovingssteg,
  feilsvar, testsporsmal, elev, fremdrift, bok, kvote
- Row Level Security på ALLE elevtabeller. Dette er data om mindreårige.
- Skriv et seed-script som flytter innholdet fra EMNE og EMNER i HTML-fila
  inn i databasen. Ikke skriv innholdet på nytt for hånd.

STEG 3 — Grensesnitt
Port skjermene til React-komponenter. Behold designet nøyaktig: palett,
typografi, maskotens animasjoner og oppførsel. Fargene er
petrol #2F4A52, sand #F7F3EA, gull #C9963F, salvie #7E8E80.
Skrifttyper er Outfit til overskrifter og Public Sans til brødtekst.
All brukervendt tekst skal være på norsk bokmål.

STEG 4 — AI-veiledningen
Erstatt den hardkodede fasitsjekken med et kall til Claude via /api/chat:
- ANTHROPIC_API_KEY kun server-side
- prompt caching på den faste delen av systemprompten
- max_tokens 300
- send bare siste 8 meldinger
- daglig meldingsgrense per elev, lagret i kvote-tabellen
Systemprompten skal tvinge modellen til aldri å gi svaret direkte, stille ett
spørsmål om gangen, og svare i maks 3-4 setninger. Språknivået skal tilpasses
elevens trinn.

STEG 5 — Konto og betaling
- Innlogging med magic link via Supabase Auth
- Vipps Recurring med 14 dagers gratisperiode, deretter 199 kr/mnd
- Abonnementsstatus styres KUN av webhooks fra Vipps, aldri av klienten
- Appen skal aldri se kortnummer

STEG 6 — PWA
manifest.json, service worker, ikoner i 192 og 512 px basert på
stjernesymbolet i logoen. Installerbar på hjemskjerm.

STEG 7 — Synkronisering mot Udir
Nattlig cron-jobb som henter gjeldende læreplaner fra data.udir.no.
Ny versjon lagres som inaktiv ved siden av den gamle og flagges for
gjennomgang. Den slås aldri på automatisk.

KRAV SOM GJELDER HELE VEIEN
- Personvern først: bare fornavn lagres, data i EU, alt skal kunne slettes
- Ingen hemmeligheter i klientkode
- Norsk bokmål i all brukervendt tekst
- Behold pedagogikken: appen gir aldri svaret

Start med steg 1.
```

---

## Det du må ordne selv

- Supabase-prosjekt (velg region Frankfurt)
- API-nøkkel fra Anthropic
- Vipps-avtale for Recurring — krever organisasjonsnummer
- Domene
- Personvernerklæring og databehandleravtale før første betalende kunde
