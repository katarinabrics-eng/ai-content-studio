alter table events
  add column if not exists event_category text,
  add column if not exists slideshow_welcome_text text;
