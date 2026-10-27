-- Only confirmed login emails receive the reserved RAs. Preserve certificate snapshots.
INSERT OR IGNORE INTO settings(key,value)
SELECT 'backup:confirmed-ras:2026-10-26',json_group_array(json_object('id',id,'login_email',login_email,'ra',ra)) FROM people;
--> statement-breakpoint
CREATE TABLE __confirmed_ra (email TEXT PRIMARY KEY, ra TEXT NOT NULL UNIQUE);
--> statement-breakpoint
INSERT INTO __confirmed_ra VALUES
('elizeu.santos@bugbusters.com.br','AC-2026-0001'),
('guilherme.arakaki@bugbusters.com.br','AC-2026-0002'),
('osmar.cabral@bugbusters.com.br','AC-2026-0003'),
('alisson.pereira@bugbusters.com.br','AC-2026-0004'),
('erik.reis@bugbusters.com.br','AC-2026-0005'),
('bruna.oliveira@bugbusters.com.br','AC-2026-0006');
--> statement-breakpoint
CREATE TABLE __confirmed_ra_guard (valid INTEGER CHECK(valid=1));
--> statement-breakpoint
INSERT INTO __confirmed_ra_guard SELECT CASE WHEN
 EXISTS(SELECT 1 FROM people p JOIN __confirmed_ra r ON p.ra=r.ra WHERE lower(p.login_email) NOT IN (SELECT email FROM __confirmed_ra)) OR
 EXISTS(SELECT lower(login_email) FROM people WHERE lower(login_email) IN (SELECT email FROM __confirmed_ra) GROUP BY lower(login_email) HAVING count(*)>1)
THEN 0 ELSE 1 END;
--> statement-breakpoint
UPDATE people SET ra='__confirmed_ra__'||id WHERE lower(login_email) IN (SELECT email FROM __confirmed_ra);
--> statement-breakpoint
UPDATE people SET ra=(SELECT ra FROM __confirmed_ra WHERE email=lower(people.login_email)) WHERE lower(login_email) IN (SELECT email FROM __confirmed_ra);
--> statement-breakpoint
DROP TABLE __confirmed_ra_guard;
--> statement-breakpoint
DROP TABLE __confirmed_ra;
