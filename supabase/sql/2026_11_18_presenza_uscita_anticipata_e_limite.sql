-- ════════════════════════════════════════════════════════════════════════
-- Firma di presenza: uscita anticipata e «niente limite di invii» (18/11/2026)
-- Progetto Servizi. La parte del Gestionale è in
-- segreteria-app/supabase/sql/2026_11_18_presenza_uscita_anticipata_e_limite.sql
-- 1. pres_che_cosa: chi ha già l'entrata e non ha ancora l'uscita, prima di
--    metà turno, riceve puo_uscire = true; il telefono chiede «Stai uscendo in
--    anticipo?» e manda uscita_anticipata = 'si'. Il trigger della cassetta la
--    registra come uscita.
-- 2. presenze_pubbliche.senza_limite (spunta del corso nel Gestionale):
--    pres_senza_limite(riferimento) la legge per portale-ricevi, che allora
--    non applica il limite di invii all'ora alle firme di quel corso.
-- ════════════════════════════════════════════════════════════════════════

alter table public.presenze_pubbliche add column if not exists senza_limite boolean not null default false;

create or replace function public.pres_senza_limite(p_riferimento text)
returns boolean language plpgsql stable security definer set search_path to 'public', 'extensions' as $$
declare p int; cod text; fir text;
begin
  p := position('.' in coalesce(p_riferimento, ''));
  if p < 2 then return false; end if;
  cod := upper(regexp_replace(substr(p_riferimento, 1, p - 1), '[^A-Za-z0-9-]', '', 'g'));
  fir := lower(regexp_replace(substr(p_riferimento, p + 1), '[^A-Fa-f0-9]', '', 'g'));
  return coalesce((select t.senza_limite from public.presenze_pubbliche t
                    where t.codice = cod
                      and t.firma_hash = encode(extensions.digest(convert_to(fir, 'UTF8'), 'sha256'), 'hex')
                      and (t.chiuso_il is null or t.chiuso_il > now())), false);
end $$;
revoke all on function public.pres_senza_limite(text) from public, anon, authenticated;

create or replace function public.trg_cassetta_presenza_firmata()
returns trigger language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare rif text; cod text; fir text; per text; h text; t public.presenze_pubbliche; mom jsonb; p int; v_tipo text;
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
    v_tipo := mom ->> 'tipo';
    /* (18/11/2026) l'uscita anticipata dichiarata dal telefono */
    if v_tipo = 'entrata' and coalesce(new.payload ->> 'uscita_anticipata', '') = 'si' then v_tipo := 'uscita'; end if;
    insert into public.presenze_firmate (codice, h, giornata, turno, tipo, ora, cassetta_id)
    values (cod, h, (mom ->> 'giornata')::date, (mom ->> 'turno')::int, v_tipo, coalesce(new.ricevuto_at, now()), new.id);
  exception when others then
    raise warning 'trg_cassetta_presenza_firmata: %', sqlerrm;
  end;
  return new;
end $$;

create or replace function public.pres_che_cosa(p_codice text, p_firma text, p_personale text, p_anno text default null)
returns jsonb language plpgsql stable security definer set search_path to 'public', 'extensions' as $$
declare t public.presenze_pubbliche; cod text; fir text; per text; h text; v jsonb; mom jsonb;
        v_anno text; v_verif boolean := false; v_gia timestamptz; v_usc timestamptz; v_puo boolean := false;
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
  /* entrata già firmata prima di metà turno: o è già uscito in anticipo, o può farlo */
  if v_gia is not null and mom ->> 'tipo' = 'entrata' then
    v_usc := public.pres_gia_firmata(cod, h, v, mom || jsonb_build_object('tipo', 'uscita'));
    if v_usc is not null then
      mom := mom || jsonb_build_object('tipo', 'uscita');
      v_gia := v_usc;
    elsif v_gia < now() - interval '10 minutes' then
      v_puo := true;
    end if;
  end if;
  return jsonb_build_object(
    'trovato', true, 'iniziali', v ->> 'n', 'anno_verificato', v_verif,
    'giornata', mom ->> 'giornata', 'oggi', (mom ->> 'oggi')::boolean,
    'tipo', mom ->> 'tipo', 'turno', (mom ->> 'turno')::int, 'ora_turno', mom ->> 'ora_turno',
    'fuori_orario', coalesce((mom ->> 'fuori_orario')::boolean, true),
    'gia_firmato', v_gia is not null,
    'gia_ora', case when v_gia is null then null else to_char(v_gia at time zone 'Europe/Rome', 'HH24:MI') end,
    'puo_uscire', v_puo);
end $$;
