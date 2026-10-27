-- Structural replica for Academia do Caos; no personal data or credentials.
CREATE SCHEMA IF NOT EXISTS academia;
REVOKE ALL ON SCHEMA academia FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA academia TO service_role;
SET search_path = academia, pg_catalog;

CREATE TABLE academia."people" (
  "id" text NOT NULL,
  "identity" text,
  "login_email" text NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "ra" text NOT NULL,
  "role" text NOT NULL DEFAULT 'student',
  "active" integer NOT NULL DEFAULT 1,
  "photo" text NOT NULL DEFAULT '',
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "people_ra_unique" ON academia."people" ("ra");
CREATE UNIQUE INDEX "people_login_email_unique" ON academia."people" ("login_email");
CREATE UNIQUE INDEX "people_identity_unique" ON academia."people" ("identity");
ALTER TABLE academia."people" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."people" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."people" TO service_role;

CREATE TABLE academia."courses" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "level" text NOT NULL DEFAULT 'Básico',
  "folder" text NOT NULL DEFAULT 'Cyber',
  "published" integer NOT NULL DEFAULT 0,
  "sort" integer NOT NULL DEFAULT 0,
  "body" text NOT NULL DEFAULT '[]',
  "updated" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."courses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."courses" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."courses" TO service_role;

CREATE TABLE academia."enrollments" (
  "user" text NOT NULL,
  "course" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("user", "course"),
  FOREIGN KEY ("course") REFERENCES academia."courses" ("id"),
  FOREIGN KEY ("user") REFERENCES academia."people" ("id")
);
ALTER TABLE academia."enrollments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."enrollments" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."enrollments" TO service_role;

CREATE TABLE academia."progress" (
  "user" text NOT NULL,
  "course" text NOT NULL,
  "lesson" text NOT NULL,
  "position" integer NOT NULL DEFAULT 0,
  "done" integer NOT NULL DEFAULT 0,
  "score" integer,
  "updated" text NOT NULL,
  PRIMARY KEY ("user", "course", "lesson")
);
ALTER TABLE academia."progress" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."progress" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."progress" TO service_role;

CREATE TABLE academia."assets" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "course" text NOT NULL DEFAULT '',
  "scope" text NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "size" integer NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."assets" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."assets" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."assets" TO service_role;

CREATE TABLE academia."messages" (
  "id" text NOT NULL,
  "course" text NOT NULL,
  "user" text NOT NULL,
  "parent" text NOT NULL DEFAULT '',
  "text" text NOT NULL DEFAULT '',
  "asset" text NOT NULL DEFAULT '',
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."messages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."messages" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."messages" TO service_role;

CREATE TABLE academia."topics" (
  "id" text NOT NULL,
  "course" text NOT NULL,
  "user" text NOT NULL,
  "title" text NOT NULL,
  "pinned" integer NOT NULL DEFAULT 0,
  "closed" integer NOT NULL DEFAULT 0,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."topics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."topics" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."topics" TO service_role;

CREATE TABLE academia."message_topics" (
  "message" text NOT NULL,
  "topic" text NOT NULL,
  PRIMARY KEY ("message")
);
ALTER TABLE academia."message_topics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."message_topics" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."message_topics" TO service_role;

CREATE TABLE academia."moderation" (
  "message" text NOT NULL,
  "hidden" integer NOT NULL DEFAULT 1,
  "reason" text NOT NULL,
  "user" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("message")
);
ALTER TABLE academia."moderation" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."moderation" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."moderation" TO service_role;

CREATE TABLE academia."forum_reports" (
  "id" text NOT NULL,
  "message" text NOT NULL,
  "course" text NOT NULL,
  "user" text NOT NULL,
  "reason" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open',
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "report_per_person" ON academia."forum_reports" ("user", "message");
ALTER TABLE academia."forum_reports" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."forum_reports" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."forum_reports" TO service_role;

CREATE TABLE academia."tickets" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "teacher" text NOT NULL DEFAULT '',
  "course" text NOT NULL,
  "subject" text NOT NULL,
  "status" text NOT NULL DEFAULT 'open',
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."tickets" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."tickets" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."tickets" TO service_role;

CREATE TABLE academia."replies" (
  "id" text NOT NULL,
  "ticket" text NOT NULL,
  "user" text NOT NULL,
  "text" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."replies" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."replies" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."replies" TO service_role;

CREATE TABLE academia."notifications" (
  "id" text NOT NULL,
  "user" text NOT NULL DEFAULT '',
  "course" text NOT NULL DEFAULT '',
  "title" text NOT NULL,
  "text" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."notifications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."notifications" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."notifications" TO service_role;

CREATE TABLE academia."reads" (
  "user" text NOT NULL,
  "notice" text NOT NULL,
  PRIMARY KEY ("user", "notice")
);
ALTER TABLE academia."reads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."reads" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."reads" TO service_role;

CREATE TABLE academia."certificates" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "course" text NOT NULL,
  "module" text NOT NULL,
  "snapshot" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "certificate_once" ON academia."certificates" ("user", "course", "module");
ALTER TABLE academia."certificates" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."certificates" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."certificates" TO service_role;

CREATE TABLE academia."settings" (
  "key" text NOT NULL,
  "value" text NOT NULL,
  PRIMARY KEY ("key")
);
ALTER TABLE academia."settings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."settings" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."settings" TO service_role;

CREATE TABLE academia."audit" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "action" text NOT NULL,
  "target" text NOT NULL,
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."audit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."audit" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."audit" TO service_role;

CREATE TABLE academia."tutor" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "course" text NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "needs_teacher" integer NOT NULL DEFAULT 0,
  "sources" text NOT NULL DEFAULT '[]',
  "ticket" text NOT NULL DEFAULT '',
  "created" text NOT NULL,
  PRIMARY KEY ("id")
);
ALTER TABLE academia."tutor" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."tutor" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."tutor" TO service_role;

CREATE TABLE academia."auth_profiles" (
  "user" text NOT NULL,
  "company" text NOT NULL DEFAULT '',
  "account_type" text NOT NULL DEFAULT 'student',
  PRIMARY KEY ("user"),
  FOREIGN KEY ("user") REFERENCES academia."people" ("id")
);
ALTER TABLE academia."auth_profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."auth_profiles" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."auth_profiles" TO service_role;

CREATE TABLE academia."auth_passwords" (
  "user" text NOT NULL,
  "salt" text NOT NULL,
  "password_hash" text NOT NULL,
  "must_change" integer NOT NULL DEFAULT 0,
  "updated" text NOT NULL,
  PRIMARY KEY ("user"),
  FOREIGN KEY ("user") REFERENCES academia."people" ("id")
);
ALTER TABLE academia."auth_passwords" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."auth_passwords" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."auth_passwords" TO service_role;

CREATE TABLE academia."auth_sessions" (
  "token_hash" text NOT NULL,
  "user" text NOT NULL,
  "expires" bigint NOT NULL,
  "created" text NOT NULL,
  "version" text NOT NULL,
  PRIMARY KEY ("token_hash"),
  FOREIGN KEY ("user") REFERENCES academia."people" ("id")
);
CREATE INDEX "auth_sessions_user" ON academia."auth_sessions" ("user");
ALTER TABLE academia."auth_sessions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."auth_sessions" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."auth_sessions" TO service_role;

CREATE TABLE academia."auth_limits" (
  "key" text NOT NULL,
  "count" integer NOT NULL,
  "started" bigint NOT NULL,
  PRIMARY KEY ("key")
);
ALTER TABLE academia."auth_limits" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."auth_limits" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."auth_limits" TO service_role;

CREATE TABLE academia."auth_email_challenges" (
  "id" text NOT NULL,
  "user" text NOT NULL,
  "salt" text NOT NULL,
  "password_hash" text NOT NULL,
  "expires" bigint NOT NULL,
  "consumed" integer NOT NULL DEFAULT 0,
  "created" text NOT NULL,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("user") REFERENCES academia."people" ("id")
);
CREATE INDEX "auth_email_user" ON academia."auth_email_challenges" ("user", "expires");
ALTER TABLE academia."auth_email_challenges" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia."auth_email_challenges" FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academia."auth_email_challenges" TO service_role;

CREATE INDEX "enrollments_course_idx" ON academia."enrollments" ("course");
CREATE INDEX "progress_course_idx" ON academia."progress" ("course");
CREATE INDEX "messages_course_created_idx" ON academia."messages" ("course", "created");
CREATE INDEX "topics_course_idx" ON academia."topics" ("course");
CREATE INDEX "reports_status_created_idx" ON academia."forum_reports" ("status", "created");
CREATE INDEX "notifications_user_created_idx" ON academia."notifications" ("user", "created");
CREATE INDEX "replies_ticket_idx" ON academia."replies" ("ticket");
CREATE INDEX "tickets_user_idx" ON academia."tickets" ("user");
CREATE INDEX "auth_sessions_user_idx" ON academia."auth_sessions" ("user");
CREATE INDEX "auth_challenges_user_expiry_idx" ON academia."auth_email_challenges" ("user", "expires");
RESET search_path;
