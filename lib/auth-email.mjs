import {accessEmailTemplate} from './auth-email-template.mjs';
import {emailLogoBase64} from './auth-email-logo.mjs';
function serviceError(status,message,code){const e=new Error(message);e.status=status;e.code=code;throw e}
export function emailConfigured(env){try{const url=new URL(env.ACADEMY_PUBLIC_URL);return url.protocol==='https:'&&!url.username&&!url.password&&!!env.RESEND_API_KEY&&typeof env.ACADEMY_EMAIL_FROM==='string'&&/^[^\r\n]+@[^\r\n]+$/.test(env.ACADEMY_EMAIL_FROM)}catch{return false}}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function sendAccessEmail(env,{email,name,password,space,id}){
 if(!emailConfigured(env))serviceError(503,'O envio de e-mail precisa ser configurado pela academia.','EMAIL_NOT_CONFIGURED');
 // Only a trusted deployment setting defines the login URL. Never use the request Host or user-supplied redirect.
 const login=new URL('/login.html',env.ACADEMY_PUBLIC_URL);login.searchParams.set('space',space);const link=login.href;
 const template=accessEmailTemplate({name,email,password,link,space});
 let response;try{response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'academy-access/'+id},signal:AbortSignal.timeout(15000),body:JSON.stringify({from:env.ACADEMY_EMAIL_FROM,to:[email],...template,attachments:[{filename:'academia-do-caos.png',content:emailLogoBase64,content_id:'academia-logo',content_type:'image/png'}]})})}catch{serviceError(502,'Não foi possível enviar o e-mail. Tente solicitar uma nova senha em alguns minutos.','EMAIL_DELIVERY_FAILED')}
 if(!response.ok)serviceError(502,'Não foi possível enviar o e-mail. Entre em contato com a academia.','EMAIL_DELIVERY_FAILED');
 const result=await response.json().catch(()=>null);if(!result?.id)serviceError(502,'O serviço de e-mail não confirmou o envio. Solicite novamente.','EMAIL_DELIVERY_FAILED');
 return {accepted:true};
}
