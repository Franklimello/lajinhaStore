import React from 'react';
import { FaComments, FaWhatsapp } from 'react-icons/fa';

const SimpleButtons = () => {
  return (
    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
      {/* Botão Fale Conosco */}
      <a
        href="https://wa.me/5519997050303?text=Olá! Gostaria de fazer um pedido pelo Supermercado Online Lajinha."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '50px',
          textDecoration: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          border: 'none',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1d4ed8';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#2563eb';
        }}
      >
        <FaComments style={{ fontSize: '18px' }} />
        Fale com Nossa Equipe
      </a>
      
      {/* Botão WhatsApp */}
      <a
        href="https://wa.me/5519997050303"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '50px',
          textDecoration: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          border: 'none',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#15803d';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#16a34a';
        }}
      >
        <FaWhatsapp style={{ fontSize: '18px' }} />
        WhatsApp
      </a>
    </div>
  );
};

export default SimpleButtons;














