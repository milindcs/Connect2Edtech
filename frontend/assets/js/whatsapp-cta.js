(function () {
  const PHONE = '917019436720';
  const BUTTON_ID = 'whatsappFloatingCta';
  const HIDDEN_FIELD_NAMES = new Set([
    '_captcha',
    '_subject',
    '_redirect',
    '_replyto',
    '_autoresponse'
  ]);

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return clean(params.get(name) || '');
  }

  function getVisibleText(selector) {
    const element = document.querySelector(selector);
    return clean(element ? element.textContent : '');
  }

  function getSelectedOptionText(select) {
    if (!select || !select.options || !select.selectedOptions || !select.selectedOptions.length) return '';
    return clean(select.selectedOptions[0].textContent);
  }

  function getCartItems() {
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      return [];
    }
  }

  function getCartSummary() {
    const cart = getCartItems();
    if (!cart.length) return [];

    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    return [
      {
        label: 'Cart courses',
        value: cart.map(item => `${item.title || item.key || 'Course'}${item.key ? ' (Key: ' + item.key + ')' : ''}${item.price ? ' - ' + item.price : ''}`).join('; ')
      },
      {
        label: 'Cart total',
        value: '$' + total.toFixed(2)
      }
    ];
  }

  function getPageDetails() {
    const details = [
      { label: 'Page', value: document.title || window.location.pathname }
    ];

    const course = getQueryParam('course') || getVisibleText('#detail-course-name');
    const certType = getQueryParam('type') || getSelectedOptionText(document.getElementById('verifyType')) || getVisibleText('#previewType');
    const program = getQueryParam('program') || getVisibleText('#previewProgram');
    const detailPrice = getVisibleText('#detail-price');
    const detailMeta = getVisibleText('#detail-meta');
    const certMeta = getVisibleText('#certMeta');
    const hash = window.location.hash ? decodeURIComponent(window.location.hash.replace('#', '')) : '';

    if (course) details.push({ label: 'Course', value: course });
    if (certType && certType !== '—') details.push({ label: 'Certificate type', value: certType });
    if (program && program !== '—') details.push({ label: 'Program', value: program });
    if (detailPrice && detailPrice !== '$0.00') details.push({ label: 'Price', value: detailPrice });
    if (detailMeta) details.push({ label: 'Course meta', value: detailMeta });
    if (certMeta) details.push({ label: 'Certification meta', value: certMeta });
    if (hash) details.push({ label: 'Certification section', value: hash.replace(/-/g, ' ') });

    return details.concat(getCartSummary());
  }

  function getLabelText(control) {
    const id = control.id;
    if (id) {
      const label = document.querySelector('label[for="' + CSS.escape(id) + '"]');
      if (label) return clean(label.textContent.replace(/\*/g, '').replace(/:/g, ''));
    }

    const parentLabel = control.closest('label');
    if (parentLabel) {
      const clone = parentLabel.cloneNode(true);
      clone.querySelectorAll('input, select, textarea').forEach(field => field.remove());
      return clean(clone.textContent);
    }

    const placeholder = control.getAttribute('placeholder');
    return clean(placeholder || control.getAttribute('name') || control.tagName);
  }

  function shouldSkipField(field) {
    if (!field.name) return true;
    if (field.disabled) return true;
    if (field.type === 'file' || field.type === 'password') return true;
    if (HIDDEN_FIELD_NAMES.has(field.name)) return true;
    if (field.name.startsWith('_')) return true;
    return false;
  }

  function getFieldValue(field) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.checked ? clean(field.value) : '';
    }

    if (field.multiple) {
      return Array.from(field.selectedOptions).map(option => clean(option.value || option.textContent)).join(', ');
    }

    return clean(field.value);
  }

  function getFormDetails() {
    const form = document.querySelector('#contactForm, #enrollForm, #checkoutForm, #verifyForm, #receiveForm') || document.forms[0];
    if (!form) return [];

    const details = [];
    Array.from(form.elements).forEach(field => {
      if (shouldSkipField(field)) return;

      const value = getFieldValue(field);
      if (!value) return;

      details.push({
        label: getLabelText(field),
        value: value
      });
    });

    return details;
  }

  function buildMessage() {
    const details = getPageDetails().concat(getFormDetails());

    if (!details.length) {
      return 'Hello Connect2Edtech!\nI need more details about your services.';
    }

    return 'Hello Connect2Edtech!\n' + details.map(detail => detail.label + ': ' + detail.value).join('\n');
  }

  function getWhatsAppHref() {
    return 'https://api.whatsapp.com/send?phone=' + PHONE + '&text=' + encodeURIComponent(buildMessage());
  }

  function updateWhatsAppLinks() {
    const href = getWhatsAppHref();
    const floating = document.getElementById(BUTTON_ID);

    if (floating) {
      floating.href = href;
    }

    document.querySelectorAll('[data-whatsapp-link], #contactWhatsAppLink, .contact-info a[href*="wa.me"], .contact-info a[href*="api.whatsapp.com"]').forEach(link => {
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  }

  function ensureButton() {
    if (document.getElementById(BUTTON_ID)) {
      updateWhatsAppLinks();
      return;
    }

    const anchor = document.createElement('a');
    anchor.id = BUTTON_ID;
    anchor.className = 'whatsapp-floating-cta';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', 'Chat on WhatsApp');
    anchor.setAttribute('role', 'button');
    anchor.innerHTML = '<span class="whatsapp-floating-icon" aria-hidden="true">💬</span><span class="whatsapp-floating-text">WhatsApp</span>';

    // Add touch event listeners for better mobile experience
    anchor.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.95)';
    }, { passive: true });

    anchor.addEventListener('touchend', function() {
      this.style.transform = '';
    }, { passive: true });

    // Toggle chat widget on mobile
    anchor.addEventListener('click', function(e) {
      const isMobile = window.innerWidth <= 576;
      if (isMobile) {
        e.preventDefault();
        toggleChatWidget();
      }
    });

    document.body.appendChild(anchor);
    updateWhatsAppLinks();
  }

  function toggleChatWidget() {
    let widget = document.querySelector('.whatsapp-chat-widget');
    
    if (!widget) {
      createChatWidget();
      widget = document.querySelector('.whatsapp-chat-widget');
    }
    
    if (widget) {
      widget.classList.toggle('active');
    }
  }

  function createChatWidget() {
    const widget = document.createElement('div');
    widget.className = 'whatsapp-chat-widget';
    widget.setAttribute('role', 'dialog');
    widget.setAttribute('aria-label', 'WhatsApp Chat');
    
    const message = buildMessage();
    const phoneNumber = '+91 7019436720';
    
    widget.innerHTML = `
      <div class="whatsapp-chat-header">
        <div class="whatsapp-chat-avatar">💬</div>
        <div class="whatsapp-chat-info">
          <h3>Connect2Edtech</h3>
          <p>${phoneNumber}</p>
        </div>
        <button class="whatsapp-chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="whatsapp-chat-body">
        <div class="whatsapp-chat-message">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      <div class="whatsapp-chat-footer">
        <a href="https://api.whatsapp.com/send?phone=917019436720&text=${encodeURIComponent(message)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="whatsapp-chat-btn">
          <span>💬</span>
          <span>Start Chat</span>
        </a>
      </div>
    `;
    
    // Close button functionality
    const closeBtn = widget.querySelector('.whatsapp-chat-close');
    closeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      widget.classList.remove('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!widget.contains(e.target) && 
          !document.getElementById(BUTTON_ID).contains(e.target) &&
          widget.classList.contains('active')) {
        widget.classList.remove('active');
      }
    });
    
    document.body.appendChild(widget);
  }

  function refresh() {
    ensureButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  } else {
    refresh();
  }

  document.addEventListener('input', updateWhatsAppLinks, true);
  document.addEventListener('change', updateWhatsAppLinks, true);
  document.addEventListener('submit', function () {
    window.setTimeout(updateWhatsAppLinks, 0);
  }, true);
  window.addEventListener('storage', updateWhatsAppLinks);
})();
