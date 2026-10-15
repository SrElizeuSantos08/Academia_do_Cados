/* Motion enhancement: content and navigation remain usable without JavaScript. */
(()=>{
  const root=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  let preference=null;
  try{preference=localStorage.getItem('caos-motion')}catch{}
  let enabled=!reduce.matches&&preference!=='off';
  const animations=new Set();
  const control=document.createElement('button');
  control.className='motion-control';control.type='button';
  control.setAttribute('aria-label','Ativar ou pausar animações decorativas');
  document.body.append(control);
  const update=()=>{
    root.dataset.motion=enabled?'on':'off';
    control.textContent=enabled?'Ⅱ Pausar animações':'▷ Ativar animações';
    control.setAttribute('aria-pressed',String(enabled));
    if(!enabled){animations.forEach(a=>a.cancel());animations.clear();document.querySelectorAll('.hero-visual').forEach(el=>{el.style.removeProperty('--tilt-x');el.style.removeProperty('--tilt-y')})}
  };
  control.addEventListener('click',()=>{enabled=!enabled;preference=enabled?'on':'off';try{localStorage.setItem('caos-motion',preference)}catch{}update()});
  reduce.addEventListener('change',()=>{enabled=!reduce.matches&&preference!=='off';update()});
  update();
  function enter(el,delay=0,duration=650){
    if(!enabled||!el.animate)return;
    const animation=el.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
    animations.add(animation);animation.finished.then(()=>animations.delete(animation)).catch(()=>animations.delete(animation));
  }
  // Observe once, then release: no scroll listeners used for reveal effects.
  const targets=document.querySelectorAll('.intro>div,.section-heading,.course-feature,.method>h2,.steps article,.business-band,.faq>h2,.faq details,.company-hero>*,.company-topics>.eyebrow,.planner>div,.planner form,.overview,.sectionhead,.assessment,.certsection');
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){const siblings=[...entry.target.parentElement.children];enter(entry.target,Math.min(siblings.indexOf(entry.target),3)*65);reveal.unobserve(entry.target)}}),{threshold:.08});
    targets.forEach(el=>reveal.observe(el));
    const ambient=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:0});
    document.querySelectorAll('.hero-visual,.heroart,.course-art').forEach(el=>ambient.observe(el));
  }
  document.querySelectorAll('.hero-copy>*').forEach((el,i)=>enter(el,i*80,800));
  const panel=document.querySelector('.hero-visual');
  if(panel){
    enter(panel,180,900);
    let frame=0;
    panel.addEventListener('pointermove',event=>{
      if(!enabled||!fine.matches)return;
      const {clientX,clientY}=event;
      if(frame)cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{const box=panel.getBoundingClientRect();panel.style.setProperty('--tilt-x',((.5-(clientY-box.top)/box.height)*3).toFixed(2)+'deg');panel.style.setProperty('--tilt-y',(((clientX-box.left)/box.width-.5)*4).toFixed(2)+'deg');frame=0});
    });
    panel.addEventListener('pointerleave',()=>{if(frame)cancelAnimationFrame(frame);frame=0;panel.style.setProperty('--tilt-x','0deg');panel.style.setProperty('--tilt-y','0deg')});
  }
  // Course scenes animate only when changed by the existing lesson controls.
  if('MutationObserver' in window){
    ['scene','feedback','quizBody','briefResult'].forEach(id=>{const el=document.getElementById(id);if(!el)return;const observer=new MutationObserver(()=>{if(!el.hidden&&el.textContent.trim())enter(el,0,350)});observer.observe(el,{childList:true,attributes:true,attributeFilter:['hidden']})});
  }
  document.querySelectorAll('.faq details').forEach(el=>el.addEventListener('toggle',()=>{if(el.open){const p=el.querySelector('p');if(p)enter(p,0,280)}}));
  document.addEventListener('visibilitychange',()=>root.classList.toggle('motion-suspended',document.hidden));
})();
