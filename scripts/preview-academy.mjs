// Local demonstration only. Production keeps the authenticated Sites identity.
// This server always binds loopback and uses its own ignored database/assets.
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { readFile, writeFile, unlink, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { handleLms } from '../lib/lms.mjs';
import { insertPerson } from '../lib/registration.mjs';
import {courseCatalog} from '../lib/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = resolve(root, 'public');
const profiles = {
  aluno: {id:'qa-student',login:'qa@example.test',name:'Aluno de verificação',role:'student'},
  admin: {id:'qa-admin',login:'admin@example.test',name:'Administração local',role:'admin'},
  professor: {id:'qa-teacher',login:'teacher@example.test',name:'Professor local',role:'teacher'},
};
const aliases = new Set(['admin','aluno','portal','empresa','piloto','certificado','index']);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.pdf':'application/pdf','.mp4':'video/mp4',
  '.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.vtt':'text/vtt; charset=utf-8'};

class LocalFixedLengthStream {
  constructor(length) {
    let received = 0;
    const stream = new TransformStream({
      transform(chunk, controller) {received += chunk.byteLength;if(received > length)throw Error('Size mismatch');controller.enqueue(chunk);},
      flush() {if(received !== length)throw Error('Size mismatch');},
    });
    this.readable = stream.readable;this.writable = stream.writable;
  }
}

