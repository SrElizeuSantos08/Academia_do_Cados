-- Repair the confirmed administrative registration that missed its default enrollment.
-- Existing access, learning history and certificates remain untouched.
INSERT OR IGNORE INTO enrollments (user,course,created)
SELECT p.id,c.id,strftime('%Y-%m-%dT%H:%M:%fZ','now')
FROM people p JOIN courses c ON c.id='cyber-pilot'
WHERE p.id='6c366622-a940-4dcf-b824-8e7cad90d674'
  AND p.login_email='guilherme.gkarakaki@gmail.com'
  AND p.role='student' AND p.active=1 AND c.published=1
  AND NOT EXISTS (SELECT 1 FROM settings s WHERE s.key='course:'||c.id||':development' AND s.value='on');
