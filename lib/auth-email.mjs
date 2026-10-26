import {accessEmailTemplate} from './auth-email-template.mjs';
import {emailLogoBase64} from './auth-email-logo.mjs';
function serviceError(status,message,code){const e=new Error(message);e.status=status;e.code=code;throw e}
const guid=value=>typeof value==='string'&&/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(value);
const mailbox=value=>typeof value==='string'&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
function sender(value){if(typeof value!=='string'||/[\r\n]/.test(value))return null;const m=value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);const address=(m?m[2]:value).trim();return mailbox(address)?{name:m?m[1].trim():'Academia do Caos',address}:null}
export function emailProvider(env){return env.ACADEMY_EMAIL_PROVIDER===undefined?'resend':String(env.ACADEMY_EMAIL_PROVIDER).toLowerCase()}
export function emailConfigured(env){try{const url=new URL(env.ACADEMY_PUBLIC_URL);if(url.protocol!=='https:'||url.username||url.password||!sender(env.ACADEMY_EMAIL_FROM))return false;switch(emailProvider(env)){case'resend':return !!env.RESEND_API_KEY;case'microsoft365':return guid(env.M365_TENANT_ID)&&guid(env.M365_CLIENT_ID)&&typeof env.M365_CLIENT_SECRET==='string'&&!!env.M365_CLIENT_SECRET.trim()&&mailbox(env.M365_MAILBOX_UPN);default:return false}}catch{return false}}
async function sendMicrosoft365(env,recipient,template){
 // App-only credentials belong to this deployment, never to a student's browser or ChatGPT connection.
 let response;try{response=await fetch('https://login.microsoftonline.com/'+env.M365_TENANT_ID+'/oauth2/v2.0/token',{method:'POST',redirect:'error',headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.timeout(15000),body:new URLSearchParams({grant_type:'client_credentials',client_id:env.M365_CLIENT_ID,client_secret:env.M365_CLIENT_SECRET,scope:'https://graph.microsoft.com/.default'})})}catch{serviceError(502,'Não foi possível autenticar o envio no Microsoft 365.','EMAIL_AUTH_FAILED')}
 if(!response.ok)serviceError(503,'A integração Microsoft 365 precisa de uma credencial de aplicativo válida e autorização da organização.','EMAIL_AUTH_FAILED');
 const token=await response.json().catch(()=>null);if(typeof token?.access_token!=='string'||!token.access_token)serviceError(502,'O Microsoft 365 não confirmou a autenticação de envio.','EMAIL_AUTH_FAILED');
 const from=sender(env.ACADEMY_EMAIL_FROM);
 const message={subject:template.subject,body:{contentType:'HTML',content:template.html},from:{emailAddress:from},toRecipients:[{emailAddress:{address:recipient}}],attachments:[{'@odata.type':'#microsoft.graph.fileAttachment',name:'academia-do-caos.png',contentType:'image/png',contentBytes:emailLogoBase64,contentId:'academia-logo',isInline:true}]};
 try{response=await fetch('https://graph.microsoft.com/v1.0/users/'+encodeURIComponent(env.M365_MAILBOX_UPN)+'/sendMail',{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({message,saveToSentItems:true})})}catch{serviceError(502,'Não foi possível confirmar o envio pelo Microsoft 365. Confira o recebimento antes de solicitar novamente.','EMAIL_DELIVERY_FAILED')}
 // A 202 has no JSON body and means acceptance, not guaranteed inbox delivery. No automatic retry after acceptance/ambiguous timeout.
 if(response.status!==202)serviceError(502,'O Microsoft 365 não aceitou o envio. A academia precisa conferir a autorização do aplicativo e do remetente.','EMAIL_DELIVERY_FAILED');
 return {accepted:true};
}
export async function sendAccessEmail(env,{email,name,password,space,id}){
 if(!emailConfigured(env))serviceError(503,'O envio de e-mail precisa ser configurado pela academia.','EMAIL_NOT_CONFIGURED');
 if(!mailbox(email))serviceError(400,'O e-mail cadastrado é inválido.','EMAIL_INVALID_RECIPIENT');
 // Login URL comes only from trusted deployment settings; request Host/redirect values are never used.
 const login=new URL('/login.html',env.ACADEMY_PUBLIC_URL);login.searchParams.set('space',space);
 const template=accessEmailTemplate({name,email,password,link:login.href,space});
 if(emailProvider(env)==='microsoft365')return sendMicrosoft365(env,email,template);
 let response;try{response=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'academy-access/'+id},signal:AbortSignal.timeout(15000),body:JSON.stringify({from:env.ACADEMY_EMAIL_FROM,to:[email],...template,attachments:[{filename:'academia-do-caos.png',content:emailLogoBase64,content_id:'academia-logo',content_type:'image/png'}]})})}catch{serviceError(502,'Não foi possível enviar o e-mail. Tente solicitar uma nova senha em alguns minutos.','EMAIL_DELIVERY_FAILED')}
 if(!response.ok)serviceError(502,'Não foi possível enviar o e-mail. Entre em contato com a academia.','EMAIL_DELIVERY_FAILED');
 const result=await response.json().catch(()=>null);if(!result?.id)serviceError(502,'O serviço de e-mail não confirmou o envio. Solicite novamente.','EMAIL_DELIVERY_FAILED');return {accepted:true};
}
