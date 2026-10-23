-- Reserve the three requested RAs by login email. Keep other valid sequential
-- RAs; replace legacy values or reserved-number collisions above the current max.
CREATE TABLE __registration_mapping (id TEXT PRIMARY KEY, ra TEXT NOT NULL);
--> statement-breakpoint
INSERT INTO __registration_mapping
WITH ranked AS (
 SELECT id, ROW_NUMBER() OVER (ORDER BY created,id) AS position
 FROM people
 WHERE lower(login_email) NOT IN ('elizeu.santos@bugbusters.com.br','guilherme.arakaki@bugbusters.com.br','osmar.cabral@bugbusters.com.br')
 AND NOT (ra GLOB 'AC-2026-[0-9][0-9][0-9][0-9]*' AND substr(ra,9) NOT GLOB '*[^0-9]*' AND CAST(substr(ra,9) AS INTEGER)>3)
), maximum AS (
 SELECT MAX(3,COALESCE(MAX(CAST(substr(ra,9) AS INTEGER)),0)) AS value FROM people
 WHERE ra GLOB 'AC-2026-[0-9]*' AND substr(ra,9) NOT GLOB '*[^0-9]*'
)
SELECT id, 'AC-2026-' || printf('%04d',maximum.value+ranked.position) FROM ranked CROSS JOIN maximum
UNION ALL
SELECT id, CASE lower(login_email)
 WHEN 'elizeu.santos@bugbusters.com.br' THEN 'AC-2026-0001'
 WHEN 'guilherme.arakaki@bugbusters.com.br' THEN 'AC-2026-0002'
 WHEN 'osmar.cabral@bugbusters.com.br' THEN 'AC-2026-0003' END
FROM people WHERE lower(login_email) IN ('elizeu.santos@bugbusters.com.br','guilherme.arakaki@bugbusters.com.br','osmar.cabral@bugbusters.com.br');
--> statement-breakpoint
-- Free old numbers first, including swaps between the reserved accounts.
UPDATE people SET ra='__registration_migration__' || id WHERE id IN (SELECT id FROM __registration_mapping);
--> statement-breakpoint
UPDATE people SET ra=(SELECT ra FROM __registration_mapping WHERE id=people.id) WHERE id IN (SELECT id FROM __registration_mapping);
--> statement-breakpoint
DROP TABLE __registration_mapping;
