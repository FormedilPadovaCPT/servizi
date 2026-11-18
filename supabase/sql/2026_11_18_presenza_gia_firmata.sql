-- ════════════════════════════════════════════════════════════════════════
-- Firma di presenza: «hai già firmato»                         (18/11/2026)
-- Progetto Servizi (portale). Dalla prova del corso 336 con l'utente: una
-- seconda firma prima di metà giornata veniva presa come seconda entrata.
-- Regola dell'utente: chi ha già firmato l'entrata (o l'uscita) di quel
-- turno non può firmarla di nuovo; il telefono dice «hai già firmato» e,
-- se c'è un errore, di rivolgersi al tutor d'aula, che dal PC la respinge
-- e così la sblocca.
--
-- Dopo il ritiro la cassetta svuota il payload: il portale non saprebbe più
-- chi ha firmato. Perciò ogni firma che entra in cassetta lascia qui una
-- riga minima (impronta del codice personale, giornata, turno, momento,
-- ora): niente nomi, niente codici in chiaro.
-- Lo sblocco arriva dal Gestionale con la pubblicazione delle firme
-- (persone[].s = { "aaaa-mm-gg|turno|tipo": ora dello sblocco }): una firma
-- registrata qui PRIMA dello sblocco non blocca più.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.presenze_firmate (
  id          bigserial primary key,
  codice      text not null,          -- codice del corso (P336-9A7Z)
  h           text not null,          -- sha256 del codice personale
  giornata    date not null,
  turno       int,
  tipo        text,                   -- entrata | uscita
  ora         timestamptz not null default now(),
  cassetta_id bigint
);
create index if not exists presenze_firmate_chiave on public.presenze_firmate (codice, h, giornata, turno, tipo);
alter table public.presenze_firmate enable row level security;
-- nessuna policy: la leggono e scrivono solo le funzioni security definer
revoke all on public.presenze_firmate from anon, authenticated;

-- la stessa scelta di giornata e momento di pres_che_cosa
create or replace function public.pres_momento(t public.presenze_pubbliche, p_ora timestamptz default now())
returns jsonb language plpgsql stable set search_path to 'public' as $$
declare g jsonb; v_oggi date; v_data date; dec jsonb;
begin
  v_oggi := (p_ora at time zone 'Europe/Rome')::date;
  select x into g from jsonb_array_elements(t.giornate) x
   where (x ->> 'data') ~ '^\d{4}-\d{2}-\d{2}$'
   order by abs((x ->> 'data')::date - v_oggi), x ->> 'dalle' limit 1;
  if g is null then return null; end if;
  v_data := (g ->> 'data')::date;
  dec := public.pres_decidi(v_data, (g ->> 'dalle')::time, (g ->> 'alle')::time, (g ->> 'dalle2')::time, (g ->> 'alle2')::time, p_ora);
  return dec || jsonb_build_object('giornata', to_char(v_data, 'YYYY-MM-DD'), 'oggi', (v_data = v_oggi));
end $$;
revoke all on function public.pres_momento(public.presenze_pubbliche, timestamptz) from public, anon, authenticated;

-- la prima firma valida di quel momento dopo l'eventuale sblocco: è quella che conta
create or replace function public.pres_gia_firmata(p_codice text, p_h text, p_pers jsonb, p_mom jsonb)
returns timestamptz language plpgsql stable set search_path to 'public' as $$
declare v_sbl timestamptz; k text;
begin
  if p_mom is null or p_mom ->> 'tipo' is null then return null; end if;
  k := (p_mom ->> 'giornata') || '|' || coalesce(p_mom ->> 'turno', '') || '|' || (p_mom ->> 'tipo');
  begin v_sbl := (p_pers -> 's' ->> k)::timestamptz; exception when others then v_sbl := null; end;
  return (select min(ora) from public.presenze_firmate
           where codice = p_codice and h = p_h and giornata = (p_mom ->> 'giornata')::date
             and turno is not distinct from (p_mom ->> 'turno')::int and tipo = p_mom ->> 'tipo'
             and ora > coalesce(v_sbl, '-infinity'::timestamptz));
end $$;
revoke all on function public.pres_gia_firmata(text, text, jsonb, jsonb) from public, anon, authenticated;

-- ogni firma che entra in cassetta lascia la sua riga (mai bloccare l'inserimento)
create or replace function public.trg_cassetta_presenza_firmata()
returns trigger language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare rif text; cod text; fir text; per text; h text; t public.presenze_pubbliche; mom jsonb; p int;
begin
  begin
    rif := coalesce(new.payload ->> 'riferimento', '');
    p := position('.' in rif);
    if p < 2 then return new; end if;
    cod := upper(regexp_replace(substr(rif, 1, p - 1), '[^A-Za-z0-9-]', '', 'g'));
    fir := lower(regexp_replace(substr(rif, p + 1), '[^A-Fa-f0-9]', '', 'g'));
    per := upper(regexp_replace(coalesce(new.payload ->> 'codice_personale', ''), '[^A-Za-z0-9]', '', 'g'));
    if length(per) not between 3 and 12 then return new; end if;
    select * into t from public.presenze_pubbliche
     where codice = cod and firma_hash = encode(extensions.digest(convert_to(fir, 'UTF8'), 'sha256'), 'hex');
    if not found then return new; end if;
    h := encode(extensions.digest(convert_to(per, 'UTF8'), 'sha256'), 'hex');
    if not exists (select 1 from jsonb_array_elements(t.persone) x where x ->> 'h' = h) then return new; end if;
    mom := public.pres_momento(t, coalesce(new.ricevuto_at, now()));
    if mom is null or mom ->> 'tipo' is null then return new; end if;
    insert into public.presenze_firmate (codice, h, giornata, turno, tipo, ora, cassetta_id)
    values (cod, h, (mom ->> 'giornata')::date, (mom ->> 'turno')::int, mom ->> 'tipo', coalesce(new.ricevuto_at, now()), new.id);
  exception when others then
    raise warning 'trg_cassetta_presenza_firmata: %', sqlerrm;
  end;
  return new;
end $$;
drop trigger if exists trg_cassetta_presenza_firmata on public.cassetta;
create trigger trg_cassetta_presenza_firmata after insert on public.cassetta
  for each row when (new.tipo = 'prs') execute function public.trg_cassetta_presenza_firmata();

-- pres_che_cosa: in più gia_firmato / gia_ora
create or replace function public.pres_che_cosa(p_codice text, p_firma text, p_personale text, p_anno text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public', 'extensions' as $$
declare t public.presenze_pubbliche; cod text; fir text; per text; h text; v jsonb; mom jsonb;
        v_anno text; v_verif boolean := false; v_gia timestamptz;
begin
  cod := upper(regexp_replace(coalesce(p_codice, ''), '[^A-Za-z0-9-]', '', 'g'));
  fir := lower(regexp_replace(coalesce(p_firma,  ''), '[^A-Fa-f0-9]',  '', 'g'));
  per := upper(regexp_replace(coalesce(p_personale, ''), '[^A-Za-z0-9]', '', 'g'));
  v_anno := regexp_replace(coalesce(p_anno, ''), '[^0-9]', '', 'g');
  if length(per) not between 3 and 12 then return jsonb_build_object('trovato', false); end if;
  select * into t from public.presenze_pubbliche
   where codice = cod
     and firma_hash = encode(extensions.digest(convert_to(fir, 'UTF8'), 'sha256'), 'hex');
  if not found then return jsonb_build_object('trovato', false); end if;

  h := encode(extensions.digest(convert_to(per, 'UTF8'), 'sha256'), 'hex');
  select x into v from jsonb_array_elements(t.persone) x where x ->> 'h' = h;
  if v is null then return jsonb_build_object('trovato', false); end if;

  if p_anno is not null and v ? 'a' then
    if length(v_anno) <> 4
       or encode(extensions.digest(convert_to(per || ':' || right(v_anno, 2), 'UTF8'), 'sha256'), 'hex') <> v ->> 'a' then
      return jsonb_build_object('trovato', false, 'anno_errato', true);
    end if;
    v_verif := true;
  end if;

  mom := public.pres_momento(t, now());
  if mom is null then
    return jsonb_build_object('trovato', true, 'iniziali', v ->> 'n', 'anno_verificato', v_verif, 'giornata', null, 'tipo', null, 'fuori_orario', true);
  end if;
  v_gia := public.pres_gia_firmata(cod, h, v, mom);
  return jsonb_build_object(
    'trovato', true, 'iniziali', v ->> 'n', 'anno_verificato', v_verif,
    'giornata', mom ->> 'giornata', 'oggi', (mom ->> 'oggi')::boolean,
    'tipo', mom ->> 'tipo', 'turno', (mom ->> 'turno')::int, 'ora_turno', mom ->> 'ora_turno',
    'fuori_orario', coalesce((mom ->> 'fuori_orario')::boolean, true),
    'gia_firmato', v_gia is not null,
    'gia_ora', case when v_gia is null then null else to_char(v_gia at time zone 'Europe/Rome', 'HH24:MI') end);
end $$;
