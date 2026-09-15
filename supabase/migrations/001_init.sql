-- Peil — første migrasjon
-- Innholdstabeller (laereplan, kompetansemaal, emne, laeredel, oving,
-- ovingssteg, feilsvar, testsporsmal) eies av redaksjonen/synk-jobben.
-- Elevdata (elev, fremdrift, bok, kvote) er data om mindreårige og har
-- Row Level Security på alle operasjoner.

create extension if not exists "pgcrypto";

-- ============================================================
-- INNHOLD
-- ============================================================

create table laereplan (
  id             uuid primary key default gen_random_uuid(),
  fag            text not null,                 -- 'mat' | 'nat' | 'nor' | 'eng' | 'spr' | 'sam' | 'krle'
  kode           text not null,                  -- f.eks. 'MAT01-06'
  navn           text not null,
  struktur       text,                           -- 'per trinn' | 'etter 10. trinn' | ...
  gjelder_fra    date,
  gjelder_til    date,
  aktiv          boolean not null default false, -- kun én aktiv versjon per fag om gangen
  sist_sjekket   timestamptz not null default now(),
  opprettet      timestamptz not null default now()
);
create unique index laereplan_ett_aktivt_per_fag
  on laereplan (fag) where aktiv;
create index laereplan_fag_idx on laereplan (fag);

create table laereplan_varsel (
  id              uuid primary key default gen_random_uuid(),
  laereplan_id    uuid not null references laereplan(id) on delete cascade,
  forrige_kode    text,
  antall_endret   int not null default 0,
  antall_nye      int not null default 0,
  antall_fjernet  int not null default 0,
  detaljer        jsonb,
  status          text not null default 'venter_godkjenning', -- 'venter_godkjenning' | 'godkjent' | 'avvist'
  opprettet       timestamptz not null default now()
);

create table kompetansemaal (
  id              uuid primary key default gen_random_uuid(),
  laereplan_id    uuid not null references laereplan(id) on delete cascade,
  udir_id         text not null,                 -- id fra data.udir.no
  trinn           int not null check (trinn between 8 and 10),
  tekst           text not null,
  emneomrade      text,
  maa_gjennomgaas boolean not null default false, -- flagget etter endring i ny læreplanversjon
  opprettet       timestamptz not null default now()
);
create unique index kompetansemaal_udir_unik on kompetansemaal (laereplan_id, udir_id);
create index kompetansemaal_trinn_idx on kompetansemaal (trinn);

-- Ett emne = ett punkt i "ruta" til en elev. Kan enten ha fullt bygget
-- innhold (har_innhold = true, med laeredel/oving/testsporsmal under
-- seg) eller bare vise fram kompetansemålet (har_innhold = false, for
-- områder som ennå ikke er skrevet ut).
create table emne (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique,                 -- f.eks. 'pot', 'retorikk' — null for emner uten innhold ennå
  fag               text not null,
  trinn             int not null check (trinn between 8 and 10),
  navn              text not null,
  kompetansemaal_id uuid references kompetansemaal(id) on delete set null,
  kompetansemaal_tekst text not null,             -- denormalisert visningstekst (matcher prototypens `m`)
  regel             text,                          -- kort huskeregel (prototypens `regel`)
  rekkefolge        int not null default 0,        -- posisjon i ruta for fag+trinn
  har_innhold       boolean not null default false,
  opprettet         timestamptz not null default now()
);
create index emne_fag_trinn_idx on emne (fag, trinn, rekkefolge);

create table laeredel (
  id           uuid primary key default gen_random_uuid(),
  emne_id      uuid not null references emne(id) on delete cascade,
  rekkefolge   int not null,
  tittel       text not null,     -- prototypens `h`
  tekst        text not null,     -- prototypens `p`
  eksempel     text,              -- prototypens `eks`
  advarsel     text,              -- prototypens `adv` — vanlig felle
  unique (emne_id, rekkefolge)
);

create table oving (
  id           uuid primary key default gen_random_uuid(),
  emne_id      uuid not null references emne(id) on delete cascade,
  rekkefolge   int not null,
  tittel       text not null,     -- prototypens `t`
  niva         text,              -- 'start' | 'ekstra' | 'utfordring' | null (normal)
  unique (emne_id, rekkefolge)
);

create table ovingssteg (
  id              uuid primary key default gen_random_uuid(),
  oving_id        uuid not null references oving(id) on delete cascade,
  rekkefolge      int not null,
  sporsmal        text not null,      -- `q`
  sporsmal_enkel  text,               -- `enkel` — forenklet ordlyd for lavere trinn
  kort_navn       text not null,      -- `kort` — vises på hjelpestien
  fasit           text[] not null,    -- godkjente svar-varianter
  hint_naer       text,               -- `naer` — et lite dytt
  hint_konkret    text,               -- `hint`
  hint_vinkel     text,               -- `om` — annen innfallsvinkel
  hint_lignende   text,               -- `lign` — foreslått enklere oppgave
  laer_ref_id     uuid references laeredel(id) on delete set null,
  unique (oving_id, rekkefolge)
);

