-- Run this in Supabase SQL Editor AFTER the main schema migration
-- Sets up storage policies for winner proof uploads

-- Allow authenticated users to upload their own proofs
create policy "Users can upload own winner proofs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'winner-proofs'
  and (storage.foldername(name))[1] = 'proofs'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to view their own proofs
create policy "Users can view own winner proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'winner-proofs'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow admins to view all proofs
create policy "Admins can view all winner proofs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'winner-proofs'
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Allow users to update (re-upload) their own proofs
create policy "Users can update own winner proofs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'winner-proofs'
  and (storage.foldername(name))[2] = auth.uid()::text
);