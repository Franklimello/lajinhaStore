import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * AdvancedSEO - Componente SEO avançado
 * Inclui Open Graph, Twitter Cards e metadados otimizados
 */
const AdvancedSEO = ({
  title,
  description,
  keywords,
  url,
  image,
  structuredData,
  canonical,
  ogType = 'website',
  twitterCard = 'summary_large_image'
}) => {
  const fullImageUrl = image?.startsWith('http') ? image : `${window.location.origin}${image}`;
  const fullUrl = url?.startsWith('http') ? url : `${window.location.origin}${url}`;

  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="Supermercado Online Lajinha" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* PWA Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Lajinha" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="Lajinha" />
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default AdvancedSEO;












