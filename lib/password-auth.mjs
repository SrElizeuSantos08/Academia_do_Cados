import {personStatement} from './registration.mjs';
import {emailConfigured,sendAccessEmail} from './auth-email.mjs';
const COOKIE='__Host-academy_session',ITERATIONS=100000;
const enc=new TextEncoder(),hex=a=>Array.from(new Uint8Array(a),n=>n.toString(16).padStart(2,'0')).join(''),random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
const row=(db,q,...args)=>db.prepare(q).bind(...args).first(),run=(db,q,...args)=>db.prepare(q).bind(...args).run();
const now=()=>new Date().toISOString();
function error(status,message,code){const e=new Error(message);e.status=status;e.code=code;throw e}
const reply=(body,status=200,cookie)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',...(cookie?{'Set-Cookie':cookie}:{})}});
const cookie=(token,age=28800)=>`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=None; Partitioned; Max-Age=${age}`;
async function digest(value){return hex(await crypto.subtle.digest('SHA-256',enc.encode(value)))}
export async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:ITERATIONS},key,256))}
function equal(a,b){if(a.length!==b.length)return false;let result=0;for(let i=0;i<a.length;i++)result|=a.charCodeAt(i)^b.charCodeAt(i);return result===0}
function validatePassword(value){if(typeof value!=='string'||value.length<12||value.length>128||/^(.)\1+$/.test(value)||/^(?:senha|password|qwerty|123456)[\d!@#$%&*._-]*$/i.test(value))error(400,'Crie uma senha exclusiva de 12 a 128 caracteres, sem sequências comuns.');return value}
async function body(req){
 if(!req.headers.get('content-type')?.includes('application/json'))error(400,'Envie dados em JSON.');if(Number(req.headers.get('content-length'))>16000)error(413,'Formulário muito grande.');
 const reader=req.body?.getReader();if(!reader)error(400,'Formulário inválido.');const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16000){await reader.cancel();error(413,'Formulário muito grande.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 try{const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||typeof value!=='object'||Array.isArray(value))error(400,'Formulário inválido.');return value}catch{error(400,'Formulário inválido.')}
}
async function limit(db,key,max,seconds){const timestamp=Date.now(),result=await row(db,`INSERT INTO auth_limits(key,count,started) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN started<? THEN 1 ELSE count+1 END,started=CASE WHEN started<? THEN excluded.started ELSE started END RETURNING count`,await digest(key),timestamp,timestamp-seconds*1000,timestamp-seconds*1000);if(result.count>max)error(429,'Muitas tentativas. Aguarde alguns minutos e tente novamente.');}
export async function passwordLoginEnabled(db){return (await row(db,"SELECT value FROM settings WHERE key='password_login'"))?.value==='on'}
export async function passwordSession(req,db){
 const token=req.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const session=await row(db,'SELECT p.*,s.token_hash,s.expires,s.version FROM auth_sessions s JOIN people p ON p.id=s.user WHERE s.token_hash=? AND s.expires>? AND p.active=1',await digest(token),Date.now());if(!session)return null;
 if(session.version.startsWith('email:')){const challenge=await row(db,'SELECT * FROM auth_email_challenges WHERE id=? AND user=? AND consumed=1 AND expires>?',session.version.slice(6),session.id,Date.now());return challenge?{...session,must_change:1,challenge_id:challenge.id}:null}
 const credentials=await row(db,'SELECT * FROM auth_passwords WHERE user=? AND updated=? AND must_change=0',session.id,session.version);return credentials?{...session,must_change:0}:null;
}
export async function passwordMember(req,db){const user=await passwordSession(req,db);if(!user)error(401,'Entre com seu e-mail ou RA e senha.');if(user.must_change)error(428,'Troque a senha temporária antes de continuar.','PASSWORD_CHANGE_REQUIRED');const {token_hash,expires,must_change,version,challenge_id,...person}=user;return person}
async function createSession(db,user,version,expires=Date.now()+28800000){if(!version)version=(await row(db,'SELECT updated FROM auth_passwords WHERE user=?',user)).updated;const token=random();await run(db,'DELETE FROM auth_sessions WHERE expires<?',Date.now());await run(db,'INSERT INTO auth_sessions(token_hash,user,expires,created,version) VALUES(?,?,?,?,?)',await digest(token),user,expires,now(),version);return cookie(token,Math.max(1,Math.floor((expires-Date.now())/1000)))}
async function issueEmail(req,env,person){
 // Persist only a salted hash. The temporary credential exists in memory and in the recipient's email.
 const db=env.DB,challenge=crypto.randomUUID(),password=hex(crypto.getRandomValues(new Uint8Array(16))),salt=random(),hash=await passwordHash(password,salt),expires=Date.now()+900000;
 await run(db,'DELETE FROM auth_email_challenges WHERE expires<?',Date.now());
 await run(db,'INSERT INTO auth_email_challenges(id,user,salt,password_hash,expires,consumed,created) VALUES(?,?,?,?,?,0,?)',challenge,person.id,salt,hash,expires,now());
 try{await sendAccessEmail(env,{email:person.login_email,name:person.name,password,space:person.account_type==='company'?'company':'student',id:challenge});await run(db,'UPDATE auth_email_challenges SET consumed=2 WHERE user=? AND id<>?',person.id,challenge);await run(db,"DELETE FROM auth_sessions WHERE user=? AND version LIKE 'email:%'",person.id);await audit(db,person.id,'temporary-access-email-accepted')}
 catch(e){await run(db,'DELETE FROM auth_email_challenges WHERE id=?',challenge);throw e}
}
const emailReply={ok:true,message:'Se os dados estiverem aptos, você receberá uma senha temporária no e-mail cadastrado. Ela vale por 15 minutos. Confira também a pasta de spam.'};
async function audit(db,user,action){await run(db,'INSERT INTO audit(id,user,action,target,created) VALUES(?,?,?,?,?)',crypto.randomUUID(),user,action,user,now())}
// Recovery uses only the identity verified by Sites, never an identifier from the form.
async function verifiedPerson(req,db){
 const identity=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 if(!identity||!email)return null;
 const person=await row(db,'SELECT * FROM people WHERE identity=?',identity)||await row(db,'SELECT * FROM people WHERE lower(login_email)=?',email);
 if(!person?.active||person.identity&&person.identity!==identity)return null;
 return person;
}
export async function handlePasswordAuth(req,env,action){try{const db=env.DB,method=req.method;
 if(action==='access'&&method==='GET'){const person=await verifiedPerson(req,db);return reply({verified:!!req.headers.get('oai-authenticated-user-id'),account:person?{name:person.name,ra:person.ra,hasPassword:!!await row(db,'SELECT user FROM auth_passwords WHERE user=?',person.id)}:null})}
 if(action==='config'&&method==='GET')return reply({emailReady:emailConfigured(env)});
 if(action==='courses'&&method==='GET'){const courses=(await db.prepare('SELECT id,title,level FROM courses WHERE published=1 ORDER BY folder,sort,id').all()).results;return reply({courses})}
 if(action==='session'&&method==='GET'){const s=await passwordSession(req,db);if(!s)return reply({authenticated:false});return reply({authenticated:true,mustChange:!!s.must_change,user:{id:s.id,name:s.name,ra:s.ra,role:s.role}})}
 if(method!=='POST')return reply({error:'Método não permitido.'},405);
 if(action==='recover'){
 const b=await body(req);await limit(db,'recovery-ip:'+(req.headers.get('cf-connecting-ip')||'site'),20,900);
 const person=await verifiedPerson(req,db);if(!person)error(403,'Entre com a conta ChatGPT vinculada ao seu cadastro para definir ou recuperar sua senha. Se o e-mail mudou, solicite a conferência do cadastro à administração.');
 if(b.space==='company'&&!['admin','teacher'].includes(person.role))error(403,'Seu cadastro tem acesso à área do aluno. Selecione Sou aluno para continuar.');
 await limit(db,'recovery-account:'+person.id,5,900);const password=validatePassword(b.password),salt=random(),hash=await passwordHash(password,salt),version=now()+'-'+crypto.randomUUID();
 await db.batch([db.prepare('INSERT INTO auth_passwords(user,salt,password_hash,must_change,updated) VALUES(?,?,?,0,?) ON CONFLICT(user) DO UPDATE SET salt=excluded.salt,password_hash=excluded.password_hash,must_change=0,updated=excluded.updated').bind(person.id,salt,hash,version),db.prepare('DELETE FROM auth_sessions WHERE user=?').bind(person.id),db.prepare('DELETE FROM auth_email_challenges WHERE user=?').bind(person.id),db.prepare('UPDATE people SET identity=? WHERE id=? AND identity IS NULL').bind(req.headers.get('oai-authenticated-user-id'),person.id)]);
 await audit(db,person.id,'password-recovered-verified');return reply({ok:true,role:person.role},200,await createSession(db,person.id,version));
 }
 if(action==='logout'){const session=await passwordSession(req,db);if(session)await run(db,'DELETE FROM auth_sessions WHERE token_hash=?',session.token_hash);return reply({ok:true},200,cookie('',0))}
 if(action==='request-access'){
 const b=await body(req),identifier=String(b.identifier||'').trim().toLowerCase();if(!identifier||identifier.length>254)error(400,'Informe seu e-mail ou RA.');
 await limit(db,'email-ip:'+(req.headers.get('cf-connecting-ip')||'site'),8,3600);await limit(db,'email-account:'+identifier,3,900);
 if(!emailConfigured(env))error(503,'O envio de e-mail ainda precisa ser configurado pela academia. Para contas existentes, use a recuperação pela conta vinculada.','EMAIL_NOT_CONFIGURED');
 const person=await row(db,'SELECT p.*,ap.account_type FROM people p LEFT JOIN auth_profiles ap ON ap.user=p.id WHERE lower(p.login_email)=? OR lower(p.ra)=?',identifier,identifier);
 if(person?.active){await limit(db,'email-user:'+person.id,3,900);await issueEmail(req,env,person)}return reply(emailReply,202);
 }
 if(action==='login'){
 const b=await body(req),identifier=String(b.identifier||'').trim().toLowerCase(),password=String(b.password||'');if(!identifier||identifier.length>254||password.length>128)error(401,'E-mail, RA ou senha inválidos.');
 await limit(db,'login-ip:'+(req.headers.get('cf-connecting-ip')||'site'),80,900);const person=await row(db,'SELECT p.*,ap.account_type FROM people p LEFT JOIN auth_profiles ap ON ap.user=p.id WHERE lower(p.login_email)=? OR lower(p.ra)=?',identifier,identifier);
 await limit(db,'login-account:'+(person?.id||identifier),10,900);
 const credentials=person?await row(db,'SELECT * FROM auth_passwords WHERE user=? AND must_change=0',person.id):null;
 const challenge=person?await row(db,'SELECT * FROM auth_email_challenges WHERE user=? AND consumed=0 AND expires>? ORDER BY created DESC LIMIT 1',person.id,Date.now()):null;
 const hash=await passwordHash(password,credentials?.salt||'academy-invalid-account-verification'),tempHash=await passwordHash(password,challenge?.salt||'academy-invalid-temporary-verification');
 const permanent=credentials&&equal(hash,credentials.password_hash),temporary=challenge&&equal(tempHash,challenge.password_hash);
 if(!person?.active||!permanent&&!temporary)error(401,'E-mail, RA ou senha inválidos.');
 if(b.space==='company'&&!['admin','teacher'].includes(person.role)&&person.account_type!=='company')error(403,'Seu cadastro tem acesso à área do aluno. A administração libera os perfis da equipe.');
 let version=credentials?.updated,expires=Date.now()+28800000;
 if(!permanent){const consumed=await row(db,'UPDATE auth_email_challenges SET consumed=1 WHERE id=? AND consumed=0 AND expires>? RETURNING id',challenge.id,Date.now());if(!consumed)error(401,'A senha temporária expirou ou já foi utilizada. Solicite uma nova.');version='email:'+challenge.id;expires=challenge.expires;}
 await audit(db,person.id,'password-login');return reply({ok:true,mustChange:!permanent,role:person.role,companyPending:person.account_type==='company'&&!['admin','teacher'].includes(person.role)},200,await createSession(db,person.id,version,expires));
 }
 if(action==='register'){
 const b=await body(req),name=String(b.name||'').trim(),email=String(b.email||'').trim().toLowerCase(),company=String(b.company||'').trim(),course=String(b.course||''),accountType=b.space==='company'?'company':'student';
 if(name.length<3||name.length>120||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||company.length>160||accountType==='company'&&!company)error(400,'Confira seu nome, e-mail e empresa.');
 await limit(db,'register:'+(req.headers.get('cf-connecting-ip')||'site'),8,3600);await limit(db,'register-email:'+email,3,900);
 if(!await row(db,'SELECT id FROM courses WHERE id=? AND published=1',course))error(400,'Selecione um curso disponível.');
 if(!emailConfigured(env))error(503,'O envio de e-mail ainda precisa ser configurado pela academia. Nenhuma conta foi criada.','EMAIL_NOT_CONFIGURED');
 const existing=await row(db,'SELECT id FROM people WHERE lower(login_email)=?',email);if(existing){const candidate=await row(db,'SELECT p.*,ap.account_type FROM people p JOIN auth_profiles ap ON ap.user=p.id WHERE p.id=? AND p.active=1',existing.id);if(candidate&&!await row(db,'SELECT user FROM auth_passwords WHERE user=?',existing.id)){await limit(db,'email-user:'+existing.id,3,900);await issueEmail(req,env,candidate)}return reply(emailReply,202);}
 const user=crypto.randomUUID(),account=personStatement(db,{id:user,identity:null,login:email,email,name,role:'student',created:now()});
 await db.batch([account,db.prepare('INSERT INTO auth_profiles(user,company,account_type) VALUES(?,?,?)').bind(user,company,accountType),db.prepare('INSERT INTO enrollments(user,course,created) VALUES(?,?,?)').bind(user,course,now())]);
 await issueEmail(req,env,{id:user,name,login_email:email,account_type:accountType});await audit(db,user,'self-register-email-pending');return reply(emailReply,202);
 }
 if(action==='password'){
 const session=await passwordSession(req,db);if(!session)error(401,'Sua sessão expirou. Entre novamente.');const b=await body(req),password=validatePassword(b.password);await limit(db,'password:'+session.id,10,900);
 const current=await row(db,'SELECT * FROM auth_passwords WHERE user=?',session.id);if(!session.must_change&&(!current||!equal(await passwordHash(String(b.currentPassword||''),current.salt),current.password_hash)))error(400,'A senha atual está incorreta.');
 const temporary=session.challenge_id?await row(db,'SELECT * FROM auth_email_challenges WHERE id=?',session.challenge_id):null;
 for(const old of [current,temporary])if(old&&equal(await passwordHash(password,old.salt),old.password_hash))error(400,'Escolha uma senha diferente da atual e da temporária.');
 const salt=random(),hash=await passwordHash(password,salt),version=now()+'-'+crypto.randomUUID();
 // Compare the original session/challenge again in the write statement. Concurrent replay cannot overwrite a newer password.
 const gate=session.challenge_id?"EXISTS(SELECT 1 FROM auth_sessions s JOIN auth_email_challenges e ON s.version='email:'||e.id WHERE s.token_hash=? AND s.user=? AND s.expires>? AND e.consumed=1 AND e.expires>?)":"EXISTS(SELECT 1 FROM auth_sessions s JOIN auth_passwords a ON a.user=s.user AND a.updated=s.version WHERE s.token_hash=? AND s.user=? AND s.expires>? AND a.must_change=0 AND s.expires>?)";
 const results=await db.batch([db.prepare('INSERT INTO auth_passwords(user,salt,password_hash,must_change,updated) SELECT ?,?,?,0,? WHERE '+gate+' ON CONFLICT(user) DO UPDATE SET salt=excluded.salt,password_hash=excluded.password_hash,must_change=0,updated=excluded.updated').bind(session.id,salt,hash,version,session.token_hash,session.id,Date.now(),Date.now()),db.prepare('DELETE FROM auth_sessions WHERE user=? AND EXISTS(SELECT 1 FROM auth_passwords WHERE user=? AND updated=?)').bind(session.id,session.id,version),db.prepare('DELETE FROM auth_email_challenges WHERE user=? AND EXISTS(SELECT 1 FROM auth_passwords WHERE user=? AND updated=?)').bind(session.id,session.id,version)]);
 if(!results[0].meta?.changes)error(401,'Sua sessão expirou. Entre novamente.');await audit(db,session.id,'password-changed');return reply({ok:true,role:session.role},200,await createSession(db,session.id,version));
 }
 return reply({error:'Rota não encontrada.'},404);
 }catch(e){if(!e.status)console.error('Authentication operation failed');return reply({error:e.status?e.message:'Não foi possível concluir. Tente novamente.',...(e.code?{code:e.code}:{})},e.status||500)}}
