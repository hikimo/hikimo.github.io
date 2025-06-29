// Theme Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme');

  const updateTheme = (isDark) => {
    htmlEl.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  if (savedTheme) {
    updateTheme(savedTheme === 'dark');
  } else {
    // Default to dark mode if no theme is saved
    updateTheme(true);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = htmlEl.classList.contains('dark');
    updateTheme(!isDark);
    themeToggle.classList.add('animate-theme-switch');
    setTimeout(() => themeToggle.classList.remove('animate-theme-switch'), 500);
  });
}

function initSettingsModal() {
  const settings = {
    theme: 'system',
    animations: true,
    background3d: true,
    ...JSON.parse(localStorage.getItem('portfolioSettings'))
  };

  const overlay = document.getElementById('settings-modal-overlay');
  const openBtn = document.getElementById('settings-toggle');
  const closeBtn = document.getElementById('settings-close-btn');

  const themeSetting = document.getElementById('theme-setting');
  const backgroundToggle = document.getElementById('background-toggle');

  const htmlEl = document.documentElement;
  const canvasContainer = document.getElementById('canvas-container');

  function saveSettings() {
    localStorage.setItem('portfolioSettings', JSON.stringify(settings));
  }

  function applySettings() {
    // Apply theme
    if (settings.theme === 'system') {
      // If no theme in localStorage, default to dark
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        htmlEl.classList.add('dark');
      } else {
        htmlEl.classList.toggle('dark', savedTheme === 'dark');
      }
    } else {
      htmlEl.classList.toggle('dark', settings.theme === 'dark');
    }
    document.querySelector(`#theme-setting button[data-theme="${settings.theme}"]`).classList.add('bg-white', 'dark:bg-gray-900', 'shadow');


    // Apply 3D background
    if (canvasContainer) {
      canvasContainer.style.display = settings.background3d ? 'block' : 'none';
    }
    backgroundToggle.classList.toggle('bg-blue-500', settings.background3d);
    backgroundToggle.querySelector('span').style.transform = settings.background3d ? 'translateX(24px)' : 'translateX(0px)';

  }

  function updateTheme(theme) {
    document.querySelector(`#theme-setting button.bg-white`).classList.remove('bg-white', 'dark:bg-gray-900', 'shadow');
    settings.theme = theme;
    saveSettings();
    applySettings();
  }


  openBtn.addEventListener('click', () => overlay.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.add('hidden');
    }
  });

  themeSetting.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      updateTheme(e.target.dataset.theme);
    }
  });

  backgroundToggle.addEventListener('click', () => {
    settings.background3d = !settings.background3d;
    saveSettings();
    applySettings();
  });

  applySettings();
}


// Enhanced Three.js Background with 3D Effects
let scene, camera, renderer, particles, geometries = [];
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Create multiple particle systems
  createParticleSystem();
  createFloatingGeometry();

  camera.position.z = 1000;
  animate();
}

function createParticleSystem() {
  const geometry = new THREE.BufferGeometry();
  const particleCount = 1500;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 2000;
    positions[i3 + 1] = (Math.random() - 0.5) * 2000;
    positions[i3 + 2] = (Math.random() - 0.5) * 2000;

    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.4 + 0.5, 0.7, 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 5 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function createFloatingGeometry() {
  const shapes = [
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.SphereGeometry(15, 8, 6),
    new THREE.ConeGeometry(10, 20, 6),
    new THREE.CylinderGeometry(8, 8, 20, 6)
  ];

  for (let i = 0; i < 15; i++) {
    const geometry = shapes[Math.floor(Math.random() * shapes.length)];
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.4 + 0.5, 0.7, 0.5),
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    geometries.push(mesh);
    scene.add(mesh);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.0005;

  // Animate particles
  if (particles) {
    particles.rotation.x = time * 0.1;
    particles.rotation.y = time * 0.2;
    particles.rotation.x += (mouseY - particles.rotation.x) * 0.05;
    particles.rotation.y += (mouseX - particles.rotation.y) * 0.05;
  }

  // Animate floating geometries
  geometries.forEach((geo, index) => {
    geo.rotation.x += 0.01 + index * 0.001;
    geo.rotation.y += 0.01 + index * 0.001;
    geo.position.y += Math.sin(time + index) * 0.5;
  });

  renderer.render(scene, camera);
}

// Enhanced Mouse Movement Tracking
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) * 0.0005;
  mouseY = (event.clientY - windowHalfY) * 0.0005;
});

