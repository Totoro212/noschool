/**
 * No School of English — Main JavaScript
 * Implements best practices: clean modular code, full accessibility (ARIA),
 * safe DOM manipulation (XSS prevention), responsive behaviors, and input validation.
 * 
 * GitHub Pages Compatible:
 * Все заявки перенаправляются напрямую в Telegram с уже сформированным текстом
 * или открывают вызов по телефону без необходимости в собственном бэкенд-сервере.
 */

'use strict';

/* ==========================================================================
   КОНФИГУРАЦИЯ КОНТАКТОВ (ИЗМЕНИТЕ ПОД СЕБЯ)
   ========================================================================== */
const CONTACT_CONFIG = {
  // Использовать ли переход в Telegram по номеру телефона (true) или по юзернейму (false)
  usePhoneForTelegram: true,

  // Номер телефона для звонков и Telegram (в международном формате)
  phoneNumber: '+998901878844',

  // Отображение телефона на сайте
  phoneDisplay: '+998 90 187 88 44',

  // Текст по умолчанию для быстрого перехода
  defaultMessage: 'Здравствуйте! Хочу узнать подробнее об онлайн-занятиях в No School of English.'
};

/**
 * Генерация ссылки для перехода в Telegram
 * Поддерживает как переход по номеру телефона (https://t.me/+7...), так и по юзернейму (https://t.me/username)
 */
const getTelegramUrl = (messageText) => {
  const encodedText = encodeURIComponent(messageText);

  if (CONTACT_CONFIG.usePhoneForTelegram || !CONTACT_CONFIG.telegramUsername) {
    // Оставляем только цифры для ссылки
    const cleanPhone = CONTACT_CONFIG.phoneNumber.replace(/[^\d]/g, '');
    return `https://t.me/+${cleanPhone}?text=${encodedText}`;
  }

  return `https://t.me/${CONTACT_CONFIG.telegramUsername}?text=${encodedText}`;
};

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. СИНХРОНИЗАЦИЯ КОНТАКТОВ НА ВСЕЙ СТРАНИЦЕ
     ========================================================================== */
  // Обновляем все телефоны на сайте
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  phoneLinks.forEach(link => {
    link.setAttribute('href', `tel:${CONTACT_CONFIG.phoneNumber}`);
    const textSpan = link.querySelector('.phone-number-text');
    if (textSpan) {
      textSpan.textContent = CONTACT_CONFIG.phoneDisplay;
    }
  });

  // Обновляем прямые ссылки на Telegram (с текстом по умолчанию)
  const tgDirectLinks = document.querySelectorAll('.footer-tg-link, .modal-direct-tg');
  const directTgUrl = getTelegramUrl(CONTACT_CONFIG.defaultMessage);

  tgDirectLinks.forEach(link => {
    link.setAttribute('href', directTgUrl);
  });

  /* ==========================================================================
     2. STICKY HEADER SHADOW ON SCROLL
     ========================================================================== */
  const header = document.getElementById('header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ==========================================================================
     3. MOBILE MENU TOGGLE
     ========================================================================== */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !navMenu.classList.contains('is-active');
      navMenu.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      mobileToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню навигации' : 'Открыть меню навигации');
      
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', () => toggleMenu());

    // Close when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          toggleMenu(false);
        }
      });
    });

    // Close on window resize if open
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('is-active')) {
        toggleMenu(false);
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. FAQ ACCORDION (ИЗНАЧАЛЬНО ЗАКРЫТЫ)
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (button && answer) {
      // Изначально все элементы закрыты
      button.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0px';
      answer.style.opacity = '0';

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const nextState = !isExpanded;

        button.setAttribute('aria-expanded', String(nextState));

        if (nextState) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          answer.style.opacity = '1';
        } else {
          answer.style.maxHeight = '0px';
          answer.style.opacity = '0';
        }
      });
    }
  });

  /* ==========================================================================
     5. MODAL DIALOG MANAGEMENT
     ========================================================================== */
  const modal = document.getElementById('consultationModal');
  const openButtons = document.querySelectorAll('[data-modal-target="consultationModal"]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');
  const consultationForm = document.getElementById('consultationForm');

  let lastActiveElement = null;

  const openModal = () => {
    if (!modal) return;
    lastActiveElement = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 150);
    }
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  };

  openButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     7. FORM VALIDATION & TELEGRAM REDIRECTION (GITHUB PAGES READY)
     ========================================================================== */
  const clearValidationErrors = () => {
    const errorSpans = document.querySelectorAll('.form-error');
    errorSpans.forEach((span) => {
      span.textContent = '';
    });
    const invalidInputs = document.querySelectorAll('.form-control.is-invalid');
    invalidInputs.forEach((input) => {
      input.classList.remove('is-invalid');
    });
  };

  const showError = (inputId, errorId, message) => {
    const input = document.getElementById(inputId);
    const errorEl = document.getElementById(errorId);
    if (input) input.classList.add('is-invalid');
    if (errorEl) errorEl.textContent = message;
  };

  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearValidationErrors();

      const parentNameInput = document.getElementById('parentName');
      const childAgeInput = document.getElementById('childAge');
      const englishLevelSelect = document.getElementById('englishLevel');
      const prefTimeSelect = document.getElementById('prefTime');
      const userCommentInput = document.getElementById('userComment');

      const parentName = parentNameInput ? parentNameInput.value.trim() : '';
      const childAge = childAgeInput ? childAgeInput.value.trim() : '';
      const englishLevel = englishLevelSelect ? englishLevelSelect.value : '';
      const prefTime = prefTimeSelect ? prefTimeSelect.value : '';
      const userComment = userCommentInput ? userCommentInput.value.trim() : '';

      let hasErrors = false;

      // Validate parentName
      if (!parentName) {
        showError('parentName', 'parentNameError', 'Пожалуйста, укажите ваше имя');
        hasErrors = true;
      } else if (parentName.length < 2) {
        showError('parentName', 'parentNameError', 'Имя должно содержать минимум 2 символа');
        hasErrors = true;
      }

      // Validate childAge
      if (!childAge) {
        showError('childAge', 'childAgeError', 'Укажите возраст и класс ребёнка');
        hasErrors = true;
      }

      if (hasErrors) {
        const firstInvalid = consultationForm.querySelector('.form-control.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Формируем красивое структурированное сообщение для Telegram
      const lines = [
        'Здравствуйте! Хочу подобрать группу для ребёнка в No School of English 🎓',
        '',
        `👤 Имя: ${parentName}`,
        `👶 Возраст и класс: ${childAge}`,
        `📚 Уровень: ${englishLevel}`,
        `⏰ Удобное время: ${prefTime}`
      ];

      if (userComment) {
        lines.push(`💬 Комментарий: ${userComment}`);
      }

      const fullMessage = lines.join('\n');
      const tgUrl = getTelegramUrl(fullMessage);

      // Открываем диалог в Telegram с уже набранным текстом
      window.open(tgUrl, '_blank', 'noopener,noreferrer');

      // Закрываем модальное окно через короткую паузу
      setTimeout(() => {
        closeModal();
        consultationForm.reset();
        clearValidationErrors();
      }, 400);
    });

    // Clear error on typing
    const inputs = consultationForm.querySelectorAll('.form-control');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          input.classList.remove('is-invalid');
          const errSpan = input.parentElement.querySelector('.form-error');
          if (errSpan) errSpan.textContent = '';
        }
      });
    });
  }

});
