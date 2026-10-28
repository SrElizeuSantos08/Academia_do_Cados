ALTER TABLE auth_totp_challenges ADD COLUMN code_hash TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE auth_totp_challenges ADD COLUMN purpose TEXT NOT NULL DEFAULT 'login';
