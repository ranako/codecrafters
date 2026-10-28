-- Run in the CodeCrafters project's Supabase SQL Editor.
-- These are explicitly labeled stock-photo samples, not records of real events.
-- Re-running skips existing sample IDs and never overwrites edited albums.
-- Delete or unpublish them later in Admin > Photo Album.
begin;

insert into public.past_event_albums
  (id, title, event_date, description, cover_image_url, photos, sort_order, is_published)
values
  (
    'cc000000-0000-4000-8000-000000000001',
    'Sample album: learning together',
    'Sample content',
    'A preview of the CodeCrafters photo album layout using stock photography. These images do not document a CodeCrafters event. Replace the title, description, and photos with your own community memories, or delete this sample in the admin panel.',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    array[
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200'
    ]::text[],
    1000, true
  ),
  (
    'cc000000-0000-4000-8000-000000000002',
    'Sample album: building with peers',
    'Sample content',
    'Stock images illustrating collaboration and project work. This is editable demonstration content, not a report of an actual club gathering. Add your own photos here when you are ready.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    array[
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200'
    ]::text[],
    1001, true
  ),
  (
    'cc000000-0000-4000-8000-000000000003',
    'Sample album: ideas into code',
    'Sample content',
    'A stock-photo preview for coding and sharing ideas. Replace this sample with a real community album or remove it through Supabase or Admin > Photo Album. No event or achievement is implied.',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200',
    array[
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200'
    ]::text[],
    1002, true
  )
on conflict (id) do nothing;

commit;
