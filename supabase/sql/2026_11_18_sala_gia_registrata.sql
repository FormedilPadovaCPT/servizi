-- ════════════════════════════════════════════════════════════════════════
-- Registrazione in sala: niente doppia entrata                (18/11/2026)
-- Progetto Servizi. Dalla prova del corso 338 con l'utente: la pagina della
-- sala proponeva «entrata» fino a metà giornata e lasciava registrare una
-- seconda entrata. Stessa regola della firma dal QR: chi ha già registrato
-- l'entrata vede «hai già registrato l'entrata alle …» e passa all'uscita
-- (anticipata, se è prima di metà giornata); chi ha già registrato anche
-- l'uscita non registra più niente e si rivolge alla segreteria al banco.
--
-- Dopo il ritiro la cassetta svuota il payload: ogni registrazione in sala
-- lascia qui una riga minima (impronta del codice fiscale, giorno, momento,
-- ora). Niente nomi, niente codice fiscale in chiaro.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.sala_registrate (
  id          bigserial primary key,
  codice      text not null,          -- codice dell'evento (338-XXXX)
  h           text not null,          -- sha256 del codice fiscale
  giorno      date not null,
  tipo        text not null,          -- entrata | uscita
  ora         timestamptz not null default now(),
  cassetta_id bigint
);
create index if not exists sala_registrate_chiave on public.sala_registrate (codice, h, giorno, tipo);
alter table public.sala_registrate enable row level security;
revoke all on public.sala_registrate from anon, authenticated;

create or replace function public.trg_cassetta_sala_registrata()
returns trigger language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare rif text; cod text; fir text; p int; pers jsonb; x jsonb; cf text; tp text;
begin
  begin
    rif := coalesce(new.payload ->> 'riferimento', '');
    p := position('.' in rif);
    if p < 2 then return new; end if;
    cod := upper(regexp_replace(substr(rif, 1, p - 1), '[^A-Za-z0-9-]', '', 'g'));
    fir := lower(regexp_replace(substr(rif, p + 1), '[^A-Fa-f0-9]', '', 'g'));
    if not exists (select 1 from public.iscrizioni_pubbliche t where t.codice = cod
                    and t.firma_hash = encode(extensions.digest(convert_to(fir, 'UTF8'), 'sha256'), 'hex')) then
      return new;
    end if;
    pers := (new.payload ->> 'persone')::jsonb;
    if jsonb_typeof(pers) <> 'array' then return new; end if;
    for x in select * from jsonb_array_elements(pers) loop
      tp := x ->> 'in_sala';
      cf := upper(regexp_replace(coalesce(x ->> 'cf', ''), '[^A-Za-z0-9]', '', 'g'));
      continue when tp not in ('entrata', 'uscita') or length(cf) <> 16;
      insert into public.sala_registrate (codice, h, giorno, tipo, ora, cassetta_id)
      values (cod, encode(extensions.digest(convert_to(cf, 'UTF8'), 'sha256'), 'hex'),
              (coalesce(new.ricevuto_at, now()) at time zone 'Europe/Rome')::date, tp, coalesce(new.ricevuto_at, now()), new.id);
    end loop;
  exception when others then
    raise warning 'trg_cassetta_sala_registrata: %', sqlerrm;
  end;
  return new;
end $$;
drop trigger if exists trg_cassetta_sala_registrata on public.cassetta;
create trigger trg_cassetta_sala_registrata after insert on public.cassetta
  for each row when (new.tipo = 'isc') execute function public.trg_cassetta_sala_registrata();

-- che cosa ha già registrato oggi questa persona (per la pagina della sala)
create or replace function public.sala_stato(p_codice text, p_firma text, p_cf text)
returns jsonb language plpgsql stable security definer set search_path to 'public', 'extensions' as $$
declare cod text; fir text; cf text; v_h text; v_oggi date; e timestamptz; u timestamptz;
begin
  cod := upper(regexp_replace(coalesce(p_codice, ''), '[^A-Za-z0-9-]', '', 'g'));
  fir := lower(regexp_replace(coalesce(p_firma,  ''), '[^A-Fa-f0-9]',  '', 'g'));
  cf  := upper(regexp_replace(coalesce(p_cf, ''), '[^A-Za-z0-9]', '', 'g'));
  if length(cf) <> 16 then return jsonb_build_object('trovato', false); end if;
  if not exists (select 1 from public.iscrizioni_pubbliche t where t.codice = cod
                  and t.firma_hash = encode(extensions.digest(convert_to(fir, 'UTF8'), 'sha256'), 'hex')) then
    return jsonb_build_object('trovato', false);
  end if;
  v_h := encode(extensions.digest(convert_to(cf, 'UTF8'), 'sha256'), 'hex');
  v_oggi := (now() at time zone 'Europe/Rome')::date;
  select min(ora) filter (where tipo = 'entrata'), min(ora) filter (where tipo = 'uscita') into e, u
    from public.sala_registrate where codice = cod and h = v_h and giorno = v_oggi;
  return jsonb_build_object('trovato', true,
    'entrata', case when e is null then null else to_char(e at time zone 'Europe/Rome', 'HH24:MI') end,
    'uscita',  case when u is null then null else to_char(u at time zone 'Europe/Rome', 'HH24:MI') end);
end $$;
grant execute on function public.sala_stato(text, text, text) to anon, authenticated;
