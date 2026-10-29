(()=>{'use strict';
const origin='https://player.vimeo.com';
const basicVideos=Object.freeze({
 'pilot-l1':{id:'1240759740',hash:'94c62529b7',number:'01'},
 'pilot-l2':{id:'1240759697',hash:'5209f45e77',number:'02'},
 'pilot-l3':{id:'1240759742',hash:'acd99189ac',number:'03'},
 'pilot-l4':{id:'1240759746',hash:'00d17b69d2',number:'04'},
 'pilot-l5':{id:'1240759756',hash:'1475053a38',number:'05'},
 'pilot-l6':{id:'1240759701',hash:'f61ec9af87',number:'06'},
 'pilot-l7':{id:'1240759699',hash:'dcaaaa4c6b',number:'07'},
 'pilot-l8':{id:'1240759698',hash:'a7469a7845',number:'08'}
});
let sdkPromise;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function forLesson(course,lesson){if(course!=='cyber-pilot'||!Object.hasOwn(basicVideos,lesson))return null;const video=basicVideos[lesson];return {url:origin+'/video/'+video.id+'?h='+video.hash+'&dnt=1&title=0&byline=0&portrait=0',publicUrl:'https://vimeo.com/'+video.id+'/'+video.hash,title:'Videoaula '+video.number+' - Segurança Digital na Prática'};}
function markup(media,course,lesson){return '<div class="vimeo-lesson-wrap"><iframe id="lessonVimeo" class="lesson-player vimeo-lesson" src="'+esc(media.url)+'" title="'+esc(media.title)+'" data-course="'+esc(course)+'" data-lesson="'+esc(lesson)+'" data-position="0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p id="vimeoPlaybackError" class="inline-alert" role="alert" hidden></p>';}
function loadSdk(){
 if(window.Vimeo?.Player)return Promise.resolve(window.Vimeo);
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=origin+'/api/player.js';script.async=true;
  const timeout=setTimeout(()=>{script.remove();reject(Error('Vimeo indisponível. Atualize a página e tente novamente.'));},15000);
  script.onload=()=>{clearTimeout(timeout);window.Vimeo?.Player?resolve(window.Vimeo):reject(Error('Não foi possível iniciar o player do Vimeo.'));};
  script.onerror=()=>{clearTimeout(timeout);script.remove();reject(Error('Não foi possível carregar o Vimeo. Confira sua conexão e tente novamente.'));};
  document.head.append(script);
 }).catch(error=>{sdkPromise=null;throw error;});
 return sdkPromise;
}
function mount(frame,{resume=0,onTime=()=>{},onPause=()=>{},onEnded=()=>{},onError=()=>{}}={}){
 let player,disposed=false,restored=false,restoring=false;
 frame.dataset.position=String(Number.isFinite(resume)&&resume>0?resume:0);
 const live=()=>!disposed&&frame.isConnected;
 const report=error=>{if(live())onError(error?.message||'Não foi possível reproduzir este vídeo no Vimeo.');};
 const ready=loadSdk().then(async api=>{
  if(!live())return;
  player=new api.Player(frame);
  // Seeking before play can start Vimeo playback. Restore only after the learner presses Play.
  player.on('play',async()=>{if(restored||!live())return;restored=true;restoring=true;try{const duration=await player.getDuration();if(live()&&resume>0&&resume<duration-3)await player.setCurrentTime(resume);}catch(error){report(error);}finally{restoring=false;}});
  player.on('timeupdate',data=>{if(!live()||!restored||restoring||!Number.isFinite(data.seconds)||data.seconds<0)return;frame.dataset.position=String(data.seconds);onTime(data.seconds);});
  player.on('pause',()=>{if(live()&&restored&&!restoring)onPause();});
  player.on('ended',()=>{if(live()&&restored&&!restoring)onEnded();});
  player.on('error',report);
  await player.ready();
 }).catch(report);
 return {ready,destroy(){disposed=true;if(player)Promise.resolve(player.destroy()).catch(()=>{});}};
}
window.AcademyLessonMedia=Object.freeze({forLesson,markup,mount});
})();
