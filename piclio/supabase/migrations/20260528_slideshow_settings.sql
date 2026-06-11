ALTER TABLE events
  ADD COLUMN IF NOT EXISTS slideshow_content         text    DEFAULT 'random',
  ADD COLUMN IF NOT EXISTS slideshow_selected_guests uuid[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slideshow_output          text    DEFAULT 'slideshow',
  ADD COLUMN IF NOT EXISTS slideshow_interval        integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS slideshow_animation       text    DEFAULT 'fade';
