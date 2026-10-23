-- Assign confirmed users by login; preserve IDs, roles and learning history.
CREATE TABLE __assigned_registration (id TEXT PRIMARY KEY, ra TEXT NOT NULL);
--> statement-breakpoint
INSERT INTO __assigned_registration
WITH requested AS (
 SELECT id, CASE lower(login_email)
 WHEN 'elizeu.santos@bugbusters.com.br' THEN 'AC-2026-0001'
 WHEN 'elizeu.santos@jamaicamangueiras.com.br' THEN 'AC-2026-0001'
 WHEN 'guilherme.arakaki@bugbusters.com.br' THEN 'AC-2026-0002'
 WHEN 'osmar.cabral@bugbusters.com.br' THEN 'AC-2026-0003'
 WHEN 'alisson.pereira@bugbusters.com.br' THEN 'AC-2026-0004'
 WHEN 'erik.reis@bugbusters.com.br' THEN 'AC-2026-0005'
 WHEN 'bruna.oliveira@bugbusters.com.br' THEN 'AC-2026-0006' END AS ra FROM people
 WHERE lower(login_email) IN ('elizeu.santos@bugbusters.com.br','elizeu.santos@jamaicamangueiras.com.br','guilherme.arakaki@bugbusters.com.br','osmar.cabral@bugbusters.com.br','alisson.pereira@bugbusters.com.br','erik.reis@bugbusters.com.br','bruna.oliveira@bugbusters.com.br')
), displaced AS (
 SELECT id, ROW_NUMBER() OVER (ORDER BY created,id) AS position FROM people
 WHERE ra IN ('AC-2026-0001','AC-2026-0002','AC-2026-0003','AC-2026-0004','AC-2026-0005','AC-2026-0006')
 AND id NOT IN (SELECT id FROM requested)
), maximum AS (
 SELECT MAX(6,COALESCE(MAX(CAST(substr(ra,9) AS INTEGER)),0)) AS value FROM people
 WHERE ra GLOB 'AC-2026-[0-9]*' AND substr(ra,9) NOT GLOB '*[^0-9]*'
)
SELECT id,ra FROM requested
UNION ALL SELECT displaced.id,'AC-2026-' || printf('%04d',maximum.value+displaced.position) FROM displaced CROSS JOIN maximum;
--> statement-breakpoint
UPDATE people SET ra='__assigned_ra__' || id WHERE id IN (SELECT id FROM __assigned_registration);
--> statement-breakpoint
UPDATE people SET ra=(SELECT ra FROM __assigned_registration WHERE id=people.id) WHERE id IN (SELECT id FROM __assigned_registration);
--> statement-breakpoint
DROP TABLE __assigned_registration;
