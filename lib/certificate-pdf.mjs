// Small vector PDF renderer using standard PDF fonts. No external services or dependencies.
const W=841.89,H=595.28;
const hex=s=>Array.from(s.normalize('NFC'),c=>{
 const n=c.codePointAt(0);return (n<=255?n:({8364:128,8211:150,8212:151,8217:146}[n]||63)).toString(16).padStart(2,'0');
}).join('');
export function certificatePdf(s,verify){
 const ops=[],lime='0.77 1 0',white='0.91 0.93 0.94',muted='0.63 0.68 0.7';
 const line=(x,y,x2,y2,color,width=1)=>ops.push(`${color} RG ${width} w ${x} ${y} m ${x2} ${y2} l S`);
 const width=(text,size)=>Array.from(text).reduce((n,c)=>n+(/[MW@%]/.test(c)?.85:/[ilI.,:! '|]/.test(c)?.25:/[A-ZÀ-Ý]/.test(c)?.66:.51),0)*size;
 const text=(value,y,size=12,color=white,bold=false)=>{
  value=String(value??'');size=Math.min(size,690/Math.max(1,width(value,1)));
  const x=Math.max(55,(W-width(value,size))/2);
  ops.push(`BT /${bold?'F2':'F1'} ${size.toFixed(2)} Tf ${color} rg 1 0 0 1 ${x.toFixed(2)} ${y} Tm <${hex(value)}> Tj ET`);
 };
 const wrap=(value,y,size=12,max=92,color=white,bold=false)=>{
  let row='',rows=[];for(const word of String(value).split(/\s+/)){if((row+' '+word).length>max&&row){rows.push(row);row=word}else row+=(row?' ':'')+word}if(row)rows.push(row);
  rows.slice(0,3).forEach((v,i)=>text(v,y-i*(size+5),size,color,bold));return y-rows.length*(size+5);
 };
 ops.push(`0.03 0.045 0.05 rg 0 0 ${W} ${H} re f`);
 ops.push('0.24 0.28 0.3 RG 2 w 38 22 m 804 22 l 820 38 l 820 557 l 804 573 l 38 573 l 22 557 l 22 38 l h S');
 ops.push(`${lime} RG 1.3 w 47 34 m 795 34 l 808 47 l 808 548 l 795 561 l 47 561 l 34 548 l 34 47 l h S`);
 for(const x of [135,707])for(let r=30;r<=90;r+=15){
  const k=r*.5522848,y=400;
  ops.push(`0.12 0.16 0.17 RG .6 w ${x+r} ${y} m ${x+r} ${y+k} ${x+k} ${y+r} ${x} ${y+r} c ${x-k} ${y+r} ${x-r} ${y+k} ${x-r} ${y} c ${x-r} ${y-k} ${x-k} ${y-r} ${x} ${y-r} c ${x+k} ${y-r} ${x+r} ${y-k} ${x+r} ${y} c S`);
 }
 text('A C A D E M I A   D O   C A O S',523,12);
 ops.push(`${lime} RG 4 w 421 488 m 450 477 l 450 446 l 421 421 l 392 446 l 392 477 l h S`);
 ops.push(`${lime} rg 401 442 m 421 481 l 441 442 l 429 442 l 421 460 l 413 442 l h f`);
 text('CERTIFICADO',382,34,white,true);text('DE CONCLUSÃO',344,34,white,true);
 line(381,328,461,328,lime,1.4);
 text('Certificamos que',308,12);text(s.name,285,23,lime,true);
 text(`RA ${s.ra} · concluiu com êxito ${s.module==='Formação completa'?'o curso':'o módulo'}`,264,11);
 wrap(s.module==='Formação completa'?s.course:s.module,240,17,65,lime,true);
 if(s.module!=='Formação completa')text('Curso: '+s.course,202,10,muted);
 text(`Carga horária: ${Number(s.hours).toLocaleString('pt-BR')} horas · Aproveitamento: ${s.score==null?'registrado':s.score+'%'}`,182,12,lime,true);
 text('Formação e conscientização em segurança digital.',160,11);
 text('DATA DE CONCLUSÃO: '+new Date(s.issued).toLocaleDateString('pt-BR'),132,10);
 text('CÓDIGO DO CERTIFICADO: '+s.code,114,10,lime,true);
 text('REGISTRO ELETRÔNICO · '+s.issuer,88,9,muted);
 text('Verifique a autenticidade no endereço abaixo:',69,8,muted);
 text(verify,53,8,white);
 const stream=ops.join('\n');
 const objects=[
  '<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R /Annots [7 0 R] >>`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  `<< /Type /Annot /Subtype /Link /Rect [45 43 797 80] /Border [0 0 0] /A << /S /URI /URI <${hex(verify)}> >> >>`,
 ];
 let pdf='%PDF-1.4\n',offsets=[0];
 objects.forEach((o,i)=>{offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${o}\nendobj\n`});
 const start=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
 pdf+=offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
 pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
 return new TextEncoder().encode(pdf);
}
