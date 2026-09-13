-- =============================================================================
--  PROGETTO SUPABASE «SERVIZI» (qcvwrgjldbdoxcfdsvkq): bucket notizie-media
-- -----------------------------------------------------------------------------
--  Revisione di sicurezza del 13/09/2026. Il bucket pubblico notizie-media
--  accettava caricamenti e cancellazioni da QUALUNQUE utente autenticato, e la
--  registrazione di nuovi utenti sul progetto era aperta: chiunque poteva
--  registrarsi con la chiave pubblica del sito, caricare file di ogni tipo su un
--  indirizzo nostro e cancellare le immagini delle notizie.
--  Ora scrive solo l'admin Formedil (lo stesso uid della policy sulla tabella
--  notizie); la lettura pubblica resta. Tipi ammessi quelli gia' presenti.
--  ⚠️ La registrazione aperta si chiude a mano dal pannello Supabase
--  (Authentication → Sign In / Providers → «Allow new users to sign up»).
--  Applicata come migrazione notizie_media_solo_admin.
-- =============================================================================

drop policy if exists "Upload autenticati notizie-media" on storage.objects;
drop policy if exists "Delete autenticati notizie-media" on storage.objects;
create policy "Upload solo admin notizie-media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'notizie-media' and (select auth.uid()) = '8e5f549f-94fe-49f0-aec9-5f1aea353d7f'::uuid);
create policy "Delete solo admin notizie-media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'notizie-media' and (select auth.uid()) = '8e5f549f-94fe-49f0-aec9-5f1aea353d7f'::uuid);

update storage.buckets
   set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','application/pdf'],
       file_size_limit = 10485760
 where id = 'notizie-media';