// Smooth Scrolling and Enhanced Animations
function isElementInViewport(el, threshold = 0.1) {
  const rect = el.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top <= windowHeight * (1 - threshold) && rect.bottom >= windowHeight * threshold;
}

function handleScrollAnimations() {
  const sections = document.querySelectorAll('.section');
  const skillCards = document.querySelectorAll('.skill-card');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const statCards = document.querySelectorAll('.stat-card');

  // Animate sections
  sections.forEach(section => {
    if (isElementInViewport(section, 0.3)) {
      section.classList.add('visible');
    }
  });

  // Animate skill cards with staggered delay
  skillCards.forEach((card, index) => {
    if (isElementInViewport(card, 0.2)) {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * 100);
    }
  });

  // Animate timeline items
  timelineItems.forEach((item, index) => {
    if (isElementInViewport(item, 0.2)) {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 150);
    }
  });

  // Animate portfolio cards
  portfolioCards.forEach((card, index) => {
    if (isElementInViewport(card, 0.2)) {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * 100);
    }
  });

  // Animate stat cards
  statCards.forEach((card, index) => {
    if (isElementInViewport(card, 0.2)) {
      setTimeout(() => {
        card.classList.add('animate-in');
        animateNumbers(card);
      }, index * 100);
    }
  });
}

// Number Animation
function animateNumbers(element) {
  if (element.dataset.animated) return;
  element.dataset.animated = true;

  const numberEl = element.querySelector('.stat-number');
  const finalValue = numberEl.textContent;
  const isPlus = finalValue.includes('+');
  const isPercent = finalValue.includes('%');
  const targetNumber = parseInt(finalValue.replace(/\D/g, ''));

  if (isNaN(targetNumber)) return;

  let startTimestamp = null;
  const duration = 2000;

  const step = (timestamp) => {
    if (document.documentElement.classList.contains('animations-disabled')) {
      numberEl.textContent = finalValue;
      return;
    }

    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * targetNumber);

    if (isPlus) {
      numberEl.textContent = currentValue + '+';
    } else if (isPercent) {
      numberEl.textContent = currentValue + '%';
    } else {
      numberEl.textContent = currentValue;
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      numberEl.textContent = finalValue;
    }
  };

  requestAnimationFrame(step);
}

// Enhanced Header Scroll Effect
function handleHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  const scrolled = window.scrollY > 10;
  header.classList.toggle('scrolled', scrolled);
}

