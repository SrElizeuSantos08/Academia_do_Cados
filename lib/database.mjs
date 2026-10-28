import catalogue from './postgres-catalogue.json' with {type:'json'};
import {normalizeSql} from './postgres-sql.mjs';
const queries=new Map(catalogue.map(q=>[q.sqlite,q]));
function unavailable(stage='payload',reason='INVALID_REQUEST',providerStatus){const error=new Error('Banco de dados temporariamente indisponível.');error.status=503;error.code='DATABASE_UNAVAILABLE';error.databaseStage=stage;error.databaseReason=reason;if(providerStatus)error.providerStatus=providerStatus;return error}
export function databaseConfiguration(env){
  const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  return {urlValid:/^https:\/\/[a-z0-9]{20}\.supabase\.co$/.test(url),keyPresent:typeof key==='string'&&!!key.trim(),keyType:typeof key!=='string'||!key?'missing':key.startsWith('sb_secret_')?'secret':key.startsWith('sb_publishable_')?'publishable':key.startsWith('eyJ')?'legacy-jwt':'unknown',keyContainsLineBreaks:typeof key==='string'&&/[\r\n]/.test(key)};
}

export class SupabaseDatabase {
  constructor(env,transport=globalThis.fetch){
    const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
    const key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
    const config=databaseConfiguration(env);
    if(!config.urlValid)throw unavailable('configuration','INVALID_URL');
    if(!config.keyPresent)throw unavailable('configuration','MISSING_KEY');
    if(config.keyContainsLineBreaks)throw unavailable('configuration','INVALID_KEY_FORMAT');
    if(config.keyType==='publishable')throw unavailable('configuration','PUBLIC_KEY_REJECTED');
    this.provider='supabase';this.url=url+'/rest/v1/rpc/academia_backend_batch';
    this.headers={'Content-Type':'application/json',apikey:key,...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})};
    // Native Workers fetch requires its global receiver, even when stored on an adapter.
    this.transport=transport.bind(globalThis);
  }
  prepare(sql){
    const query=queries.get(normalizeSql(sql));
    if(!query)throw unavailable('catalogue','QUERY_NOT_REGISTERED');
    return new Statement(this,query);
  }
  async batch(statements){
    if(!Array.isArray(statements)||!statements.length||statements.length>500)throw unavailable();
    const payload=statements.map(s=>{
      if(!(s instanceof Statement)||s.db!==this||s.params.length!==s.query.arity||s.params.some(v=>v!==null&&!['string','number','boolean'].includes(typeof v)||typeof v==='number'&&!Number.isFinite(v)))throw unavailable();
      return {query:s.query.id,params:s.params};
    });
    let response;
    try{response=await this.transport(this.url,{method:'POST',redirect:'manual',headers:this.headers,signal:AbortSignal.timeout(25000),body:JSON.stringify({statements:payload})})}catch(error){throw unavailable('transport',['AbortError','TimeoutError'].includes(error?.name)?'TIMEOUT':'REQUEST_FAILED')}
    // Do not retry writes: the database may already have committed after a timeout.
    if(!response.ok)throw unavailable('provider','REQUEST_REJECTED',response.status);
    const data=await response.json().catch(()=>null);
    if(!Array.isArray(data)||data.length!==payload.length||data.some(r=>r?.success!==true||!Array.isArray(r.results)||!Number.isSafeInteger(r.meta?.changes)||r.meta.changes<0))throw unavailable('protocol','INVALID_RESPONSE');
    return data;
  }
}
class Statement {
  constructor(db,query,params=[]){this.db=db;this.query=query;this.params=params}
  bind(...params){return new Statement(this.db,this.query,params)}
  async all(){return (await this.db.batch([this]))[0]}
  async run(){return this.all()}
  async first(column){const row=(await this.all()).results[0]||null;return column?row?.[column]??null:row}
}
export function databaseEnv(env){
  const provider=env.ACADEMY_DATABASE_PROVIDER||'d1';
  if(provider==='d1')return env;
  if(provider!=='supabase')throw unavailable();
  return env.DB?.provider==='supabase'?env:{...env,DB:new SupabaseDatabase(env)};
}
