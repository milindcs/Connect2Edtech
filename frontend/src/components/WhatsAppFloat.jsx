import { FaWhatsapp } from 'react-icons/fa';
import './WhatsAppFloat.css';

export function buildWhatsAppUrl({ phone, text }) {
  const encodedText = encodeURIComponent(text || '');
  const normalizedPhone = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}

export default function WhatsAppFloat() {
  const whatsappUrl = buildWhatsAppUrl({
    phone: '917019436720',
    text: 'Hello Connect2EdTech Team,I visited your website and I am interested in learning more about your courses. Please guide me with the available programs and enrollment process.Thank you.',
  });

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-float">
      <FaWhatsapp />
    </a>
  );
}