export async function startPreview({port=5190,stateDirectory=resolve(root,'outputs/local-preview'),restoreSnapshot=true}={}) {
  mkdirSync(stateDirectory,{recursive:true});
  const assetRoot=resolve(stateDirectory,'assets');mkdirSync(assetRoot,{recursive:true});
  const sql=new DatabaseSync(resolve(stateDirectory,'academy.sqlite'));
  const fresh=!sql.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='people'").get();
  const journal=JSON.parse(readFileSync(resolve(root,'drizzle/meta/_journal.json'),'utf8')).entries;
  if(fresh)sql.exec(readFileSync(resolve(root,'drizzle',journal[0].tag+'.sql'),'utf8'));
  class Statement {
    constructor(query,args=[]){this.query=query;this.args=args;}
    bind(...args){return new Statement(this.query,args);}
    async run(){const result=sql.prepare(this.query).run(...this.args);return {success:true,meta:{changes:result.changes}};}
    async first(){return sql.prepare(this.query).get(...this.args)||null;}
    async all(){return {results:sql.prepare(this.query).all(...this.args)};}
  }
  const db={prepare:query=>new Statement(query),batch:async statements=>{
    sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}
  }};
  for(const profile of Object.values(profiles))await insertPerson(db,{...profile,email:profile.login,identity:profile.id,created:new Date().toISOString()},true);
  for(const c of courseCatalog){
  sql.prepare('INSERT OR IGNORE INTO courses VALUES(?,?,?,?,?,?,?,?,?)').run(c.id,c.title,c.description,c.level,c.folder,1,c.sort||0,JSON.stringify(c.modules),new Date().toISOString());
  sql.prepare('INSERT OR IGNORE INTO enrollments VALUES(?,?,?)').run('qa-student',c.id,new Date().toISOString());
  }
  const snapshotPath=resolve(root,'outputs/local-preview-progress.json');
  if(fresh&&restoreSnapshot&&existsSync(snapshotPath)){
    const saved=JSON.parse(readFileSync(snapshotPath,'utf8').replace(/^\uFEFF/,''));
    if(saved.me)sql.prepare('UPDATE people SET name=?,email=?,photo=? WHERE id=?').run(saved.me.name,saved.me.email,saved.me.photo||'','qa-student');
    for(const row of saved.progress||[])sql.prepare('INSERT OR REPLACE INTO progress VALUES(?,?,?,?,?,?,?)').run('qa-student',row.course,row.lesson,row.position,row.done,row.score,row.updated);
    for(const row of saved.certificates||[])sql.prepare('INSERT OR IGNORE INTO certificates VALUES(?,?,?,?,?,?)').run(row.id,'qa-student',row.course,row.module,typeof row.snapshot==='string'?row.snapshot:JSON.stringify(row.snapshot),row.created);
    for(const row of saved.forum||[])sql.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?,?)').run(row.id,row.course,row.user,row.parent||'',row.text,row.asset||'',row.created);
    for(const row of saved.support?.tickets||[])sql.prepare('INSERT OR IGNORE INTO tickets VALUES(?,?,?,?,?,?,?)').run(row.id,row.user,row.teacher||'',row.course,row.subject,row.status,row.created);
    for(const row of saved.support?.replies||[])sql.prepare('INSERT OR IGNORE INTO replies VALUES(?,?,?,?,?)').run(row.id,row.ticket,row.user,row.text,row.created);
    for(const row of saved.notifications||[]){sql.prepare('INSERT OR IGNORE INTO notifications VALUES(?,?,?,?,?,?)').run(row.id,row.user,row.course,row.title,row.text,row.created);if(row.read)sql.prepare('INSERT OR IGNORE INTO reads VALUES(?,?)').run('qa-student',row.id);}
  }
  sql.exec('CREATE TABLE IF NOT EXISTS preview_migrations (tag TEXT PRIMARY KEY)');
  for(const entry of journal.slice(1))if(!sql.prepare('SELECT tag FROM preview_migrations WHERE tag=?').get(entry.tag)){
    sql.exec('BEGIN');try{sql.exec(readFileSync(resolve(root,'drizzle',entry.tag+'.sql'),'utf8'));sql.prepare('INSERT INTO preview_migrations VALUES(?)').run(entry.tag);sql.exec('COMMIT');}catch(error){sql.exec('ROLLBACK');sql.close();throw error;}
  }
  globalThis.FixedLengthStream??=LocalFixedLengthStream;
  const assetPath=key=>{if(!/^[a-zA-Z0-9-]+$/.test(key))throw Error('Invalid key');return resolve(assetRoot,key);};
  const env={DB:db,BUCKET:{
    async put(key,stream){await writeFile(assetPath(key),new Uint8Array(await new Response(stream).arrayBuffer()));},
    async delete(key){try{await unlink(assetPath(key));}catch(error){if(error.code!=='ENOENT')throw error;}},
    async get(key,options){let bytes;try{bytes=await readFile(assetPath(key));}catch(error){if(error.code==='ENOENT')return null;throw error;}
      const range=options?.range?.get('range')?.match(/^bytes=(\d+)-(\d*)$/);
      if(range){const offset=+range[1],end=range[2]?Math.min(+range[2],bytes.length-1):bytes.length-1;return {body:bytes.subarray(offset,end+1),range:{offset,length:end-offset+1}};}return {body:bytes};
    },
  }};
  const server=createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,`http://127.0.0.1:${server.address().port}`);
      const cookie=req.headers.cookie?.match(/(?:^|;\s*)ac-preview-profile=(admin|aluno|professor)(?:;|$)/)?.[1];
      const selected=url.searchParams.get('perfil');
      const profile=Object.hasOwn(profiles,selected)?selected:/^\/admin(?:\.html)?\/?$/.test(url.pathname)?'admin':cookie||'aluno';
      if(!url.pathname.startsWith('/api/'))res.setHeader('Set-Cookie',`ac-preview-profile=${profile}; Path=/; HttpOnly; SameSite=Strict`);
      if(url.pathname.startsWith('/api/lms/')){
        const chunks=[];for await(const chunk of req)chunks.push(chunk);
        const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id',profiles[profile].id);headers.set('oai-authenticated-user-email',profiles[profile].login);
        const body=Buffer.concat(chunks);const result=await handleLms(new Request(url,{method:req.method,headers,body:body.length?body:undefined}),env);
        res.writeHead(result.status,Object.fromEntries(result.headers));res.end(Buffer.from(await result.arrayBuffer()));return;
      }
      if(url.pathname==='/signin-with-chatgpt'||url.pathname==='/signout-with-chatgpt'){res.writeHead(303,{Location:'/aluno?perfil=aluno'});res.end();return;}
      const name=url.pathname.replace(/^\//,'').replace(/\/$/,'');
      const path=resolve(publicRoot,name===''?'index.html':aliases.has(name)?name+'.html':decodeURIComponent(name));
      if(!path.startsWith(publicRoot+sep)){res.writeHead(403);res.end();return;}
      const fileStat=await stat(path);if(!fileStat.isFile()){res.writeHead(404);res.end();return;}
      let bytes=await readFile(path);
      if(extname(path)==='.html'){
        const selector='<div class="preview-profile"><small>AMBIENTE LOCAL · PERFIS DE TESTE</small><a href="/admin?perfil=admin">Administrador</a><a href="/admin?perfil=professor">Professor</a><a href="/aluno?perfil=aluno">Aluno</a></div>';
        let html=bytes.toString('utf8');html=html.replace('<small>ACADEMIA DO CAOS',selector+'<small>ACADEMIA DO CAOS');
        html=html.replace('</head>','<style>.preview-profile{display:grid;gap:5px;border-top:1px solid #455535;padding-top:12px}.preview-profile small{font-size:9px;color:#bdce9d}</style></head>');bytes=Buffer.from(html);
      }
      const headers={'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
      const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if(range){const start=+range[1],end=range[2]?Math.min(+range[2],bytes.length-1):bytes.length-1;
        if(start>end||start>=bytes.length){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});res.end();return;}
        res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${bytes.length}`});res.end(req.method==='HEAD'?undefined:bytes.subarray(start,end+1));
      }else{res.writeHead(200,{...headers,'Content-Length':bytes.length});res.end(req.method==='HEAD'?undefined:bytes);}
    }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end(error.code==='ENOENT'?'Não encontrado.':'Falha na prévia local.');}
  });
  server.on('close',()=>sql.close());
  await new Promise((resolveListen,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolveListen);});
  return server;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const server=await startPreview();
  console.log(`Prévia local: http://127.0.0.1:${server.address().port}/admin (empresa) e /aluno (aprendizado). Dados de teste em outputs/local-preview.`);
  const close=()=>server.close(()=>process.exit(0));process.on('SIGINT',close);process.on('SIGTERM',close);
}
