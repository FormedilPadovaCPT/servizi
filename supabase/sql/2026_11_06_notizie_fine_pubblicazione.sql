-- Progetto Supabase SERVIZI (qcvwrgjldbdoxcfdsvkq) — 06/11/2026
-- Notizie: data di fine pubblicazione, e la data di inizio che finalmente conta.
--
-- Richiesta della segreteria: una notizia con la data di pubblicazione nel
-- futuro resta nascosta fino a quel giorno; con la data di fine sparisce dopo
-- quel giorno; senza fine resta sempre.
--
-- Fino a oggi la policy pubblica guardava solo «pubblicata = true»: la data
-- era un'etichetta e basta. Il filtro sta qui, nel database, e non nella
-- pagina: così una notizia programmata o scaduta non si legge nemmeno
-- chiamando l'API con la chiave pubblica. L'area admin continua a vederle
-- tutte grazie alla policy «Solo admin Formedil», che non si tocca.
--
-- I giorni sono quelli italiani: il database gira in UTC, e «fino al 30»
-- vuol dire fino alle 23:59 del 30 a Padova, non fino all'una di notte.

alter table public.notizie add column if not exists fine_pubbl date;
comment on column public.notizie.fine_pubbl is
  'Ultimo giorno (ora italiana) in cui la notizia si vede sul portale. Vuoto = resta sempre. 06/11/2026.';

alter table public.notizie drop constraint if exists notizie_fine_dopo_inizio;
alter table public.notizie add constraint notizie_fine_dopo_inizio
  check (fine_pubbl is null or data_pubbl is null or fine_pubbl >= data_pubbl);

-- Oggi a Padova.
create or replace function public.oggi_roma()
returns date language sql stable set search_path = ''
as $$ select (now() at time zone 'Europe/Rome')::date $$;

-- Una notizia è in vetrina se il suo giorno di inizio è arrivato e quello di
-- fine non è passato. Inizio vuoto = da sempre (come prima), fine vuota = per sempre.
create or replace function public.notizia_in_vetrina(p_inizio date, p_fine date)
returns boolean language sql stable set search_path = ''
as $$
  select (p_inizio is null or p_inizio <= public.oggi_roma())
     and (p_fine   is null or p_fine   >= public.oggi_roma())
$$;

drop policy if exists "Lettura pubblica notizie pubblicate" on public.notizie;
drop policy if exists "Lettura pubblica notizie in vetrina" on public.notizie;
create policy "Lettura pubblica notizie in vetrina" on public.notizie
  for select to public
  using (pubblicata = true and public.notizia_in_vetrina(data_pubbl, fine_pubbl));

-- Avvisi sul telefono: mai per una notizia che non si vede.
-- Il campanello del trigger non suona per una notizia programmata; la prende
-- il giro delle :07/:37 il giorno in cui entra in vetrina, ma solo dalle 7
-- alle 21 italiane, perché una notizia programmata non arrivi a mezzanotte.
-- Il campanello di una notizia pubblicata subito resta immediato a ogni ora.
create or replace function public.push_notizie_da_inviare(p_id uuid default null)
returns table(id uuid, titolo text, corpo text, priorita text)
language sql stable security definer set search_path = 'public'
as $function$
  select n.id, n.titolo, n.corpo, n.priorita
    from public.notizie n
   where n.pubblicata
     and public.notizia_in_vetrina(n.data_pubbl, n.fine_pubbl)
     and ((p_id is null
           and n.data_pubbl >= public.oggi_roma() - 3
           and extract(hour from now() at time zone 'Europe/Rome') between 7 and 20)
          or n.id = p_id)
     and not exists (select 1 from public.push_invii i where i.notizia_id = n.id and i.concluso_il is not null)
   order by n.created_at
   limit 5;
$function$;

create or replace function public.notizie_campanello_push()
returns trigger language plpgsql security definer set search_path = 'public', 'extensions'
as $function$
declare v_url text; v_token text;
begin
  if not new.pubblicata then return null; end if;
  if tg_op = 'UPDATE' and old.pubblicata then return null; end if;
  -- programmata o già scaduta: niente avviso adesso (06/11/2026)
  if not public.notizia_in_vetrina(new.data_pubbl, new.fine_pubbl) then return null; end if;
  if exists (select 1 from public.push_invii where notizia_id = new.id) then return null; end if;
  select valore into v_url from public.push_impostazioni where chiave = 'funzione_url';
  select valore into v_token from public.push_impostazioni where chiave = 'campanello_token';
  if v_url is null or v_token is null then return null; end if;
  begin
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('azione', 'invia', 'notizia_id', new.id),
      headers := jsonb_build_object('Content-Type', 'application/json', 'X-Campanello', v_token),
      timeout_milliseconds := 10000);
  exception when others then
    raise warning 'push-notizie: campanello non partito per la notizia %: %', new.id, sqlerrm;
  end;
  return null;
end $function$;
