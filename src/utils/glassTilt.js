/* glassTilt.js
   Hover effect on [data-tilt] elements:
   - card floats up on enter
   - tilts following cursor (max ±8°)
   - moving specular highlight (light refraction)
   - smooth spring-like return on leave
*/

const LIFT    = -7;    // px, how much card rises on hover
const MAX_ROT = 8;     // degrees max tilt
const PERSP   = '900px';

export function initGlassTilt() {
  let active = null;

  function enter(el) {
    active = el;
    el.style.willChange = 'transform';
    el.style.setProperty('--shine-opacity', '1');
    el.style.transition = `transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)`;
    el.style.transform  = `perspective(${PERSP}) rotateX(0deg) rotateY(0deg) translateY(${LIFT}px) scale(1.012)`;
  }

  function move(el, e) {
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left)  / r.width;   // 0–1
    const y  = (e.clientY - r.top)   / r.height;  // 0–1
    const rx = (y - 0.5) * -MAX_ROT;
    const ry = (x - 0.5) *  MAX_ROT;
    el.style.transition = 'transform 0.07s linear';
    el.style.transform  = `perspective(${PERSP}) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${LIFT}px) scale(1.014)`;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
  }

  function leave(el) {
    el.style.setProperty('--shine-opacity', '0');
    el.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.9, 0.2, 1)';
    el.style.transform  = `perspective(${PERSP}) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)`;
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
    active = null;
  }

  function onMouseMove(e) {
    const el = e.target.closest('[data-tilt]');
    if (!el) {
      if (active) leave(active);
      return;
    }
    if (el !== active) enter(el);
    move(el, e);
  }

  function onMouseOut(e) {
    if (!active) return;
    // fire only when truly leaving the tilt element, not its children
    if (!active.contains(e.relatedTarget)) leave(active);
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseout',  onMouseOut,  { passive: true });

  // cleanup function for React useEffect
  return () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseout',  onMouseOut);
  };
}
