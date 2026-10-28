-- Administrative user registry with automatic synchronization from the platform's source tables.
-- Credentials remain in academia.auth_passwords as salted hashes; this registry stores no password material.

create table academia.usuarios_plataforma (
  usuario_id text primary key,
  nome text not null,
  email_login text not null,
  email_contato text not null,
  ra text not null,
  cargo text not null,
  ativo boolean not null default false,
  foto text not null default '',
  cadastrado_em text not null,
  empresa text,
  tipo_conta text,
  senha_configurada boolean not null default false,
  exige_troca_senha boolean,
  senha_atualizada_em text,
  sincronizado_em timestamptz not null default now()
);

comment on table academia.usuarios_plataforma is
  'Registro administrativo sincronizado de usuários da plataforma. Não armazena senha, salt nem hash.';
comment on column academia.usuarios_plataforma.senha_configurada is
  'Indica apenas se existe credencial configurada; nunca contém senha ou hash.';

create unique index usuarios_plataforma_email_login_uidx
  on academia.usuarios_plataforma (email_login);
create unique index usuarios_plataforma_ra_uidx
  on academia.usuarios_plataforma (ra);
create index usuarios_plataforma_cargo_ativo_idx
  on academia.usuarios_plataforma (cargo, ativo);

alter table academia.usuarios_plataforma enable row level security;
revoke all on academia.usuarios_plataforma from public, anon, authenticated;
grant select on academia.usuarios_plataforma to service_role;

create or replace function academia.sincronizar_usuario_plataforma(p_usuario_id text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, academia
as $function$
begin
  insert into academia.usuarios_plataforma (
    usuario_id, nome, email_login, email_contato, ra, cargo, ativo, foto,
    cadastrado_em, empresa, tipo_conta, senha_configurada,
    exige_troca_senha, senha_atualizada_em, sincronizado_em
  )
  select
    p.id,
    p.name,
    p.login_email,
    p.email,
    p.ra,
    p.role,
    p.active = 1,
    coalesce(p.photo, ''),
    p.created,
    nullif(ap.company, ''),
    nullif(ap.account_type, ''),
    coalesce(a.password_hash <> '' and a.salt <> '', false),
    case when a."user" is null then null else a.must_change = 1 end,
    a.updated,
    now()
  from academia.people p
  left join academia.auth_profiles ap on ap."user" = p.id
  left join academia.auth_passwords a on a."user" = p.id
  where p.id = p_usuario_id
  on conflict (usuario_id) do update set
    nome = excluded.nome,
    email_login = excluded.email_login,
    email_contato = excluded.email_contato,
    ra = excluded.ra,
    cargo = excluded.cargo,
    ativo = excluded.ativo,
    foto = excluded.foto,
    cadastrado_em = excluded.cadastrado_em,
    empresa = excluded.empresa,
    tipo_conta = excluded.tipo_conta,
    senha_configurada = excluded.senha_configurada,
    exige_troca_senha = excluded.exige_troca_senha,
    senha_atualizada_em = excluded.senha_atualizada_em,
    sincronizado_em = now();
end;
$function$;

create or replace function academia.sincronizar_usuario_plataforma_trigger()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, academia
as $function$
declare
  v_usuario_id text;
begin
  if tg_table_name = 'people' then
    v_usuario_id := case when tg_op = 'DELETE' then old.id else new.id end;
    if tg_op = 'DELETE' then
      delete from academia.usuarios_plataforma where usuario_id = v_usuario_id;
      return old;
    end if;
  else
    v_usuario_id := case
      when tg_op = 'DELETE' then to_jsonb(old)->>'user'
      else to_jsonb(new)->>'user'
    end;
  end if;

  perform academia.sincronizar_usuario_plataforma(v_usuario_id);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function academia.sincronizar_usuario_plataforma(text) from public, anon, authenticated, service_role;
revoke all on function academia.sincronizar_usuario_plataforma_trigger() from public, anon, authenticated, service_role;

create trigger usuarios_plataforma_sync_people
  after insert or update or delete on academia.people
  for each row execute function academia.sincronizar_usuario_plataforma_trigger();
create trigger usuarios_plataforma_sync_auth_profiles
  after insert or update or delete on academia.auth_profiles
  for each row execute function academia.sincronizar_usuario_plataforma_trigger();
create trigger usuarios_plataforma_sync_auth_passwords
  after insert or update or delete on academia.auth_passwords
  for each row execute function academia.sincronizar_usuario_plataforma_trigger();

do $backfill$
declare
  v_usuario_id text;
begin
  for v_usuario_id in select id from academia.people loop
    perform academia.sincronizar_usuario_plataforma(v_usuario_id);
  end loop;
end;
$backfill$;