// Navigation Management
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const headerHeight = 80;
  const scrollPosition = window.scrollY + headerHeight + 100; // Add offset for better detection

  let activeSection = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionBottom = sectionTop + sectionHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      activeSection = section.id;
    }
  });

  // If we're at the very top, make home active
  if (scrollPosition < 100) {
    activeSection = 'home';
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${activeSection}`) {
      link.classList.add('active');
    }
  });
}

// Smooth Scrolling for Navigation
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = 80;
        const targetPosition = target.offsetTop - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = mobileMenu.querySelectorAll('a');

  toggleBtn.addEventListener('click', () => {
    const isClosed = mobileMenu.classList.contains('max-h-0');
    mobileMenu.classList.toggle('max-h-0', !isClosed);
    mobileMenu.classList.toggle('max-h-96', isClosed);
    const icon = toggleBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('max-h-0');
      mobileMenu.classList.remove('max-h-96');
      const icon = toggleBtn.querySelector('i');
      icon.classList.add('fa-bars');
      icon.classList.remove('fa-times');
    });
  });
}

// Enhanced Magic Particles for Photo
function createMagicParticles() {
  const photoContainer = document.querySelector('#photo-container');

  if (photoContainer) {
    photoContainer.addEventListener('mouseenter', () => {
      const particles = photoContainer.querySelectorAll('.animate-float');
      particles.forEach(particle => {
        particle.style.animationPlayState = 'running';
      });
    });

    photoContainer.addEventListener('mouseleave', () => {
      const particles = photoContainer.querySelectorAll('.animate-float');
      particles.forEach(particle => {
        particle.style.animationPlayState = 'paused';
      });
    });
  }
}

// Window Resize Handler
function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Intersection Observer for Performance
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stat-card')) {
          animateNumbers(entry.target);
        }
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.section, .skill-card, .portfolio-card, .stat-card').forEach(el => {
    observer.observe(el);
  });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  trackResourceLoading();
  initLanguage();
  initThemeToggle();
  initSettingsModal();
  initThreeJS();
  initSmoothScrolling();
  initMobileMenu();
  createMagicParticles();
  initIntersectionObserver();
  initLazyLoading();
  monitorPerformance();

  // Initial call to set active nav
  updateActiveNavLink();
});

// Event Listeners
window.addEventListener('scroll', () => {
  handleScrollAnimations();
  handleHeaderScroll();
  updateActiveNavLink();
});

window.addEventListener('resize', onWindowResize);

// Preload animations
window.addEventListener('load', () => {
  handleScrollAnimations();
});

// Performance and Loading Management
let loadingProgress = 0;
let resourcesLoaded = 0;
const totalResources = 5; // Simplified resource count

function updateLoadingProgress(progress, message) {
  loadingProgress = progress;
  const progressBar = document.getElementById('loading-progress-bar');
  const loadingText = document.querySelector('.loading-text');

  if (progressBar) {
    progressBar.style.width = progress + '%';
  }

  if (loadingText && message) {
    loadingText.textContent = message;
  }
}

function resourceLoaded(message) {
  resourcesLoaded++;
  const progress = Math.min((resourcesLoaded / totalResources) * 100, 100);
  updateLoadingProgress(progress, message);

  if (resourcesLoaded >= totalResources) {
    setTimeout(() => {
      hideLoadingScreen();
    }, 500);
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  const body = document.body;

  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }

  body.classList.remove('loading');
  body.classList.add('font-loaded');

  // Remove loading screen from DOM after animation
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.remove();
    }
  }, 500);
}

// Simplified resource tracking
function trackResourceLoading() {
  // Start with initial message
  updateLoadingProgress(0, 'Initializing...');

  // Track DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      resourceLoaded('Loading styles and fonts...');
    });
  } else {
    resourceLoaded('Loading styles and fonts...');
  }

  // Track window load
  if (document.readyState === 'complete') {
    resourceLoaded('Preparing 3D background...');
  } else {
    window.addEventListener('load', () => {
      resourceLoaded('Preparing 3D background...');
    });
  }

  // Track Three.js
  const checkThreeJS = setInterval(() => {
    if (typeof THREE !== 'undefined') {
      clearInterval(checkThreeJS);
      resourceLoaded('Setting up animations...');
    }
  }, 100);

  // Track profile image
  const profileImg = document.querySelector('#photo-container img');
  if (profileImg) {
    if (profileImg.complete) {
      resourceLoaded('Loading profile image...');
    } else {
      profileImg.addEventListener('load', () => {
        resourceLoaded('Loading profile image...');
      });
      profileImg.addEventListener('error', () => {
        resourceLoaded('Loading profile image...');
      });
    }
  } else {
    resourceLoaded('Loading profile image...');
  }

  // Final step
  setTimeout(() => {
    resourceLoaded('Almost ready...');
  }, 1000);
}

// Optimize Three.js for performance
function optimizeThreeJS() {
  if (typeof THREE !== 'undefined') {
    // Reduce particle count for better performance
    const particleCount = window.innerWidth < 768 ? 800 : 1500;

    // Reduce geometry count for mobile
    const geometryCount = window.innerWidth < 768 ? 8 : 15;

    return { particleCount, geometryCount };
  }
  return { particleCount: 1500, geometryCount: 15 };
}

// Intersection Observer for lazy loading
function initLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Performance monitoring
function monitorPerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
      }, 0);
    });
  }
}

function initLanguage() {
  // Check URL parameters for language
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');

  // Check localStorage for saved language preference
  const savedLang = localStorage.getItem('language');

  // Check browser language
  const browserLang = navigator.language.startsWith('id') ? 'id' : 'en';

  // Set language priority: URL param > localStorage > browser > default
  if (langParam && (langParam === 'en' || langParam === 'id')) {
    currentLanguage = langParam;
  } else if (savedLang && (savedLang === 'en' || savedLang === 'id')) {
    currentLanguage = savedLang;
  } else {
    currentLanguage = browserLang;
  }

  updateLanguage();
}

// Language Toggle Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();

  // Language dropdown buttons
  document.querySelectorAll('[data-lang]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = button.getAttribute('data-lang');
      switchLanguage(lang);
    });
  });

  // Language dropdown open/close on click
  const langToggle = document.getElementById('language-toggle');
  const langDropdown = document.getElementById('language-dropdown');
  let langDropdownOpen = false;

  function openLangDropdown() {
    langDropdown.classList.remove('opacity-0', 'invisible');
    langDropdown.classList.add('opacity-100', 'visible');
    langDropdownOpen = true;
  }
  function closeLangDropdown() {
    langDropdown.classList.add('opacity-0', 'invisible');
    langDropdown.classList.remove('opacity-100', 'visible');
    langDropdownOpen = false;
  }
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (langDropdownOpen) {
      closeLangDropdown();
    } else {
      openLangDropdown();
    }
  });
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (langDropdownOpen) {
      closeLangDropdown();
    }
  });
  // Optional: close on Escape key
  document.addEventListener('keydown', (e) => {
    if (langDropdownOpen && e.key === 'Escape') {
      closeLangDropdown();
    }
  });
});

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'rotate': 'rotate 4s linear infinite',
        'slide-down': 'slideDown 0.8s ease forwards',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'theme-switch': 'themeSwitch 0.5s ease-in-out',
      },
      backdropBlur: {
        'xs': '2px',
      },
      colors: {
        'primary': {
          'start': '#667eea',
          'end': '#764ba2',
        },
        'secondary': {
          'start': '#f093fb',
          'end': '#f5576c',
        },
        'accent': {
          'start': '#4facfe',
          'end': '#00f2fe',
        }
      }
    }
  }
}

// Elegant Reveal on Scroll
function initRevealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 }); // Lower threshold for earlier reveal
  revealEls.forEach(el => observer.observe(el));
}

// Fun Fact Interactivity with 3D effect
const funFacts = [
  "Fun fact: Rangga owns an owl, snakes, monitor lizards, iguanas, predator fish, and cats. His home feels more like a private zoo.",
  "Did you know? Rangga wants to build an MVP all by himself, not as a team, but as a proud solo product.",
  "Did you know? Rangga has an Upwork account with zero jobs so far—but he's still coding like the next big thing is one push away.",
  "Fun fact: Rangga loves coffee, but his stomach sometimes disagrees. Still, he keeps sipping like code depends on it.",
];
let funFactIdx = 0;
function showNextFunFact() {
  const card = document.getElementById('fun-fact-card');
  if (!card) return;
  card.classList.add('flipped');
  setTimeout(() => {
    funFactIdx = (funFactIdx + 1) % funFacts.length;
    card.textContent = funFacts[funFactIdx];
    card.classList.remove('flipped');
    card.classList.add('tilted');
    setTimeout(() => card.classList.remove('tilted'), 700);
  }, 250);
}
document.addEventListener('DOMContentLoaded', () => {
  initRevealOnScroll();
  const funFactCard = document.getElementById('fun-fact-card');
  if (funFactCard) {
    funFactCard.addEventListener('click', showNextFunFact);
    funFactCard.addEventListener('keypress', e => { if (e.key === 'Enter') showNextFunFact(); });
    funFactCard.addEventListener('mousemove', e => {
      // Subtle tilt on mouse move
      const rect = funFactCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (x - centerX) / 18;
      const rotateX = -(y - centerY) / 18;
      funFactCard.style.transform = `perspective(600px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    });
    funFactCard.addEventListener('mouseleave', () => {
      funFactCard.style.transform = '';
    });
  }
});

// Prefill contact form subject from URL
function prefillContactSubject() {
  const hash = window.location.hash;
  if (hash.startsWith('#contact')) {
    const params = new URLSearchParams(hash.split('?')[1] || '');
    const subject = params.get('subject');
    if (subject) {
      const subjectInput = document.querySelector('section#contact input[name="subject"]');
      if (subjectInput) {
        subjectInput.value = decodeURIComponent(subject);
      }
    }
  }
}
window.addEventListener('DOMContentLoaded', prefillContactSubject);
window.addEventListener('hashchange', prefillContactSubject);

// Ensure smooth scroll and prefill when clicking service card 'Get in Touch'
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#contact?subject="]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const href = btn.getAttribute('href');
      // Update the hash (triggers prefillContactSubject)
      window.location.hash = href;
      // Wait a tick for DOM update, then scroll
      setTimeout(function () {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 10);
    });
  });
});