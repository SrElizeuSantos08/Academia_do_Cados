// Build-time SQL conversion for the academy's finite query catalogue.
// No user-supplied SQL is executed; runtime requests only carry catalogue IDs.
export function tokens(sql) {
  return sql.match(/'(?:''|[^'])*'|"(?:""|[^"])*"|[A-Za-z_][A-Za-z_0-9]*|\?|\s+|./gs) || [];
}
export const normalizeSql = sql => tokens(sql).map(t => /^\s+$/.test(t) ? ' ' : t).join('').trim();
export function postgresSql(input) {
  const source=normalizeSql(input), ignore=/^INSERT OR IGNORE /i.test(source);
  if(!/^(SELECT|INSERT|UPDATE|DELETE)\b/i.test(source))throw Error('Unsupported statement');
  let sql=source.replace(/^INSERT OR IGNORE /i,'INSERT ');
  const registration=/^INSERT .*INTO people\b/i.test(source)&&source.includes('printf(');
  if(registration){
    sql=`INSERT INTO people (id,identity,login_email,email,name,ra,role,active,created)
      SELECT ?,?,?,?,?,COALESCE(?::text,?::text || lpad((GREATEST(?::integer,
      COALESCE(MAX(CAST(substr(ra,9) AS INTEGER)),0))+1)::text,4,'0')),?,?,?
      FROM people WHERE ra ~ ?::text`;
  }
  if(source==="SELECT name FROM sqlite_master WHERE type='table'")
    sql="SELECT table_name AS name FROM information_schema.tables WHERE table_schema='academia' AND table_type='BASE TABLE'";
  if(source==="SELECT name FROM sqlite_master WHERE type='table' AND name='forum_reports'")
    sql="SELECT table_name AS name FROM information_schema.tables WHERE table_schema='academia' AND table_type='BASE TABLE' AND table_name='forum_reports'";
  sql=sql.replace('MAX(progress.done,excluded.done)','GREATEST(progress.done,excluded.done)');
  if(/^INSERT INTO auth_limits\b/i.test(sql))sql=sql.replaceAll('WHEN started<','WHEN auth_limits.started<').replace('ELSE count+1','ELSE auth_limits.count+1').replace('ELSE started END','ELSE auth_limits.started END');
  let arity=0;
  sql=tokens(sql).map(t=>{
    if(t==='?'){arity++;return '%L'}
    if(t.toLowerCase()==='user')return '"user"';
    return t.replaceAll('%','%%');
  }).join('');
  if(ignore)sql+=' ON CONFLICT DO NOTHING';
  const write=!/^SELECT\b/i.test(sql);
  if(write){
    if(!/\bRETURNING\b/i.test(sql))sql+=' RETURNING 1 AS changed';
    sql=`WITH affected AS (${sql}) SELECT jsonb_build_object('results',COALESCE(jsonb_agg(to_jsonb(affected)),'[]'::jsonb),'changes',count(*)) FROM affected`;
  }else sql=`SELECT jsonb_build_object('results',COALESCE(jsonb_agg(to_jsonb(found)),'[]'::jsonb),'changes',0) FROM (${sql}) found`;
  return {sql,arity,write,registration};
}
