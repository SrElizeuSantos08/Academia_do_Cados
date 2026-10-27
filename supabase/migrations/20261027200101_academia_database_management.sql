-- Relational integrity and access-control metadata for Academia do Caos.
-- The private academia schema remains available to the application service only.

CREATE TABLE IF NOT EXISTS academia.data_migration_runs (
  id text PRIMARY KEY,
  source text NOT NULL,
  status text NOT NULL CHECK (status IN ('running', 'partial', 'complete', 'failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  table_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  pending_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT ''
);
ALTER TABLE academia.data_migration_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia.data_migration_runs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE academia.data_migration_runs TO service_role;
CREATE POLICY academia_service_role_all ON academia.data_migration_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Real relationships used by the application. Empty-string optional links
-- remain nullable-by-convention and are intentionally not forced into FKs.
ALTER TABLE academia.progress
  ADD CONSTRAINT progress_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT progress_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);
ALTER TABLE academia.assets
  ADD CONSTRAINT assets_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id);
ALTER TABLE academia.messages
  ADD CONSTRAINT messages_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT messages_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);
ALTER TABLE academia.topics
  ADD CONSTRAINT topics_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT topics_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);
ALTER TABLE academia.message_topics
  ADD CONSTRAINT message_topics_message_fkey FOREIGN KEY (message) REFERENCES academia.messages(id),
  ADD CONSTRAINT message_topics_topic_fkey FOREIGN KEY (topic) REFERENCES academia.topics(id);
ALTER TABLE academia.moderation
  ADD CONSTRAINT moderation_message_fkey FOREIGN KEY (message) REFERENCES academia.messages(id),
  ADD CONSTRAINT moderation_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id);
ALTER TABLE academia.forum_reports
  ADD CONSTRAINT forum_reports_message_fkey FOREIGN KEY (message) REFERENCES academia.messages(id),
  ADD CONSTRAINT forum_reports_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id),
  ADD CONSTRAINT forum_reports_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id);
ALTER TABLE academia.tickets
  ADD CONSTRAINT tickets_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT tickets_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);
ALTER TABLE academia.replies
  ADD CONSTRAINT replies_ticket_fkey FOREIGN KEY (ticket) REFERENCES academia.tickets(id),
  ADD CONSTRAINT replies_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id);
ALTER TABLE academia.reads
  ADD CONSTRAINT reads_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT reads_notice_fkey FOREIGN KEY (notice) REFERENCES academia.notifications(id);
ALTER TABLE academia.certificates
  ADD CONSTRAINT certificates_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT certificates_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);
ALTER TABLE academia.audit
  ADD CONSTRAINT audit_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id);
ALTER TABLE academia.tutor
  ADD CONSTRAINT tutor_user_fkey FOREIGN KEY ("user") REFERENCES academia.people(id),
  ADD CONSTRAINT tutor_course_fkey FOREIGN KEY (course) REFERENCES academia.courses(id);

-- Preserve the application's string API while constraining known domains.
ALTER TABLE academia.people
  ADD CONSTRAINT people_role_check CHECK (role IN ('admin','teacher','student')),
  ADD CONSTRAINT people_active_check CHECK (active IN (0,1));
ALTER TABLE academia.auth_profiles
  ADD CONSTRAINT auth_profiles_account_type_check CHECK (account_type IN ('student','company'));
ALTER TABLE academia.courses
  ADD CONSTRAINT courses_published_check CHECK (published IN (0,1));
ALTER TABLE academia.progress
  ADD CONSTRAINT progress_done_check CHECK (done IN (0,1)),
  ADD CONSTRAINT progress_position_check CHECK (position >= 0);
ALTER TABLE academia.forum_reports
  ADD CONSTRAINT forum_reports_status_check CHECK (status IN ('open','closed'));

-- Query paths from the live application and supporting FK lookups.
CREATE INDEX IF NOT EXISTS courses_folder_sort_id_idx ON academia.courses (folder, sort, id);
CREATE INDEX IF NOT EXISTS assets_user_idx ON academia.assets ("user");
CREATE INDEX IF NOT EXISTS messages_user_created_idx ON academia.messages ("user", created DESC);
CREATE INDEX IF NOT EXISTS topics_user_created_idx ON academia.topics ("user", created DESC);
CREATE INDEX IF NOT EXISTS message_topics_topic_idx ON academia.message_topics (topic);
CREATE INDEX IF NOT EXISTS moderation_user_idx ON academia.moderation ("user");
CREATE INDEX IF NOT EXISTS forum_reports_message_idx ON academia.forum_reports (message);
CREATE INDEX IF NOT EXISTS tickets_course_idx ON academia.tickets (course);
CREATE INDEX IF NOT EXISTS replies_user_created_idx ON academia.replies ("user", created);
CREATE INDEX IF NOT EXISTS reads_notice_idx ON academia.reads (notice);
CREATE INDEX IF NOT EXISTS audit_created_idx ON academia.audit (created DESC);
CREATE INDEX IF NOT EXISTS audit_user_created_idx ON academia.audit ("user", created DESC);
CREATE INDEX IF NOT EXISTS tutor_user_created_idx ON academia.tutor ("user", created DESC);
CREATE INDEX IF NOT EXISTS tutor_course_idx ON academia.tutor (course);

-- Defense in depth: the only table role with grants in this private schema is
-- service_role. No policy is granted to anon or authenticated users.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'people','courses','enrollments','progress','assets','messages','topics',
    'message_topics','moderation','forum_reports','tickets','replies',
    'notifications','reads','certificates','settings','audit','tutor',
    'auth_profiles','auth_passwords','auth_sessions','auth_limits',
    'auth_email_challenges','site_updates'
  ] LOOP
    EXECUTE format('CREATE POLICY academia_service_role_all ON academia.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END;
$$;
