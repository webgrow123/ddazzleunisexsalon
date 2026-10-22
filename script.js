(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const navLinks = nav.querySelectorAll('a');

  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
    document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLightbox();
    }
  });

  // Scroll reveals; content stays visible if IntersectionObserver is unavailable.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  // Set minimum booking date to today using local calendar date.
  const dateInput = document.querySelector('#date');
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  dateInput.min = localToday;

  // Service cards preselect the matching service in the enquiry form.
  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      const serviceSelect = document.querySelector('#service');
      const wanted = link.dataset.service;
      const option = [...serviceSelect.options].find(opt => opt.text === wanted);
      if (option) serviceSelect.value = option.value;
    });
  });

  const form = document.querySelector('#booking-form');
  const status = document.querySelector('#form-status');
  const fields = {
    name: document.querySelector('#full-name'),
    phone: document.querySelector('#phone'),
    service: document.querySelector('#service'),
    date: document.querySelector('#date'),
    time: document.querySelector('#time')
  };

  function setError(input, message) {
    const wrapper = input.closest('.field');
    wrapper.classList.toggle('invalid', Boolean(message));
    wrapper.querySelector('.error-message').textContent = message || '';
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
  function validate() {
    let valid = true;
    const name = fields.name.value.trim();
    const phone = fields.phone.value.trim().replace(/[\s()-]/g, '');
    const date = fields.date.value;
    const checks = [
      [fields.name, name.length >= 2 ? '' : 'Please enter your name.'],
      [fields.phone, /^(?:\+91)?[6-9]\d{9}$/.test(phone) ? '' : 'Enter a valid 10-digit Indian mobile number.'],
      [fields.service, fields.service.value ? '' : 'Please choose a service.'],
      [fields.date, date && date >= localToday ? '' : 'Choose today or a future date.'],
      [fields.time, fields.time.value ? '' : 'Please choose a preferred time.']
    ];
    checks.forEach(([input, error]) => {
      setError(input, error);
      if (error) valid = false;
    });
    return valid;
  }
  Object.values(fields).forEach(input => {
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('invalid')) validate();
    });
    input.addEventListener('change', () => {
      if (input.closest('.field').classList.contains('invalid')) validate();
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = '';
    if (!validate()) {
      status.textContent = 'Please check the highlighted fields.';
      const firstInvalid = form.querySelector('.field.invalid input, .field.invalid select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    const phone = fields.phone.value.trim();
    const message = [
      'Hello Ddazzle Unisex Salon! I would like to enquire about an appointment.',
      '',
      `Name: ${fields.name.value.trim()}`,
      `Mobile: ${phone}`,
      `Service: ${fields.service.value}`,
      `Preferred date: ${fields.date.value}`,
      `Preferred time: ${fields.time.value}`,
      `Message: ${document.querySelector('#message').value.trim() || 'None'}`,
      '',
      'I understand this is an appointment request and is not confirmed until the salon responds.'
    ].join('\n');
    const whatsappUrl = `https://wa.me/919653661417?text=${encodeURIComponent(message)}`;
    status.textContent = 'Opening WhatsApp with your enquiry. Please press Send in WhatsApp to complete the request.';
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow) {
      status.innerHTML = `Your browser blocked the new tab. <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">Tap here to open WhatsApp</a>.`;
    }
  });

  // Accessible image lightbox with previous/next and keyboard navigation.
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const galleryButtons = [...document.querySelectorAll('.gallery-item')];
  let activeImage = 0;
  let previousFocus = null;
  function openLightbox(index) {
    activeImage = index;
    previousFocus = document.activeElement;
    const button = galleryButtons[activeImage];
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = button.querySelector('img').alt;
    caption.textContent = button.querySelector('span').textContent;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox-close').focus();
  }
  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImage.src = '';
    if (previousFocus) previousFocus.focus();
  }
  function moveLightbox(direction) {
    openLightbox((activeImage + direction + galleryButtons.length) % galleryButtons.length);
  }
  galleryButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => moveLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  // Give remote images a graceful fallback if an image host is unavailable.
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const parent = img.parentElement;
      img.style.display = 'none';
      if (parent && !parent.querySelector('.image-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback';
        fallback.setAttribute('aria-label', 'Salon image unavailable');
        fallback.setAttribute('role', 'img');
        fallback.style.cssText = 'display:block;min-height:100%;height:100%;width:100%;background:radial-gradient(circle at 70% 25%,rgba(226,190,169,.5),transparent 26%),linear-gradient(135deg,#32152f 0%,#805a71 55%,#c9a994 100%);';
        parent.appendChild(fallback);
      }
    }, { once: true });
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
})();