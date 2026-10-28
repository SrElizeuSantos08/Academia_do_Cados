-- Enable event-driven AI replies for new course support requests and forum questions.
-- The application stores each generated answer in the existing replies/messages tables.
INSERT INTO academia.settings (key, value)
VALUES
  ('agent:auto_support', 'on'),
  ('agent:auto_forum', 'on')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
