import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QR from 'qrcode/lib/core/qrcode.js';
const lime=rgb(.76,.96,.08),white=rgb(.91,.93,.93),muted=rgb(.62,.66,.66),dark=rgb(.035,.046,.047);
const clean=v=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim();
const defaultLoad=async path=>{const r=await fetch(path);if(!r.ok)throw Error('Não foi possível carregar o modelo do documento.');return new Uint8Array(await r.arrayBuffer())};
async function fonts(doc,load){doc.registerFontkit(fontkit);return {regular:await doc.embedFont(await load('/templates/document-regular.ttf'),{subset:true}),bold:await doc.embedFont(await load('/templates/document-bold.ttf'),{subset:true})}}
function fitted(text,font,size,max,min=5){return Math.max(min,Math.min(size,max/font.widthOfTextAtSize(text,1)))}
function line(page,text,x,top,size,font,color=white,max=1000){text=clean(text);size=fitted(text,font,size,max);page.drawText(text,{x,y:page.getHeight()-top-size,size,font,color});return size}
function centered(page,text,top,size,font,color=white,max=650){text=clean(text);size=fitted(text,font,size,max);line(page,text,(page.getWidth()-font.widthOfTextAtSize(text,size))/2,top,size,font,color,max)}
export async function certificatePdf(s,cid='',options={}){
 const load=options.load||defaultLoad,doc=await PDFDocument.load(await load('/templates/certificate-base.pdf')),page=doc.getPages()[0],f=await fonts(doc,load),W=page.getWidth(),H=page.getHeight();
 const sample=!cid;const name=clean(s.name)||'Nome completo do aluno';
 const prefix='Certificamos que ',size=fitted(prefix+name,f.bold,12.5,650,8),pw=f.regular.widthOfTextAtSize(prefix,size),nw=f.bold.widthOfTextAtSize(name,size),x=(W-pw-nw)/2;
 line(page,prefix,x,310,size,f.regular);line(page,name,x+pw,310,size,f.bold,lime);
 const full=s.module==='Formação completa';centered(page,'concluiu com êxito o '+(full?'curso':'módulo'),330,12,f.regular);
 centered(page,full?s.course:s.module,352,17,f.bold,lime,650);
 if(!full)centered(page,'Curso: '+s.course,376,10,f.regular,white,650);
 const hours=Number(s.hours)||0;centered(page,'com carga horária de '+hours.toLocaleString('pt-BR')+' horas, demonstrando domínio dos conceitos',full?379:396,11.5,f.regular,white,680);
 centered(page,'e práticas essenciais de proteção digital.',full?398:412,11.5,f.regular);
 centered(page,'DATA DE CONCLUSÃO: '+new Date(s.issued).toLocaleDateString('pt-BR'),433,10,f.bold,lime);
 centered(page,'CÓDIGO DO CERTIFICADO: '+clean(s.code),450,10,f.bold,lime);
 if(cid){const origin=options.origin||location.origin,url=origin+'/certificado.html?id='+encodeURIComponent(cid),matrix=QR.create(url,{errorCorrectionLevel:'M'}).modules,size=64,unit=size/(matrix.size+8),qx=(W-size)/2,qy=H-476-size;page.drawRectangle({x:qx,y:qy,width:size,height:size,color:rgb(1,1,1)});for(let y=0;y<matrix.size;y++)for(let x=0;x<matrix.size;x++)if(matrix.data[y*matrix.size+x])page.drawRectangle({x:qx+(x+4)*unit,y:qy+(matrix.size-y+3)*unit,width:unit+.01,height:unit+.01,color:dark});centered(page,'Verifique a autenticidade',543,6.6,f.regular)}else{centered(page,'MODELO',500,8,f.bold,lime);centered(page,'SEM VALIDADE DE CONCLUSÃO',515,5.5,f.regular)}
 centeredAt(page,'Instrutor(a) responsável',206,525,7.5,f.regular);centeredAt(page,'Coordenação acadêmica',636,525,7.5,f.regular);
 centered(page,(sample?'MODELO DEMONSTRATIVO · ':'')+'RA: '+clean(s.ra)+' · Academia do Caos',562,6,f.regular,muted);
 doc.setTitle('Certificado - '+name+' - '+clean(s.course));doc.setAuthor('Academia do Caos');doc.setSubject('Registro de conclusão '+clean(s.code));return doc.save();
}
function centeredAt(page,text,cx,top,size,font,color=white){line(page,text,cx-font.widthOfTextAtSize(text,size)/2,top,size,font,color)}
export async function studentCardPdf(student,course='Cibersegurança',options={}){
 const load=options.load||defaultLoad,doc=await PDFDocument.create(),f=await fonts(doc,load),mm=72/25.4,W=85.6*mm,H=54*mm,logo=await doc.embedPng(await load('/assets/academia-do-caos-logo.png'));
 let photo=null;if(options.photo){try{photo=await doc.embedPng(options.photo)}catch{try{photo=await doc.embedJpg(options.photo)}catch{}}}
 const year=new Date().getFullYear();
 function base(){const p=doc.addPage([W,H]);p.drawRectangle({x:0,y:0,width:W,height:H,color:dark});for(let i=0;i<7;i++){const x=175+i*7;p.drawLine({start:{x,y:28},end:{x:x-20,y:100},thickness:.2,color:rgb(.14,.19,.16)});p.drawCircle({x:x-20,y:100,size:.6,color:muted})}p.drawRectangle({x:0,y:5,width:W,height:1.4,color:lime});return p}
 const front=base();front.drawImage(logo,{x:8,y:H-42,width:100,height:40});line(front,'IDENTIDADE ESTUDANTIL',144,12,4.5,f.regular,muted,90);
 front.drawText('A',{x:164,y:35,size:80,font:f.bold,color:rgb(.09,.14,.11),opacity:.8});const px=10,py=H-47-82,pw=58,ph=82;front.drawRectangle({x:px,y:py,width:pw,height:ph,color:rgb(.96,.97,.96)});
 if(photo){const dim=photo.scaleToFit(pw,ph);front.drawImage(photo,{x:px+(pw-dim.width)/2,y:py+(ph-dim.height)/2,width:dim.width,height:dim.height})}else{front.drawCircle({x:px+pw/2,y:py+53,size:12,color:rgb(.60,.64,.60)});front.drawEllipse({x:px+pw/2,y:py+18,xScale:23,yScale:18,color:rgb(.60,.64,.60)})}
 line(front,'ALUNO',80,48,4.5,f.regular,muted);const name=clean(student.name).toUpperCase();line(front,name,80,58,9.5,f.bold,white,151);
 front.drawLine({start:{x:80,y:H-80},end:{x:204,y:H-80},thickness:.3,color:muted});line(front,'REGISTRO ACADÊMICO',80,87,4.4,f.regular,muted);line(front,clean(student.ra),80,96,8.5,f.bold,white,151);
 line(front,'CURSO',80,115,4.4,f.regular,muted);line(front,clean(course).toUpperCase(),80,124,6.7,f.bold,white,151);front.drawRectangle({x:211,y:11,width:32,height:11,color:lime});line(front,String(year),217,133,7,f.bold,dark);
 line(front,'ACADEMIA DO CAOS · ESCOLA DE CIBERSEGURANÇA',10,140,3.6,f.regular,white,220);
 const back=base();back.drawImage(logo,{x:10,y:H-50,width:104,height:42});line(back,'CONHECIMENTO',13,62,15.5,f.bold,white,215);line(back,'PARA AGIR.',13,80,15.5,f.bold,lime,215);line(back,'Consciência para proteger.',13,102,7.5,f.regular,muted,215);line(back,clean(student.name),13,120,6.7,f.bold,white,215);line(back,'RA: '+clean(student.ra),13,132,7,f.bold,lime,215);line(back,'IDENTIFICAÇÃO INTERNA · ACADEMIA DO CAOS',13,140,3.6,f.regular,muted,215);
 doc.setTitle('Carteirinha - '+clean(student.name));doc.setAuthor('Academia do Caos');return doc.save();
}
