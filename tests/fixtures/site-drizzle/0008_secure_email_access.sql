-- Remove the legacy shared first-access mechanism without changing personal passwords, RAs or learning records.
DELETE FROM auth_sessions WHERE user IN (SELECT user FROM auth_passwords WHERE must_change=1);
--> statement-breakpoint
DELETE FROM auth_passwords WHERE must_change=1;
--> statement-breakpoint
ALTER TABLE auth_profiles ADD COLUMN account_type TEXT NOT NULL DEFAULT 'student';
--> statement-breakpoint
CREATE TABLE auth_email_challenges(id TEXT PRIMARY KEY NOT NULL,user TEXT NOT NULL REFERENCES people(id),salt TEXT NOT NULL,password_hash TEXT NOT NULL,expires INTEGER NOT NULL,consumed INTEGER NOT NULL DEFAULT 0,created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX auth_email_user ON auth_email_challenges(user,expires);
