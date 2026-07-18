import React, { useCallback, useMemo, useState } from 'react';

/**
 * WhatsApp click-to-chat floating button.
 *
 * Also exposes a helper to open WhatsApp with a prefilled message.
 */

const DEFAULT_PHONE = '7019436720';
const DEFAULT_MESSAGE = 'Thanks for enrolling! Our team will contact you shortly.';

export function buildWhatsAppUrl({ phone = DEFAULT_PHONE, text = DEFAULT_MESSAGE } = {}) {
  const normalizedPhone = String(phone).replace(/\D/g, '');
  const encodedText = encodeURIComponent(String(text || ''));
  // Click-to-chat format
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

export default function WhatsAppFloat({
  phone = DEFAULT_PHONE,
  message = DEFAULT_MESSAGE,
  className = '',
  // If true, button will be hidden; useful when you only want the helper.
  hidden = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const href = useMemo(() => buildWhatsAppUrl({ phone, text: message }), [phone, message]);

  const onClick = useCallback(() => {
    setIsOpen(true);
    // Let browser open link in a new tab
    window.open(href, '_blank', 'noopener,noreferrer');
  }, [href]);

  if (hidden) return null;

  return (
    <button
      type="button"
      aria-label="Chat on WhatsApp"
      onClick={onClick}
      className={`whatsapp-float ${className}`}
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        width: 56,
        height: 56,
        borderRadius: 9999,
        border: 'none',
        cursor: 'pointer',
        zIndex: 9999,
        backgroundColor: '#25D366',
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 120ms ease',
        transform: isOpen ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {/* Simple WhatsApp icon */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.372 0 0 5.372 0 12c0 2.153.565 4.262 1.636 6.114L.001 24l6.09-1.6A11.97 11.97 0 0 0 12 24c6.628 0 12-5.372 12-12 0-3.18-1.24-6.166-3.48-8.52ZM12 22c-1.96 0-3.858-.557-5.5-1.613l-.39-.25-3.91 1.027 1.03-3.82-.26-.4A9.97 9.97 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10Zm5.33-7.89c-.29-.14-1.73-.85-2-.95s-.48-.14-.68.14c-.2.29-.77.95-.95 1.14-.17.19-.35.22-.64.08-.29-.14-1.2-.44-2.28-1.41-.84-.75-1.41-1.67-1.58-1.96-.17-.29-.02-.45.12-.59.13-.13.29-.34.43-.51.14-.17.18-.29.27-.48.09-.19.05-.36-.02-.51-.07-.14-.68-1.65-.94-2.26-.24-.58-.49-.5-.68-.51h-.58c-.19 0-.48.07-.73.35-.25.29-.96.94-.96 2.3s.98 2.67 1.12 2.86c.14.19 1.93 2.95 4.67 4.13.65.28 1.15.45 1.54.58.65.21 1.24.18 1.71.11.52-.08 1.73-.71 1.97-1.39.24-.68.24-1.26.17-1.39-.07-.13-.27-.21-.56-.35Z"
          fill="#fff"
        />
      </svg>
    </button>
  );
}

