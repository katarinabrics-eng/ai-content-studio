-- Tabulka pro uložení admin hesla (hash) – umožní reset/založení hesla bez změny env.
CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_config_updated ON app_config (updated_at);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access app_config" ON app_config FOR ALL USING (true);

COMMENT ON TABLE app_config IS 'Klíč-hodnota konfigurace (admin_password_hash, atd.).';
