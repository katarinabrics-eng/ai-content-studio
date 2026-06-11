ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'ai' CHECK (event_type IN ('ai', 'simple'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS gallery_public boolean DEFAULT false;
