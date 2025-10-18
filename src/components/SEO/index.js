import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Supermercado Online Lajinha - Sua Loja Completa",
  description = "Supermercado Online Lajinha é sua loja completa com produtos frescos, bebidas geladas, limpeza, higiene pessoal e muito mais. Entrega rápida em Lajinha-MG e preços competitivos.",
  keywords = "supermercado online Lajinha, loja online Lajinha, produtos frescos Lajinha, bebidas geladas Lajinha, limpeza Lajinha, higiene pessoal Lajinha, entrega rápida Lajinha MG, compras online Lajinha, PIX Lajinha, pagamento seguro Lajinha",
  image = "/logo512.png",
  url = "",
  type = "website",
  structuredData = null
}) => {
  const fullTitle = title.includes("Supermercado Online Lajinha") ? title : `${title} - Supermercado Online Lajinha`;
  const fullUrl = url ? `https://compreaqui.com.br${url}` : "https://compreaqui.com.br";
  const fullImage = image.startsWith("http") ? image : `https://compreaqui.com.br${image}`;

  return (
    <Helmet>
      {/* Meta Tags Básicas */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="CompreAqui" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="CompreAqui" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

      {/* Meta Tags Adicionais */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="CompreAqui" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/logo192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logo192.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logo192.png" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
