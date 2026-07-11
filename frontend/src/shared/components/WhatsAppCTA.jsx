import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../shared/whatsappUtils';

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

export default function WhatsAppCTA() {
  const [href, setHref] = useState(buildWhatsAppUrl(''));
  const [position, setPosition] = useState({ x: null, y: null });
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0, moved: false });
  const location = useLocation();

  useEffect(() => {
    function getVisibleText(selector) {
      const element = document.querySelector(selector);
      return clean(element ? element.textContent : '');
    }

    function getSelectedOptionText(select) {
      if (!select || !select.options || !select.selectedOptions || !select.selectedOptions.length) return '';
      return clean(select.selectedOptions[0].textContent);
    }


    async function getPageDetails() {
      const details = [
        { label: 'Page', value: document.title || window.location.pathname }
      ];


      const course = getVisibleText('#detail-course-name');
      const program = getVisibleText('#detail-course-name');
      const detailPrice = getVisibleText('#detail-price');
      const detailMeta = getVisibleText('#detail-meta');

      if (course) details.push({ label: 'Course', value: course });
      if (program && program !== '—') details.push({ label: 'Program', value: program });
      if (detailPrice && detailPrice !== '$0.00' && detailPrice !== 'Price') details.push({ label: 'Price', value: detailPrice });
      if (detailMeta) details.push({ label: 'Course meta', value: detailMeta });

      return details;

    }

    function getLabelText(control) {
      const id = control.id;
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
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
      const form = document.querySelector('#contactForm, #enrollForm') || document.forms[0];
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

    async function updateWhatsAppLinks() {
      const details = (await getPageDetails()).concat(getFormDetails());
      let message = '';



      if (!details.length) {
        message = 'Hello Connect2Edtech!\nI need more details about your services.';
      } else {
        message = 'Hello Connect2Edtech!\n' + details.map(d => `${d.label}: ${d.value}`).join('\n');
      }

      setHref(buildWhatsAppUrl(message));
    }

    updateWhatsAppLinks();

    document.addEventListener('input', updateWhatsAppLinks, true);
    document.addEventListener('change', updateWhatsAppLinks, true);
    window.addEventListener('storage', updateWhatsAppLinks);

    return () => {
      document.removeEventListener('input', updateWhatsAppLinks, true);
      document.removeEventListener('change', updateWhatsAppLinks, true);
      window.removeEventListener('storage', updateWhatsAppLinks);
    };
  }, [location]);

  const getInitialX = () => {
    if (position.x !== null) return position.x;
    return window.innerWidth - 140;
  };

  const getInitialY = () => {
    if (position.y !== null) return position.y;
    return window.innerHeight - 80;
  };

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragState.current = {
      dragging: true,
      startX: clientX,
      startY: clientY,
      initialX: getInitialX(),
      initialY: getInitialY(),
      moved: false,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragState.current.dragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - dragState.current.startX;
      const dy = clientY - dragState.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragState.current.moved = true;
      }
      const newX = Math.max(0, Math.min(window.innerWidth - 60, dragState.current.initialX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 60, dragState.current.initialY + dy));
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      dragState.current.dragging = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  const handleClick = (e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      dragState.current.moved = false;
    }
  };

  const left = getInitialX();
  const top = getInitialY();

  return (
    <a
      id="whatsappFloatingCta"
      href={href}
      className="whatsapp-floating-cta"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{ left, top, right: 'auto', bottom: 'auto' }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onClick={handleClick}
    >
      <span className="whatsapp-floating-icon" aria-hidden="true">
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 448 512"
          height="1.2em"
          width="1.2em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L32 503l139.7-36.6c32.7 17.7 69 27 106.3 27 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 474c-33.1 0-65.6-8.9-93.9-25.7l-6.7-4-82.8 21.7 22.1-80.7-4.4-7C41.2 344 28.6 302.2 28.6 259c0-107.4 87.4-194.8 194.8-194.8 52 0 100.9 20.3 137.8 57.2 36.9 36.9 57.2 85.8 57.2 137.8.1 107.4-87.3 194.8-194.5 194.8zm110.1-150.9c-6-3-35.6-17.5-41.1-19.5-5.5-2-9.6-3-13.7 3-4.1 6-16 20-19.6 24-3.6 4-7.2 4.5-13.2 1.5-6-3-25.3-9.3-48.2-29.8-17.8-15.9-29.8-35.5-33.3-41.5-3.6-6-.4-9.2 2.6-12.2 2.7-2.7 6-7 9-10.5 3-3.5 4-6 6-10 2-4 1-7.5-.5-10.5-1.5-3-13.7-33-18.8-45.2-5-12.2-10-10.5-13.7-10.7-3.6-.2-7.7-.2-11.8-.2-4.1 0-10.8 1.5-16.5 7.8-5.7 6.3-21.7 21.2-21.7 51.7 0 30.5 22.2 60 25.2 64 3 4 43.8 66.8 106.1 93.7 14.8 6.4 26.3 10.2 35.4 13.1 14.9 4.7 28.4 4 39.1 2.4 12-1.8 35.6-14.5 40.6-28.5 5-14 5-26 3.5-28.5-1.5-2.5-5.5-4-11.5-7z"></path>
        </svg>
      </span>
      <span className="whatsapp-floating-text">WhatsApp Chat</span>
    </a>
  );
}
