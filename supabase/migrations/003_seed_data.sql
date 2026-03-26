-- Run this AFTER 001_initial_schema.sql
-- Inserts sample charities for testing

insert into public.charities (name, description, image_url, website_url, is_featured, is_active) values
(
  'Cancer Research UK',
  'Cancer Research UK is the world''s largest independent cancer research charity, dedicated to saving more lives through research, influence and information.',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop',
  'https://www.cancerresearchuk.org',
  true,
  true
),
(
  'British Heart Foundation',
  'We fund research that saves and improves lives. Every pound donated to us means our scientists can work to beat heartbreak forever.',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop',
  'https://www.bhf.org.uk',
  false,
  true
),
(
  'Age UK',
  'Age UK is the country''s leading charity dedicated to helping everyone make the most of later life. We help older people across the UK.',
  'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop',
  'https://www.ageuk.org.uk',
  false,
  true
),
(
  'Macmillan Cancer Support',
  'Macmillan provides medical, emotional, practical and financial support, and campaign for better cancer care across the UK.',
  'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop',
  'https://www.macmillan.org.uk',
  false,
  true
),
(
  'Children in Need',
  'BBC Children in Need is the BBC''s UK charity, making a difference to the lives of disadvantaged children and young people across the UK.',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop',
  'https://www.bbcchildreninneed.co.uk',
  false,
  true
),
(
  'Royal British Legion',
  'We provide lifelong support to Armed Forces personnel, veterans and their families, helping them with practical, emotional and financial support.',
  'https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=800&auto=format&fit=crop',
  'https://www.britishlegion.org.uk',
  false,
  true
);

-- Sample charity events
insert into public.charity_events (charity_id, title, description, event_date)
select
  c.id,
  'Annual Golf Day 2026',
  'Join us for our flagship golf fundraiser. All proceeds go directly to our research programmes.',
  '2026-07-15 09:00:00+00'
from public.charities c
where c.name = 'Cancer Research UK';

insert into public.charity_events (charity_id, title, description, event_date)
select
  c.id,
  'Heart Health Golf Classic',
  'An 18-hole scramble supporting heart disease research. Breakfast and lunch included.',
  '2026-08-22 08:00:00+00'
from public.charities c
where c.name = 'British Heart Foundation';

-- NOTE: To create your admin user:
-- 1. Register normally at /register using your admin email
-- 2. Confirm your email
-- 3. Run this SQL replacing YOUR_USER_ID with your auth user ID from Supabase Auth dashboard:
--
-- update public.profiles set role = 'admin' where id = 'YOUR_USER_ID';