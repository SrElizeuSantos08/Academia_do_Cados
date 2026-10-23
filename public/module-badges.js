(() => {
  'use strict';

  const names = [
    ['Mente Fria', 'mente-fria'],
    ['Guardião dos Anexos', 'guardiao-dos-anexos'],
    ['Identidade Confirmada', 'identidade-confirmada'],
    ['Dupla Proteção', 'dupla-protecao'],
    ['Caçador de Ciladas', 'cacador-de-ciladas'],
    ['Fonte Confiável', 'fonte-confiavel'],
    ['Acesso sob Controle', 'acesso-sob-controle'],
    ['Resposta Rápida', 'resposta-rapida'],
  ];
  const badges = Object.freeze(names.map(([name, slug], index) => Object.freeze({
    name,
    number: String(index + 1).padStart(2, '0'),
    module: 'pilot-m' + (index + 1),
    image: '/assets/badges/modulo-' + String(index + 1).padStart(2, '0') + '-' + slug + '.webp',
  })));
  const verification = '<span class="ac-badge-verified"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/><path d="m8 12 3 3 5-6"/></svg>Selo conquistado</span>';

  function forModule(courseId, moduleId) {
    return courseId === 'cyber-pilot' ? badges.find(badge => badge.module === moduleId) : undefined;
  }

  function isComplete(module, getProgress) {
    return Boolean(module?.lessons?.length && module.lessons.every(lesson => getProgress(lesson.id)?.done));
  }

  function card(badge) {
    if (!badge) return '';
    return `<article class="ac-badge-card"><div class="ac-badge-art"><img src="${badge.image}" width="128" height="128" loading="lazy" decoding="async" alt="Selo ${badge.name}"></div><div class="ac-badge-details">${verification}<small>Módulo ${badge.number} concluído</small><h3>${badge.name}</h3></div></article>`;
  }

  function celebrate(badge, {onContinue, onDismiss, continueLabel = 'Continuar aprendizado', description = 'Você concluiu todas as aulas deste módulo. Esta conquista faz parte do seu progresso.'} = {}) {
    if (!badge) return;
    const dialog = document.createElement('dialog');
    dialog.className = 'ac-achievement-dialog';
    dialog.setAttribute('aria-labelledby', 'ac-achievement-title');
    dialog.setAttribute('aria-describedby', 'ac-achievement-description');
    dialog.innerHTML = `<button type="button" class="ac-achievement-close" aria-label="Fechar conquista">×</button><div class="ac-achievement-kicker">UMA NOVA CONQUISTA</div><img class="ac-achievement-image" src="${badge.image}" width="280" height="280" alt="Selo ${badge.name}">${verification}<p class="ac-achievement-module">Módulo ${badge.number} concluído</p><h2 id="ac-achievement-title">${badge.name}</h2><p id="ac-achievement-description"></p><button type="button" class="ac-achievement-continue" autofocus></button>`;
    dialog.querySelector('#ac-achievement-description').textContent = description;
    dialog.querySelector('.ac-achievement-continue').textContent = continueLabel;
    dialog.querySelector('.ac-achievement-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.ac-achievement-continue').addEventListener('click', () => dialog.close('continue'));
    dialog.addEventListener('close', () => {
      const proceed = dialog.returnValue === 'continue';
      dialog.remove();
      if (proceed) onContinue?.();
      else onDismiss?.();
    }, {once: true});
    document.body.append(dialog);
    dialog.showModal();
    return dialog;
  }

  window.AcademyBadges = Object.freeze({forModule, forIndex: index => badges[index], isComplete, card, celebrate});
})();
