-- ENUMS
CREATE TYPE event_status AS ENUM
  ('draft', 'active', 'paused', 'completed', 'archived');

CREATE TYPE delivery_mode AS ENUM
  ('realtime', 'end_of_event');

CREATE TYPE photo_status AS ENUM
  ('incoming', 'processing', 'matched', 'unmatched', 'review');

CREATE TYPE match_method AS ENUM
  ('ocr', 'face', 'manual');

CREATE TYPE email_type AS ENUM
  ('gallery_link', 'new_photos', 'welcome');

CREATE TYPE email_status AS ENUM
  ('sent', 'delivered', 'failed', 'bounced');

-- EVENTS
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  date date NOT NULL,
  location text,
  max_guests int4 DEFAULT 300,
  status event_status DEFAULT 'draft',
  client_name text,
  client_logo_url text,
  brand_color text DEFAULT '#1D9E75',
  delivery_mode delivery_mode DEFAULT 'realtime',
  gallery_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- GUESTS
CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  badge_number int4,
  face_encoding float8[],
  gallery_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  registered_at timestamptz DEFAULT now(),
  email_sent_at timestamptz,
  photo_count int4 DEFAULT 0,
  gdpr_consent boolean DEFAULT false,
  UNIQUE(event_id, badge_number),
  UNIQUE(event_id, email)
);

-- BADGES
CREATE TABLE badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  number int4 NOT NULL,
  qr_code text NOT NULL,
  guest_id uuid REFERENCES guests(id) ON DELETE SET NULL,
  issued boolean DEFAULT false,
  issued_at timestamptz,
  UNIQUE(event_id, number)
);

-- PHOTOS
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  status photo_status DEFAULT 'incoming',
  taken_at timestamptz,
  uploaded_at timestamptz DEFAULT now(),
  ocr_raw text,
  ocr_number int4,
  face_match_score float4,
  match_method match_method,
  needs_review boolean DEFAULT false
);

-- PHOTO_GUESTS (M:N vazba fotka ↔ host)
CREATE TABLE photo_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id uuid NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  assigned_by match_method NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  UNIQUE(photo_id, guest_id)
);

-- EMAIL_LOG
CREATE TABLE email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type email_type NOT NULL,
  sent_at timestamptz DEFAULT now(),
  resend_id text,
  status email_status DEFAULT 'sent'
);

-- INDEXY pro výkon
CREATE INDEX idx_guests_event ON guests(event_id);
CREATE INDEX idx_guests_badge ON guests(event_id, badge_number);
CREATE INDEX idx_guests_token ON guests(gallery_token);
CREATE INDEX idx_photos_event ON photos(event_id);
CREATE INDEX idx_photos_status ON photos(event_id, status);
CREATE INDEX idx_photo_guests_photo ON photo_guests(photo_id);
CREATE INDEX idx_photo_guests_guest ON photo_guests(guest_id);
CREATE INDEX idx_badges_event ON badges(event_id);
CREATE INDEX idx_badges_number ON badges(event_id, number);

-- RLS (Row Level Security) - zapnout ale zatím volný přístup pro admin
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Policy: admin vidí vše (service role)
CREATE POLICY "Service role full access" ON events
  FOR ALL USING (true);
CREATE POLICY "Service role full access" ON guests
  FOR ALL USING (true);
CREATE POLICY "Service role full access" ON photos
  FOR ALL USING (true);
CREATE POLICY "Service role full access" ON photo_guests
  FOR ALL USING (true);
CREATE POLICY "Service role full access" ON badges
  FOR ALL USING (true);
CREATE POLICY "Service role full access" ON email_log
  FOR ALL USING (true);
