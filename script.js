/* ==========================================
   SCRIPT.JS — Animations & Interactions
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {

// ---- PARTICULES INTERACTIVES ----
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const mouse = { x: -9999, y: -9999, active: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => { mouse.active = false; });

  const PARTICLE_COUNT = 80;
  const MOUSE_RADIUS = 140;
  const particles = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.15,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Halo lumineux autour du curseur
    if (mouse.active) {
      const grd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 1.5);
      grd.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      grd.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connexions
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Ligne vers le curseur si proche
      if (mouse.active) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_RADIUS) {
          const opacity = 0.3 * (1 - mdist / MOUSE_RADIUS);
          ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.07 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Points + physique souris
    particles.forEach(p => {
      // Répulsion curseur
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.vx += (dx / dist) * force * 0.18;
          p.vy += (dy / dist) * force * 0.18;
        }
      }

      // Friction + vitesse max
      p.vx *= 0.97;
      p.vy *= 0.97;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 3) { p.vx *= 3 / speed; p.vy *= 3 / speed; }

      p.x += p.vx;
      p.y += p.vy;

      // Glow si la particule va vite
      const dynamicAlpha = Math.min(p.alpha + speed * 0.12, 1);
      if (speed > 0.8) { ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(56, 189, 248, 0.9)'; }
      else { ctx.shadowBlur = 0; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${dynamicAlpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    requestAnimationFrame(draw);
  }

  draw();

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();

// ---- COMPTEURS ANIMÉS ----
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ---- BARRES DE PROGRESSION ----
function animateProgress(bar) {
  const width = bar.dataset.width;
  setTimeout(() => {
    bar.style.width = width + '%';
  }, 200);
}

// ---- SCROLL REVEAL ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Compteurs
      entry.target.querySelectorAll('[data-count]').forEach(el => animateCounter(el));

      // Barres
      entry.target.querySelectorAll('.progress-fill').forEach(bar => animateProgress(bar));

      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.project-card, .skill-row, .proc-card, .veille-card, .veille-featured, .veille-mini, .veille-timeline, .skill-tag, .pres-text, .pres-skills, .hero-stats, .terminal-deco').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Observer pour hero stats (compteurs)
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count]').forEach(el => animateCounter(el));
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// Délai en cascade pour les cartes
document.querySelectorAll('.project-card, .proc-card, .veille-card, .skill-tag').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.07}s`;
});

// ---- ONGLETS VEILLE ----
const vtopics = document.querySelectorAll('.vtopic');
const vpanels = document.querySelectorAll('.veille-panel');

vtopics.forEach(pill => {
  pill.addEventListener('click', () => {
    const target = pill.dataset.topic;

    // Maj pills
    vtopics.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    // Maj panels
    vpanels.forEach(panel => {
      if (panel.dataset.panel === target) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  });
});

// ---- MENU MOBILE ----
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ---- EFFET PARALLAXE LÉGER SUR LE HERO ----
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero-inner');
  if (hero && scrolled < window.innerHeight) {
    hero.style.transform = `translateY(${scrolled * 0.15}px)`;
    hero.style.opacity = 1 - scrolled / 700;
  }
});

// ---- CURSOR CUSTOM (desktop seulement) ----
if (window.innerWidth > 768) {
  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; width: 8px; height: 8px;
    background: #38bdf8; border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s;
    mix-blend-mode: screen;
  `;

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed; width: 30px; height: 30px;
    border: 1px solid rgba(56,189,248,0.4); border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: all 0.15s ease;
  `;

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .project-card, .veille-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'rgba(56,189,248,0.8)';
      dot.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '30px';
      ring.style.height = '30px';
      ring.style.borderColor = 'rgba(56,189,248,0.4)';
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

}); // fin DOMContentLoaded
