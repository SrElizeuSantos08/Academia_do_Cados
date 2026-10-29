CREATE TABLE IF NOT EXISTS auth_email_events(
 id TEXT PRIMARY KEY NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('access','mfa')),
 recipient_masked TEXT NOT NULL,
 provider TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('accepted','failed')),
 error_code TEXT NOT NULL DEFAULT '',
 created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_email_events_created ON auth_email_events(created DESC);
