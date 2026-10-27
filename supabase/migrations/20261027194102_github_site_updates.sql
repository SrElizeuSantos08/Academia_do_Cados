-- Records authenticated pushes to the platform repository. No personal student data is copied here.
CREATE TABLE IF NOT EXISTS academia.site_updates (
  repository text NOT NULL,
  commit_sha text NOT NULL CHECK (commit_sha ~ '^[0-9a-f]{40}$'),
  git_ref text NOT NULL CHECK (git_ref = 'refs/heads/main'),
  commit_message text NOT NULL,
  actor text NOT NULL,
  committed_at timestamptz NOT NULL,
  workflow_run_id bigint NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (repository, commit_sha),
  CHECK (repository = 'SrElizeuSantos08/Academia_do_Cados')
);

ALTER TABLE academia.site_updates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE academia.site_updates FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE academia.site_updates TO service_role;

CREATE OR REPLACE FUNCTION public.log_github_site_update(
  p_repository text,
  p_commit_sha text,
  p_git_ref text,
  p_commit_message text,
  p_actor text,
  p_committed_at timestamptz,
  p_workflow_run_id bigint
) RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  IF p_repository <> 'SrElizeuSantos08/Academia_do_Cados'
     OR p_git_ref <> 'refs/heads/main'
     OR p_commit_sha !~ '^[0-9a-f]{40}$'
     OR p_workflow_run_id IS NULL THEN
    RAISE EXCEPTION 'Invalid site update';
  END IF;

  INSERT INTO academia.site_updates (
    repository, commit_sha, git_ref, commit_message, actor, committed_at, workflow_run_id
  ) VALUES (
    p_repository, p_commit_sha, p_git_ref, left(p_commit_message, 20000), p_actor, p_committed_at, p_workflow_run_id
  )
  ON CONFLICT (repository, commit_sha) DO UPDATE SET
    git_ref = EXCLUDED.git_ref,
    commit_message = EXCLUDED.commit_message,
    actor = EXCLUDED.actor,
    committed_at = EXCLUDED.committed_at,
    workflow_run_id = EXCLUDED.workflow_run_id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_github_site_update(text,text,text,text,text,timestamptz,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_github_site_update(text,text,text,text,text,timestamptz,bigint) TO service_role;
