// ============================================================================
// Portfolio - Modular JavaScript Architecture
// ============================================================================

/**
 * Utility Functions
 */
const Utils = {
  debounce(fn, delay = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  throttle(fn, limit = 1000) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  getScrollPercent() {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    return windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
  },
};

/**
 * Navigation Module
 */
const Navigation = {
  init() {
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navLinks = document.querySelector('.nav-links');

    this.menuToggle?.addEventListener('click', () => this.toggleMenu());

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    window.addEventListener('click', e => {
      if (!this.menuToggle?.contains(e.target) && !this.navLinks?.contains(e.target)) {
        this.closeMenu();
      }
    });
  },

  toggleMenu() {
    const isOpen = this.navLinks.classList.toggle('open');
    this.menuToggle.setAttribute('aria-expanded', String(isOpen));
  },

  closeMenu() {
    this.navLinks?.classList.remove('open');
    this.menuToggle?.setAttribute('aria-expanded', 'false');
  },
};

/**
 * Scroll Progress Bar Module
 */
const ScrollProgress = {
  init() {
    this.progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', Utils.throttle(() => this.update(), 16));
  },

  update() {
    if (!this.progressBar) return;
    this.progressBar.style.width = Utils.getScrollPercent() + '%';
  },
};

/**
 * Scroll Reveal Animation Module
 */
const ScrollReveal = {
  init() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  },
};

/**
 * Typing Animation Module
 */
const TypingAnimation = {
  init() {
    this.element = document.getElementById('typing-text');
    if (!this.element) return;

    const textVariations = [
      'AI Researcher | Machine Learning Engineer | Game AI Enthusiast',
      'Building Intelligent NPCs | Exploring Procedural Content Generation',
      'Passionate about Game AI and Reinforcement Learning',
      'Focused on AI-driven systems and adaptive gameplay',
    ];

    this.currentText = textVariations[Math.floor(Math.random() * textVariations.length)];
    this.type();
  },

  type() {
    let index = 0;
    const type = () => {
      if (index < this.currentText.length) {
        this.element.innerHTML = this.currentText.substring(0, index + 1) + '<span class="typing-cursor"></span>';
        index++;
        setTimeout(type, 50);
      } else {
        this.element.innerHTML = this.currentText + '<span class="typing-cursor"></span>';
        setTimeout(() => this.erase(), 2500);
      }
    };
    type();
  },

  erase() {
    let index = this.currentText.length;
    const erase = () => {
      if (index > 0) {
        this.element.innerHTML = this.currentText.substring(0, index - 1) + '<span class="typing-cursor"></span>';
        index--;
        setTimeout(erase, 30);
      } else {
        setTimeout(() => this.init(), 500);
      }
    };
    erase();
  },
};

/**
 * Enhanced Particle System Module
 */
const ParticleSystem = {
  canvas: null,
  ctx: null,
  particles: [],
  connectionDistance: 120,

  init() {
    this.canvas = document.getElementById('particles');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resizeCanvas();
    this.animate();

    window.addEventListener('resize', Utils.debounce(() => this.resizeCanvas(), 250));
  },

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createParticles();
  },

  createParticles() {
    const particleCount = Math.min(100, Math.floor(window.innerWidth / 15));
    this.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Keep in bounds
      particle.x = Utils.clamp(particle.x, 0, this.canvas.width);
      particle.y = Utils.clamp(particle.y, 0, this.canvas.height);

      // Draw particle
      this.ctx.fillStyle = `rgba(61, 210, 255, ${particle.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw connections
    this.drawConnections();
  },

  drawConnections() {
    this.ctx.strokeStyle = 'rgba(61, 210, 255, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          this.ctx.globalAlpha = 1 - distance / this.connectionDistance;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }
  },

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  },
};

/**
 * Project Filtering Module
 */
const ProjectFilter = {
  init() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter projects
        projectCards.forEach(card => {
          const category = card.dataset.category;
          const isVisible = this.activeFilter === 'all' || this.activeFilter === category;

          card.classList.toggle('hidden', !isVisible);
          if (isVisible) {
            card.style.animation = 'none';
            setTimeout(() => {
              card.style.animation = '';
            }, 10);
          }
        });
      });
    });
  },

  activeFilter: 'all',
};

/**
 * GitHub Contributions Module (Placeholder)
 */
const GitHubContributions = {
  init() {
    const graphContainer = document.getElementById('github-graph');
    if (!graphContainer) return;

    // Placeholder - in production, fetch from GitHub API
    graphContainer.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #b9cae9;">
        <p>🔗 Contribution graph loads from GitHub API</p>
        <p style="font-size: 0.9rem; margin-top: 1rem;">
          View my activity at <a href="https://github.com/Seiichi1" target="_blank" rel="noopener" style="color: #3dd2ff;">github.com/Seiichi1</a>
        </p>
      </div>
    `;
  },
};

/**
 * Initialize All Modules
 */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  ScrollProgress.init();
  ScrollReveal.init();
  TypingAnimation.init();
  ParticleSystem.init();
  ProjectFilter.init();
  GitHubContributions.init();

  // Performance optimization: lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
});
