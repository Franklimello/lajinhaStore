import React from 'react';
import { Helmet } from 'react-helmet-async';

const DynamicMeta = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords = '',
  author = 'Supermercado Lajinha'
}) => {
  const siteUrl = 'https://compreaqui-324df.web.app';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image ? `${siteUrl}${image}` : `${siteUrl}/logo512.png`;
  
  const defaultTitle = 'Supermercado Online Lajinha';
  const defaultDescription = 'Seu supermercado com os melhores produtos e preços. Faça suas compras online com praticidade e segurança.';
  
  const metaTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Meta tags básicas */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Open Graph */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Supermercado Online Lajinha" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === 'product' ? 'Product' : 'WebPage',
          "name": metaTitle,
          "description": metaDescription,
          "url": fullUrl,
          "image": fullImage,
          "author": {
            "@type": "Organization",
            "name": "Supermercado Online Lajinha"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Supermercado Online Lajinha",
            "logo": {
              "@type": "ImageObject",
              "url": `${siteUrl}/logo512.png`
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default DynamicMeta;
