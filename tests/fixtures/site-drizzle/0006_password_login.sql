CREATE TABLE IF NOT EXISTS auth_passwords(user TEXT PRIMARY KEY NOT NULL REFERENCES people(id),salt TEXT NOT NULL,password_hash TEXT NOT NULL,must_change INTEGER NOT NULL DEFAULT 0,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_sessions(token_hash TEXT PRIMARY KEY NOT NULL,user TEXT NOT NULL REFERENCES people(id),expires INTEGER NOT NULL,created TEXT NOT NULL,version TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS auth_sessions_user ON auth_sessions(user);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_profiles(user TEXT PRIMARY KEY NOT NULL REFERENCES people(id),company TEXT NOT NULL DEFAULT '',account_type TEXT NOT NULL DEFAULT 'student');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS auth_limits(key TEXT PRIMARY KEY NOT NULL,count INTEGER NOT NULL,started INTEGER NOT NULL);
--> statement-breakpoint
INSERT INTO settings(key,value) VALUES('password_login','on') ON CONFLICT(key) DO UPDATE SET value='on';
