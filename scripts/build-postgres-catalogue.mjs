import ts from 'typescript';
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeSql,postgresSql} from '../lib/postgres-sql.mjs';
const roots=[process.cwd(),...process.argv.slice(2)],queries=new Set();
const tables=['people','courses','enrollments','progress','assets','messages','topics','message_topics','moderation','forum_reports','tickets','replies','notifications','reads','certificates','settings','audit','tutor','auth_profiles','auth_passwords','auth_sessions','auth_limits','auth_email_challenges','auth_totp','auth_totp_challenges','auth_email_events'];
for(const root of roots){for(const name of ['lms','password-auth','registration','course-availability','database-export','basic-content-sync']){
 const path=root+'/lib/'+name+'.mjs';if(!existsSync(path))continue;
 const tree=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),variables=new Map();
 function index(n){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.initializer)variables.set(n.name.text,n.initializer);ts.forEachChild(n,index)}index(tree);
 function values(n,depth=0){if(!n||depth>10)return [];
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))return [n.text];
  if(ts.isParenthesizedExpression(n))return values(n.expression,depth+1);
  if(ts.isIdentifier(n))return n.text==='name'?tables:values(variables.get(n.text),depth+1);
  if(ts.isConditionalExpression(n))return [...values(n.whenTrue,depth+1),...values(n.whenFalse,depth+1)];
  if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.PlusToken)return values(n.left,depth+1).flatMap(a=>values(n.right,depth+1).map(b=>a+b));
  if(ts.isTemplateExpression(n)){let out=[n.head.text];for(const span of n.templateSpans)out=out.flatMap(a=>values(span.expression,depth+1).map(b=>a+b+span.literal.text));return out}
  return [];
 }
 function visit(n){if(ts.isCallExpression(n)){
  let argument;if(ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text==='prepare')argument=n.arguments[0];
  if(ts.isIdentifier(n.expression)&&['run','row','one','all'].includes(n.expression.text))argument=n.arguments[1];
  for(const q of values(argument))if(/^(SELECT|INSERT|UPDATE|DELETE)\b/i.test(q.trim()))queries.add(normalizeSql(q));
 }ts.forEachChild(n,visit)}visit(tree);
}}
// Keep the published authenticator operations during the coordinated switch to email MFA.
// This explicit allowlist can be retired only after no deployed version needs these queries.
for(const query of JSON.parse(readFileSync(new URL('../lib/postgres-compatibility.json',import.meta.url),'utf8')))queries.add(normalizeSql(query));
const catalogue=[...queries].sort().map(sqlite=>({id:createHash('sha256').update(sqlite).digest('hex'),sqlite,...postgresSql(sqlite)}));
writeFileSync('lib/postgres-catalogue.json',JSON.stringify(catalogue,null,2)+'\n');
console.log('Registered '+catalogue.length+' exact SQL statements.');
const entries=Object.fromEntries(catalogue.map(({id,sql,arity,registration})=>[id,{sql,arity,registration}]));
const gateway=`-- Fixed-query server-only gateway; no arbitrary SQL input and no SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public.academia_backend_batch(statements jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER
SET search_path = academia, pg_catalog SET statement_timeout = '20s'
AS $fn$
DECLARE
 catalogue constant jsonb := $catalog$${JSON.stringify(entries)}$catalog$::jsonb;
 item jsonb; operation jsonb; parameters text[]; result jsonb; output jsonb := '[]'::jsonb;
BEGIN
 IF jsonb_typeof(statements) <> 'array' OR jsonb_array_length(statements)<1 OR jsonb_array_length(statements)>500 THEN RAISE EXCEPTION 'Invalid batch'; END IF;
 -- Serialize academy gateway operations, including RA allocation and backup snapshots.
 PERFORM pg_advisory_xact_lock(187412735,1);
 FOR item IN SELECT value FROM jsonb_array_elements(statements) LOOP
  operation := catalogue -> (item->>'query');
  IF operation IS NULL OR jsonb_typeof(item->'params') IS DISTINCT FROM 'array' OR jsonb_array_length(item->'params') <> (operation->>'arity')::integer THEN RAISE EXCEPTION 'Unknown operation or invalid parameters'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(item->'params') p WHERE jsonb_typeof(p) NOT IN ('null','string','number','boolean')) THEN RAISE EXCEPTION 'Invalid parameter type'; END IF;
  SELECT array_agg(value ORDER BY ordinal) INTO parameters FROM jsonb_array_elements_text(item->'params') WITH ORDINALITY AS p(value,ordinal);
  IF (operation->>'registration')::boolean THEN
   parameters[12] := '^' || replace(parameters[12],'[0-9]*','[0-9]+$');
  END IF;
  EXECUTE format(operation->>'sql',VARIADIC COALESCE(parameters,ARRAY[]::text[])) INTO result;
  output := output || jsonb_build_array(jsonb_build_object('success',true,'results',result->'results','meta',jsonb_build_object('changes',(result->>'changes')::integer)));
 END LOOP;
 RETURN output;
END;
$fn$;
REVOKE ALL ON FUNCTION public.academia_backend_batch(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.academia_backend_batch(jsonb) TO service_role;
NOTIFY pgrst, 'reload schema';
`;
writeFileSync('supabase/backend-rpc.sql',gateway);
