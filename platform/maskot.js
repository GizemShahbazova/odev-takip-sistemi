(() => {
  const mascot = document.querySelector('.platform-mascot');
  if (!mascot) return;

  const home = mascot.closest('#platform-home');
  const eye = mascot.querySelector('.mascot-eye');
  const greetingImage = mascot.querySelector('.mascot-greeting-base');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame = 0;
  let greetingTimer = 0;
  let pointerX = 0;
  let pointerY = 0;

  function enableGreeting() {
    if (greetingImage.naturalWidth > 0) mascot.classList.add('can-greet');
  }
  greetingImage.addEventListener('load', enableGreeting, { once: true });
  if (greetingImage.complete) enableGreeting();

  function updateGaze() {
    animationFrame = 0;
    const bounds = eye.getBoundingClientRect();
    if (!bounds.width || bounds.bottom < 0 || bounds.top > window.innerHeight) return;

    const dx = pointerX - (bounds.left + bounds.width / 2);
    const dy = pointerY - (bounds.top + bounds.height / 2);
    const divisor = Math.max(110, Math.hypot(dx, dy));
    eye.style.setProperty('--gaze-x', (dx / divisor * bounds.width * .20).toFixed(2) + 'px');
    eye.style.setProperty('--gaze-y', (dy / divisor * bounds.height * .16).toFixed(2) + 'px');
    mascot.classList.add('is-tracking');
  }

  function resetGaze() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    mascot.classList.remove('is-tracking');
  }

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || reducedMotion.matches || home.hidden) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!animationFrame) animationFrame = requestAnimationFrame(updateGaze);
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', resetGaze);
  window.addEventListener('blur', resetGaze);
  reducedMotion.addEventListener('change', resetGaze);

  mascot.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') mascot.classList.add('is-hovered');
  });
  const endHover = () => mascot.classList.remove('is-hovered');
  mascot.addEventListener('pointerleave', endHover);
  mascot.addEventListener('pointercancel', endHover);

  mascot.addEventListener('click', () => {
    mascot.classList.add('is-greeting');
    clearTimeout(greetingTimer);
    greetingTimer = setTimeout(() => mascot.classList.remove('is-greeting'), 2600);
  });
})();
