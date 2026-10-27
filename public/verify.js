(async()=>{
 const el=document.getElementById('verify'),params=new URLSearchParams(location.search),cid=params.get('id');
 function render(snapshot,sample=false){
  el.className='';el.innerHTML=window.CaosCertificate(snapshot,cid||'',sample);
  const button=document.getElementById('verifyPrint');button.hidden=false;
  if(!sample){const download=document.createElement('a');download.className='btn secondary';download.href='/api/lms/certificates/'+encodeURIComponent(cid)+'/pdf';download.download='';download.textContent='Baixar certificado PDF ↓';button.before(download)}
  button.onclick=()=>{const dialog=document.createElement('dialog');dialog.innerHTML='<div id="dialogBody">'+window.CaosCertificate(snapshot,cid||'',sample)+'</div>';document.body.append(dialog);dialog.showModal();window.print();dialog.close();dialog.remove()};
 }
 if(params.get('modelo')){render({name:'Nome completo do aluno',ra:'AC-EXEMPLO',course:'Segurança Digital na Prática',module:'Formação completa',score:100,hours:2,level:'Básico',issued:new Date().toISOString(),code:'AC-MODELO'},true);return}
 if(!cid){el.textContent='Informe o identificador de um certificado para consultar o registro.';return}
 try{
  const r=await fetch('/api/lms/certificates/'+encodeURIComponent(cid)),data=await r.json();
  if(!r.ok){el.textContent=data.error||'Registro indisponível.';if(r.status===401){const a=document.createElement('a');a.className='btn secondary';a.textContent='Entrar para verificar';a.href='/login.html?space=student';a.target='_top';el.append(document.createElement('br'),a)}return}
  render(data.snapshot);
 }catch{el.textContent='Não foi possível consultar o certificado. Tente novamente.'}
})();
