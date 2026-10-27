const encoder=new TextEncoder();

function config(env){
 const url=String(env.SUPABASE_URL||'').replace(/\/$/,'');
 const key=String(env.SUPABASE_SERVICE_ROLE_KEY||'');
 if(!url||!key)throw new Error('Supabase runtime is not configured.');
 return {url,key};
}

async function queryHash(sql){
 const digest=await crypto.subtle.digest('SHA-256',encoder.encode(sql));
 return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
}

function scalar(value){
 if(value===undefined||value===null||typeof value==='string'||typeof value==='number'||typeof value==='boolean')return value??null;
 if(value instanceof Uint8Array)return Array.from(value);
 throw new TypeError('Unsupported database parameter type.');
}

async function rpc(env,statements){
 const {url,key}=config(env);
 if(!Array.isArray(statements)||!statements.length||statements.length>500)throw new RangeError('Invalid database batch size.');
 const payload=await Promise.all(statements.map(async statement=>({query:await queryHash(statement.sql),params:statement.params.map(scalar)})));
 let response;
 try{
  response=await fetch(url+'/rest/v1/rpc/academia_backend_batch',{method:'POST',redirect:'manual',headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/json','accept-profile':'public','content-profile':'public'},body:JSON.stringify(payload)});
 }catch{throw new Error('Supabase database request failed.');}
 if(!response.ok)throw new Error(response.status===404?'Supabase database gateway is unavailable.':'Supabase database operation failed.');
 const output=await response.json();
 if(!Array.isArray(output)||output.length!==statements.length||output.some(item=>item?.success!==true))throw new Error('Supabase database returned an invalid response.');
 return output;
}

function statement(env,sql,params=[]){
 return {
  sql,params,
  bind(...values){return statement(env,sql,values)},
  async all(){const [item]=await rpc(env,[{sql,params}]);return {results:Array.isArray(item.results)?item.results:[],success:true,meta:item.meta||{changes:0}}},
  async first(column){const {results}=await this.all();const row=results[0]??null;return column&&row?row[column]??null:row},
  async run(){const [item]=await rpc(env,[{sql,params}]);return {success:true,meta:item.meta||{changes:0}}}
 };
}

export function createSupabaseDatabase(env){
 return {
  prepare(sql){if(typeof sql!=='string'||!sql.trim())throw new TypeError('Invalid SQL statement.');return statement(env,sql)},
  async batch(statements){return rpc(env,statements.map(item=>({sql:item.sql,params:item.params})))},
  async exec(sql){return this.prepare(sql).run()}
 };
}

function storageUrl(env,key){
 const {url}=config(env);
 return url+'/storage/v1/object/academia-assets/'+encodeURIComponent(key);
}
function storageHeaders(env,extra={}){
 const {key}=config(env);
 return {apikey:key,authorization:'Bearer '+key,...extra};
}

export function createSupabaseBucket(env){
 return {
  async put(key,body,options={}){
   let response;
   try{response=await fetch(storageUrl(env,key),{method:'POST',redirect:'manual',headers:storageHeaders(env,{'content-type':options.httpMetadata?.contentType||'application/octet-stream','x-upsert':'true'}),body})}
   catch{throw new Error('Supabase Storage upload failed.');}
   if(!response.ok)throw new Error('Supabase Storage upload failed.');
   return {key};
  },
  async get(key,options={}){
   const headers=storageHeaders(env);
   if(options.range instanceof Headers){const range=options.range.get('range');if(range)headers.range=range}
   let response;
   try{response=await fetch(storageUrl(env,key),{method:'GET',redirect:'manual',headers})}
   catch{throw new Error('Supabase Storage request failed.');}
   if(response.status===404)return null;
   if(!response.ok)throw new Error('Supabase Storage request failed.');
   let range;
   const contentRange=response.headers.get('content-range');
   const match=contentRange?.match(/^bytes (\d+)-(\d+)\//);
   if(match)range={offset:Number(match[1]),length:Number(match[2])-Number(match[1])+1};
   return {body:response.body,...(range?{range}:{})};
  },
  async delete(key){
   let response;
   try{response=await fetch(env.SUPABASE_URL.replace(/\/$/, '')+'/storage/v1/object',{method:'DELETE',redirect:'manual',headers:storageHeaders(env,{'content-type':'application/json'}),body:JSON.stringify({prefixes:[key]})})}
   catch{throw new Error('Supabase Storage delete failed.');}
   if(!response.ok&&response.status!==404)throw new Error('Supabase Storage delete failed.');
  }
 };
}

export function configureSupabaseRuntime(env){
 const configured=Boolean(env.SUPABASE_URL||env.SUPABASE_SERVICE_ROLE_KEY);
 if(!configured)return env;
 config(env);
 return {...env,DB:createSupabaseDatabase(env),BUCKET:createSupabaseBucket(env)};
}
