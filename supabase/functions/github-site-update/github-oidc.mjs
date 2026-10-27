const jwksUrl='https://token.actions.githubusercontent.com/.well-known/jwks';
let cachedKeys=null,cacheUntil=0;

function decodeBase64Url(value){
 const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
 const padded=normalized+'='.repeat((4-normalized.length%4)%4);
 return Uint8Array.from(atob(padded),char=>char.charCodeAt(0));
}
function decodeJsonPart(value){return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)))}
function audienceMatches(value,expected){return typeof value==='string'?value===expected:Array.isArray(value)&&value.includes(expected)}

export function isTrustedGitHubPush(claims){
 return claims?.repository==='SrElizeuSantos08/Academia_do_Cados'
  &&claims?.repository_owner==='SrElizeuSantos08'
  &&claims?.sub==='repo:SrElizeuSantos08/Academia_do_Cados:ref:refs/heads/main'
  &&claims?.ref==='refs/heads/main'
  &&claims?.event_name==='push'
  &&claims?.workflow_ref==='SrElizeuSantos08/Academia_do_Cados/.github/workflows/supabase-site-updates.yml@refs/heads/main'
  &&/^[0-9a-f]{40}$/.test(claims?.sha||'')
  &&/^\d+$/.test(String(claims?.run_id||''))
  &&typeof claims?.actor==='string'&&claims.actor.length>0&&claims.actor.length<=100;
}

export async function verifyGitHubActionsToken(token,{fetchImpl=fetch,now=Date.now(),audience='academia-github-site-updates'}={}){
 if(typeof token!=='string'||token.length>12000)return null;
 const parts=token.split('.');if(parts.length!==3)return null;
 let header,claims;
 try{header=decodeJsonPart(parts[0]);claims=decodeJsonPart(parts[1])}catch{return null}
 if(header.alg!=='RS256'||typeof header.kid!=='string'||claims.iss!=='https://token.actions.githubusercontent.com'||!audienceMatches(claims.aud,audience))return null;
 const nowSeconds=Math.floor(now/1000);
 if(!Number.isFinite(claims.exp)||!Number.isFinite(claims.iat)||claims.exp<=nowSeconds||claims.iat>nowSeconds+30||(claims.nbf&&claims.nbf>nowSeconds+30))return null;
 try{
  if(!cachedKeys||cacheUntil<now){
   const response=await fetchImpl(jwksUrl,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(5000)});
   if(!response.ok)return null;
   const body=await response.json();if(!Array.isArray(body.keys))return null;
   cachedKeys=body.keys;cacheUntil=now+5*60*1000;
  }
  const jwk=cachedKeys.find(key=>key.kid===header.kid&&key.kty==='RSA');if(!jwk)return null;
  const publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const signedData=new TextEncoder().encode(parts[0]+'.'+parts[1]);
  const valid=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',publicKey,decodeBase64Url(parts[2]),signedData);
  return valid?claims:null;
 }catch{return null}
}
