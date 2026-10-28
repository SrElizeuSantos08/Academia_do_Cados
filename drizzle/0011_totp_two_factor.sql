CREATE TABLE IF NOT EXISTS auth_totp(user TEXT PRIMARY KEY NOT NULL REFERENCES people(id),secret TEXT NOT NULL DEFAULT '',pending_secret TEXT NOT NULL DEFAULT '',enabled INTEGER NOT NULL DEFAULT 0,last_step INTEGER NOT NULL DEFAULT 0,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_totp_challenges(token_hash TEXT PRIMARY KEY NOT NULL,user TEXT NOT NULL REFERENCES people(id),expires INTEGER NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_totp_challenges_user ON auth_totp_challenges(user,expires);
