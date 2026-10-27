import { isTrustedGitHubPush, verifyGitHubActionsToken } from './github-oidc.mjs';

const repository='SrElizeuSantos08/Academia_do_Cados';
const audience='academia-github-site-updates';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

Deno.serve(async (request:Request)=>{
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 const authorization=request.headers.get('authorization')||'';
 const token=authorization.match(/^Bearer\s+([^\s]+)$/i)?.[1];
 if(!token)return json({error:'GitHub workflow authentication required.'},401);
 const claims=await verifyGitHubActionsToken(token,{audience});
 if(!claims)return json({error:'GitHub workflow token is invalid or expired.'},401);
 if(!isTrustedGitHubPush(claims))return json({error:'This repository, workflow, or branch is not allowed.'},403);

 let payload:unknown;
 try{
  const raw=await request.text();
  if(raw.length>1024)return json({error:'Request is too large.'},413);
  payload=raw?JSON.parse(raw):{};
 }catch{return json({error:'Invalid JSON.'},400)}
 if(!payload||typeof payload!=='object'||Object.keys(payload).length!==0)return json({error:'The request body must be empty.'},400);

 // Fetch canonical commit details from GitHub; no commit text is accepted from the caller.
 let commitResponse:Response;
 try{
  commitResponse=await fetch(`https://api.github.com/repos/${repository}/commits/${claims.sha}`,{
   headers:{Accept:'application/vnd.github+json','User-Agent':'Academia-do-Caos-release-logger','X-GitHub-Api-Version':'2022-11-28'},
   signal:AbortSignal.timeout(10000)
  });
 }catch{return json({error:'Could not verify the GitHub commit.'},502)}
 if(!commitResponse.ok)return json({error:'Could not verify the GitHub commit.'},502);
 const commit=await commitResponse.json().catch(()=>null);
 const commitSha=String(commit?.sha||'').toLowerCase();
 const message=commit?.commit?.message;
 const committedAt=commit?.commit?.committer?.date||commit?.commit?.author?.date;
 if(commitSha!==claims.sha||typeof message!=='string'||typeof committedAt!=='string'||!Number.isFinite(Date.parse(committedAt)))return json({error:'GitHub returned incomplete commit metadata.'},502);

 const projectUrl=Deno.env.get('SUPABASE_URL');
 const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!projectUrl||!serviceKey)return json({error:'The Supabase release recorder is not configured.'},503);
 let response:Response;
 try{
  response=await fetch(new URL('/rest/v1/rpc/log_github_site_update',projectUrl),{
   method:'POST',
   headers:{apikey:serviceKey,Authorization:`Bearer ${serviceKey}`,'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({p_repository:repository,p_commit_sha:commitSha,p_git_ref:claims.ref,p_commit_message:message,p_actor:claims.actor,p_committed_at:committedAt,p_workflow_run_id:Number(claims.run_id)}),
   signal:AbortSignal.timeout(10000)
  });
 }catch{return json({error:'The Supabase write could not be confirmed.'},502)}
 if(!response.ok)return json({error:'Supabase did not accept the release record.'},502);
 return json({ok:true,repository,commit:commitSha,recorded:true});
});
