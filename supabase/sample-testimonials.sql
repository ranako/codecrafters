-- Run in the CodeCrafters Supabase SQL Editor.
-- Explicit preview content, not quotes from real members.
-- Edit, unpublish, or delete in Admin > Testimonials.
-- Re-running does not overwrite existing records.
begin;

insert into public.testimonials
  (id, name, role, text, avatar_url, sort_order, is_published)
values
  (
    'cc000000-0000-4000-8000-000000000011',
    'Sample member 01', 'Preview content',
    'Sample testimonial: a place to learn alongside peers, ask questions, and turn ideas into small projects. Replace this preview with a real member quote before sharing it as community feedback.',
    null, 1000, true
  ),
  (
    'cc000000-0000-4000-8000-000000000012',
    'Sample member 02', 'Preview content',
    'Sample testimonial: workshops and collaborative coding can make a new topic feel more approachable. This is demonstration copy, not a statement from a real CodeCrafters member.',
    null, 1001, true
  ),
  (
    'cc000000-0000-4000-8000-000000000013',
    'Sample member 03', 'Preview content',
    'Sample testimonial: sharing work, exchanging feedback, and meeting other builders are good reasons to join a technical community. Edit or delete this sample through the admin panel.',
    null, 1002, true
  )
on conflict (id) do nothing;

commit;
