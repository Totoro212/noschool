/**
 * No School of English — Main JavaScript
 * GitHub Pages Compatible: заявки → Telegram, звонки → tel:
 */

'use strict';

/* ======== КОНФИГУРАЦИЯ КОНТАКТОВ ======== */
const CONTACT_CONFIG = {
  usePhoneForTelegram: true,
  phoneNumber: '+998901878844',
  phoneDisplay: '+998 90 187 88 44',
  defaultMessage: 'Здравствуйте! Хочу узнать подробнее об онлайн-занятиях в No School of English.'
};

const getTelegramUrl = (messageText) => {
  const text = encodeURIComponent(messageText);
  if (CONTACT_CONFIG.usePhoneForTelegram || !CONTACT_CONFIG.telegramUsername) {
    const phone = CONTACT_CONFIG.phoneNumber.replace(/[^\d]/g, '');
    return `https://t.me/+${phone}?text=${text}`;
  }
  return `https://t.me/${CONTACT_CONFIG.telegramUsername}?text=${text}`;
};

document.addEventListener('DOMContentLoaded', () => {

  /* ======== CACHED DOM ELEMENTS ======== */
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  const header = $('header');
  const mobileToggle = $('mobileToggle');
  const navMenu = $('navMenu');
  const modal = $('consultationModal');
  const consultationForm = $('consultationForm');

  /* ======== 1. СИНХРОНИЗАЦИЯ КОНТАКТОВ ======== */
  $$('a[href^="tel:"]').forEach(link => {
    link.setAttribute('href', `tel:${CONTACT_CONFIG.phoneNumber}`);
    link.querySelector('.phone-number-text')?.replaceChildren(
      document.createTextNode(CONTACT_CONFIG.phoneDisplay)
    );
  });

  const directTgUrl = getTelegramUrl(CONTACT_CONFIG.defaultMessage);
  $$('.footer-tg-link, .modal-direct-tg').forEach(link => {
    link.setAttribute('href', directTgUrl);
  });

  /* ======== 2. STICKY HEADER ======== */
  if (header) {
    const handleScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ======== 3. MOBILE MENU ======== */
  if (mobileToggle && navMenu) {
    const toggleMenu = (force) => {
      const isOpen = force ?? !navMenu.classList.contains('is-active');
      navMenu.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', () => toggleMenu());

    $$('.nav-link', navMenu).forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) toggleMenu(false);
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('is-active')) toggleMenu(false);
    }, { passive: true });
  }

  /* ======== 4. FAQ ACCORDION ======== */
  $$('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.setAttribute('aria-expanded', 'false');
    Object.assign(answer.style, { maxHeight: '0px', opacity: '0' });

    btn.addEventListener('click', () => {
      const opening = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(opening));
      Object.assign(answer.style, {
        maxHeight: opening ? `${answer.scrollHeight}px` : '0px',
        opacity: opening ? '1' : '0'
      });
    });
  });

  /* ======== 5. MODAL DIALOG ======== */
  let lastActiveElement = null;

  const openModal = () => {
    if (!modal) return;
    lastActiveElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector('input, select, textarea');
    if (first) setTimeout(() => first.focus(), 150);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastActiveElement?.focus();
  };

  $$('[data-modal-target="consultationModal"]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });

  $$('[data-modal-close]').forEach(btn => btn.addEventListener('click', closeModal));

  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  /* ======== 6. FORM VALIDATION & TELEGRAM ======== */
  const clearValidationErrors = () => {
    $$('.form-error').forEach(el => { el.textContent = ''; });
    $$('.form-control.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  };

  const showError = (inputId, errorId, message) => {
    $(inputId)?.classList.add('is-invalid');
    const err = $(errorId);
    if (err) err.textContent = message;
  };

  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearValidationErrors();

      const fields = {
        parentName:   $('parentName')?.value.trim()  ?? '',
        childAge:     $('childAge')?.value.trim()     ?? '',
        englishLevel: $('englishLevel')?.value         ?? '',
        prefTime:     $('prefTime')?.value             ?? '',
        userComment:  $('userComment')?.value.trim()   ?? ''
      };

      let hasErrors = false;

      if (!fields.parentName) {
        showError('parentName', 'parentNameError', 'Пожалуйста, укажите ваше имя');
        hasErrors = true;
      } else if (fields.parentName.length < 2) {
        showError('parentName', 'parentNameError', 'Имя должно содержать минимум 2 символа');
        hasErrors = true;
      }

      if (!fields.childAge) {
        showError('childAge', 'childAgeError', 'Укажите возраст и класс ребёнка');
        hasErrors = true;
      }

      if (hasErrors) {
        consultationForm.querySelector('.form-control.is-invalid')?.focus();
        return;
      }

      const lines = [
        'Здравствуйте! Хочу подобрать группу для ребёнка в No School of English 🎓',
        '',
        `👤 Имя: ${fields.parentName}`,
        `👶 Возраст и класс: ${fields.childAge}`,
        `📚 Уровень: ${fields.englishLevel}`,
        `⏰ Удобное время: ${fields.prefTime}`
      ];

      if (fields.userComment) lines.push(`💬 Комментарий: ${fields.userComment}`);

      window.open(getTelegramUrl(lines.join('\n')), '_blank', 'noopener,noreferrer');

      setTimeout(() => {
        closeModal();
        consultationForm.reset();
        clearValidationErrors();
      }, 400);
    });

    $$('.form-control', consultationForm).forEach(input => {
      input.addEventListener('input', () => {
        if (!input.classList.contains('is-invalid')) return;
        input.classList.remove('is-invalid');
        input.parentElement.querySelector('.form-error')?.replaceChildren();
      });
    });
  }

});
