/**
 * contact-form.js
 * Inventory: not a decoration item — required by spec 07 / spec 08 section 14.
 *
 * VENDOR LOADING OVERRIDE (project-level, supersedes spec 08 line 24):
 * GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as classic
 * scripts and exposed as window.gsap / window.ScrollTrigger / window.Lenis.
 * This module receives gsap/ScrollTrigger/lenis as arguments from main.js;
 * it does not import them and does not use them for anything, because this
 * module contains no animation — it is functional, not decorative.
 *
 * GATING EXCEPTION (decided at spec time, overrides spec 08 rule 7/8 for this
 * module only): this module is UNGATED. It must run unconditionally on
 * mobile and under prefers-reduced-motion, because the contact form must
 * keep working for every visitor. Only optional visual flourishes (of which
 * this module implements none) would ever be gated on `reduced`/`isMobile`.
 *
 * Progressive enhancement: contact.html's <form> already works with JS
 * disabled — it posts natively to /api/contact and the Function 303-redirects
 * back to /contact?sent=1 or /contact?error=1 for non-JSON Accept headers.
 * This module only intercepts submit to upgrade the experience; it must
 * never prevent the native fallback from existing in markup.
 */

export function initContactForm({ gsap, ScrollTrigger, lenis, reduced, isMobile } = {}) {
  const NOOP = () => {};

  const form = document.querySelector('[data-contact-form]');
  if (!form) {
    return NOOP;
  }

  const submitBtn = form.querySelector('[data-form-submit]');
  const statusEl = form.querySelector('[data-form-status]');

  // Field names matched exactly against functions/api/contact.js:
  // name, email, phone, business, service, message, consent,
  // and the Turnstile response field 'cf-turnstile-response'.
  const FIELD_IDS = ['name', 'email', 'phone', 'business', 'service', 'message', 'consent'];
  const TURNSTILE_FIELD = 'cf-turnstile-response';

  // Only these fields have a dedicated <p class="field__error"> in the markup.
  const ERROR_TARGETS = ['name', 'email', 'service', 'message', 'consent'];

  const CLIENT_MESSAGES = {
    nameEmpty: 'Please enter your name.',
    emailEmpty: 'Please enter your email address.',
    emailMalformed: 'That email address does not look right.',
    serviceEmpty: 'Please choose what you need.',
    messageEmpty: 'Please tell us what you need.',
    messageTooLong: 'Please keep this under 2000 characters.',
    consentUnchecked: 'Please tick the box so we can reply.'
  };

  const STATUS_MESSAGES = {
    submitting: 'Sending your enquiry…',
    success: 'Thanks. Your enquiry is on its way. We will be in touch.',
    serverError: 'Something went wrong sending that. Please ring 087-2520034 instead.',
    turnstileFailed: 'The security check did not pass. Please try again.',
    rateLimited: 'Too many attempts. Please try again in a few minutes.'
  };

  // Generic per-field messages used for server-returned validation_failed,
  // where the server tells us only which field failed, not which rule.
  const SERVER_FIELD_MESSAGES = {
    name: CLIENT_MESSAGES.nameEmpty,
    email: CLIENT_MESSAGES.emailMalformed,
    phone: 'Please check the phone number.',
    business: 'Please shorten the business name.',
    service: CLIENT_MESSAGES.serviceEmpty,
    message: CLIENT_MESSAGES.messageEmpty,
    consent: CLIENT_MESSAGES.consentUnchecked,
    [TURNSTILE_FIELD]: 'Please complete the security check.'
  };

  const inputs = {};
  FIELD_IDS.forEach((id) => {
    inputs[id] = form.elements.namedItem(id) || null;
  });

  const errorEls = {};
  ERROR_TARGETS.forEach((id) => {
    errorEls[id] = document.getElementById(`${id}-error`);
  });

  let submitted = false;
  let isSubmitting = false;
  const blurHandlers = [];

  function emailLooksValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function writeFieldError(id, message) {
    const input = inputs[id];
    const errorEl = errorEls[id];
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        const describedBy = new Set(
          (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
        );
        describedBy.add(errorEl.id);
        input.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
      }
    }
    if (errorEl) {
      errorEl.innerHTML = '';
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '⚠';
      errorEl.appendChild(icon);
      errorEl.appendChild(document.createTextNode(` ${message}`));
      errorEl.hidden = false;
    }
  }

  function clearFieldError(id) {
    const input = inputs[id];
    const errorEl = errorEls[id];
    if (input) {
      input.setAttribute('aria-invalid', 'false');
    }
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = '';
    }
  }

  function clearAllErrors() {
    ERROR_TARGETS.forEach(clearFieldError);
  }

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  // Returns the first invalid field id, or null.
  function validateField(id) {
    const input = inputs[id];
    if (!input) return null;

    if (id === 'name') {
      const value = input.value.trim();
      if (!value) {
        writeFieldError('name', CLIENT_MESSAGES.nameEmpty);
        return 'name';
      }
      clearFieldError('name');
      return null;
    }

    if (id === 'email') {
      const value = input.value.trim();
      if (!value) {
        writeFieldError('email', CLIENT_MESSAGES.emailEmpty);
        return 'email';
      }
      if (!emailLooksValid(value)) {
        writeFieldError('email', CLIENT_MESSAGES.emailMalformed);
        return 'email';
      }
      clearFieldError('email');
      return null;
    }

    if (id === 'service') {
      const value = input.value.trim();
      if (!value) {
        writeFieldError('service', CLIENT_MESSAGES.serviceEmpty);
        return 'service';
      }
      clearFieldError('service');
      return null;
    }

    if (id === 'message') {
      const value = input.value.trim();
      if (!value) {
        writeFieldError('message', CLIENT_MESSAGES.messageEmpty);
        return 'message';
      }
      if (value.length > 2000) {
        writeFieldError('message', CLIENT_MESSAGES.messageTooLong);
        return 'message';
      }
      clearFieldError('message');
      return null;
    }

    if (id === 'consent') {
      if (!input.checked) {
        writeFieldError('consent', CLIENT_MESSAGES.consentUnchecked);
        return 'consent';
      }
      clearFieldError('consent');
      return null;
    }

    return null;
  }

  // Validates every required field. Returns the first invalid field id, or null.
  function validateAll() {
    let firstInvalid = null;
    ['name', 'email', 'service', 'message', 'consent'].forEach((id) => {
      const invalidId = validateField(id);
      if (invalidId && !firstInvalid) {
        firstInvalid = invalidId;
      }
    });
    return firstInvalid;
  }

  function focusField(id) {
    const input = inputs[id];
    if (input && typeof input.focus === 'function') {
      input.focus();
    }
  }

  function resetTurnstile() {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      try {
        window.turnstile.reset();
      } catch (e) {
        // Widget not mounted yet or reset unsupported — nothing more to do.
      }
    }
  }

  function setSubmitting(pending) {
    isSubmitting = pending;
    if (submitBtn) {
      submitBtn.disabled = pending;
      submitBtn.setAttribute('aria-busy', pending ? 'true' : 'false');
    }
  }

  function applyServerFieldErrors(fields) {
    let firstInvalid = null;
    (fields || []).forEach((field) => {
      const message = SERVER_FIELD_MESSAGES[field] || 'Please check this field.';
      if (ERROR_TARGETS.includes(field)) {
        writeFieldError(field, message);
      } else {
        // No dedicated error element for this field (phone, business, turnstile).
        setStatus(message);
      }
      if (!firstInvalid && inputs[field]) {
        firstInvalid = field;
      }
    });
    if (firstInvalid) {
      focusField(firstInvalid);
    }
  }

  function handleResponseError(status, body) {
    const errorCode = body && body.error;

    if (errorCode === 'validation_failed') {
      applyServerFieldErrors(body.fields);
      return;
    }

    if (errorCode === 'turnstile_failed') {
      setStatus(STATUS_MESSAGES.turnstileFailed);
      return;
    }

    if (errorCode === 'rate_limited') {
      setStatus(STATUS_MESSAGES.rateLimited);
      return;
    }

    // too_large (413), bad_content_type (415), send_failed (502),
    // misconfigured (500), bad_request (400) and anything unrecognised
    // all fall back to the generic server-error message with the phone
    // number fallback, per spec 07 section 5.2.
    setStatus(STATUS_MESSAGES.serverError);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    submitted = true;

    const firstInvalid = validateAll();
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setSubmitting(true);
    setStatus(STATUS_MESSAGES.submitting);

    let response;
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
    } catch (networkError) {
      setStatus(STATUS_MESSAGES.serverError);
      setSubmitting(false);
      resetTurnstile();
      return;
    }

    let body = null;
    try {
      body = await response.json();
    } catch (parseError) {
      body = null;
    }

    if (response.ok && body && body.ok) {
      clearAllErrors();
      setStatus(STATUS_MESSAGES.success);
      form.reset();
    } else {
      handleResponseError(response.status, body || {});
    }

    setSubmitting(false);
    resetTurnstile();
  }

  function handleBlur(id) {
    return () => {
      if (!submitted) return;
      validateField(id);
    };
  }

  form.addEventListener('submit', handleSubmit);

  ['name', 'email', 'service', 'message', 'consent'].forEach((id) => {
    const input = inputs[id];
    if (!input) return;
    const handler = handleBlur(id);
    input.addEventListener('blur', handler);
    blurHandlers.push({ input, handler });
  });

  // No-JS fallback path: a user whose JS loads after a native 303 redirect
  // lands back on /contact?sent=1 or /contact?error=1.
  const params = new URLSearchParams(location.search);
  if (params.has('sent')) {
    setStatus(STATUS_MESSAGES.success);
  } else if (params.has('error')) {
    setStatus(STATUS_MESSAGES.serverError);
  }

  return function cleanup() {
    form.removeEventListener('submit', handleSubmit);
    blurHandlers.forEach(({ input, handler }) => {
      input.removeEventListener('blur', handler);
    });
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
    }
  };
}
