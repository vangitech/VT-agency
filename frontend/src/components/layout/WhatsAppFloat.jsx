import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_HREF = 'https://wa.me/2348163253159';

const WhatsAppFloat = () => (
  <a
    href={WHATSAPP_HREF}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Vangitech on WhatsApp"
    title="Chat with Vangitech on WhatsApp"
    className="fixed right-4 top-1/2 z-40 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/30 min-[1400px]:flex"
  >
    <FaWhatsapp size={30} aria-hidden="true" />
  </a>
);

export default WhatsAppFloat;