create table feilsvar (
  id             uuid primary key default gen_random_uuid(),
  ovingssteg_id  uuid not null references ovingssteg(id) on delete cascade,
  nokkelord      text not null,   -- substreng som matches mot elevens svar
  forklaring     text not null
);
create index feilsvar_steg_idx on feilsvar (ovingssteg_id);

create table testsporsmal (
  id             uuid primary key default gen_random_uuid(),
  emne_id        uuid not null references emne(id) on delete cascade,
  rekkefolge     int not null,
  sporsmal       text not null,       -- `q`
  alternativer   text[] not null,     -- `alt`
  riktig_indeks  int not null,        -- `r`
  forklaring     text not null,       -- `f`
  unique (emne_id, rekkefolge)
);

-- ============================================================
-- ELEVDATA — data om mindreårige. RLS på alt.
-- ============================================================

-- Kontoen tilhører den foresatte (auth.users). Eleven har ingen egen
-- innlogging i v1 — foresatt og elev deler konto. Vi lagrer bevisst
-- bare fornavn, aldri etternavn eller fødselsdato.
create table elev (
  id             uuid primary key default gen_random_uuid(),
  foresatt_id    uuid not null references auth.users(id) on delete cascade,
  fornavn        text not null,
  trinn          int not null check (trinn between 8 and 10),
  fremmedsprak   text,             -- 'spansk' | 'tysk' | 'fransk' | 'annet' | 'fordypning' | null
  opprettet      timestamptz not null default now()
);
create index elev_foresatt_idx on elev (foresatt_id);

create table fremdrift (
  id              uuid primary key default gen_random_uuid(),
  elev_id         uuid not null references elev(id) on delete cascade,
  emne_id         uuid not null references emne(id) on delete cascade,
  laer_lest       boolean not null default false,
  oving_fullfort  jsonb not null default '[]'::jsonb, -- bool-array, én verdi per oving i rekkefølge
  test_riktige    int,               -- antall riktige på siste testforsøk (av 5)
  test_bestatt    boolean,
  nivaa           text,              -- 'hoy' | 'ok' | 'lav' — hvor mye hjelp eleven trengte
  oppdatert       timestamptz not null default now(),
  unique (elev_id, emne_id)
);
create index fremdrift_elev_idx on fremdrift (elev_id);

-- "Himmelen": regler eleven har funnet ut selv. Én stjerne per
-- bestått test, med regelen fra emnet på det tidspunktet.
create table bok (
  id           uuid primary key default gen_random_uuid(),
  elev_id      uuid not null references elev(id) on delete cascade,
  emne_id      uuid references emne(id) on delete set null,
  regel_tekst  text not null,
  opprettet    timestamptz not null default now()
);
create index bok_elev_idx on bok (elev_id);

-- Daglig meldingskvote for AI-veiledningen (STEG 4).
create table kvote (
  elev_id         uuid not null references elev(id) on delete cascade,
  dato            date not null default current_date,
  meldinger_brukt int not null default 0,
  oppdatert       timestamptz not null default now(),
  primary key (elev_id, dato)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table laereplan enable row level security;
alter table laereplan_varsel enable row level security;
alter table kompetansemaal enable row level security;
alter table emne enable row level security;
alter table laeredel enable row level security;
alter table oving enable row level security;
alter table ovingssteg enable row level security;
alter table feilsvar enable row level security;
alter table testsporsmal enable row level security;
alter table elev enable row level security;
alter table fremdrift enable row level security;
alter table bok enable row level security;
alter table kvote enable row level security;

-- Innhold er offentlig lesbart for innloggede brukere (ikke elevdata),
-- men skrives kun av service role (seed-scriptet og synk-jobben).
create policy "innhold er lesbart for innloggede" on laereplan
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on kompetansemaal
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on emne
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on laeredel
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on oving
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on ovingssteg
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on feilsvar
  for select to authenticated using (true);
create policy "innhold er lesbart for innloggede" on testsporsmal
  for select to authenticated using (true);
-- laereplan_varsel er internt (redaksjonen) — ingen klient-policy, kun service role.

-- Elevdata: kun den foresatte som eier eleven kommer til, i begge
-- retninger (via elev.foresatt_id, eller via elev_id på barnetabeller).
create policy "foresatt ser og eier egne elever" on elev
  for all to authenticated
  using (foresatt_id = auth.uid())
  with check (foresatt_id = auth.uid());

create policy "foresatt ser og eier fremdrift for egne elever" on fremdrift
  for all to authenticated
  using (elev_id in (select id from elev where foresatt_id = auth.uid()))
  with check (elev_id in (select id from elev where foresatt_id = auth.uid()));

create policy "foresatt ser og eier bok for egne elever" on bok
  for all to authenticated
  using (elev_id in (select id from elev where foresatt_id = auth.uid()))
  with check (elev_id in (select id from elev where foresatt_id = auth.uid()));

create policy "foresatt ser og eier kvote for egne elever" on kvote
  for all to authenticated
  using (elev_id in (select id from elev where foresatt_id = auth.uid()))
  with check (elev_id in (select id from elev where foresatt_id = auth.uid()));
