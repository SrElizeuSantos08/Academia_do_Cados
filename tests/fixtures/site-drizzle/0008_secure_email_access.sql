-- Remove the legacy shared first-access mechanism without changing personal passwords, RAs or learning records.
DELETE FROM auth_sessions WHERE user IN (SELECT user FROM auth_passwords WHERE must_change=1);
--> statement-breakpoint
DELETE FROM auth_passwords WHERE must_change=1;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_email_challenges(id TEXT PRIMARY KEY NOT NULL,user TEXT NOT NULL REFERENCES people(id),salt TEXT NOT NULL,password_hash TEXT NOT NULL,expires INTEGER NOT NULL,consumed INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_email_user ON auth_email_challenges(user,expires);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_email_events(id TEXT PRIMARY KEY NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('access','mfa')),recipient_masked TEXT NOT NULL,provider TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('accepted','failed')),error_code TEXT NOT NULL DEFAULT '',created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_email_events_created ON auth_email_events(created DESC);
