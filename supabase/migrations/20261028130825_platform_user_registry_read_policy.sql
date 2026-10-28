-- Keep the private registry unavailable to regular API roles.
-- The service role is the only application role permitted to read administrative user records.
create policy usuarios_plataforma_service_role_read
on academia.usuarios_plataforma
for select
to service_role
using (true);
