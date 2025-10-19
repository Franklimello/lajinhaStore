// Gerador de sitemap dinâmico para SEO
export const sitemapGenerator = {
  // URLs estáticas do site
  staticUrls: [
    {
      url: 'https://compreaqui-324df.web.app/',
      priority: 1.0,
      changefreq: 'daily'
    },
    {
      url: 'https://compreaqui-324df.web.app/categorias',
      priority: 0.9,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/hortifruti',
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/acougue',
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/frios-laticinios',
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/mercearia',
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/bebidas',
      priority: 0.8,
      changefreq: 'weekly'
    },
    {
      url: 'https://compreaqui-324df.web.app/ofertas',
      priority: 0.9,
      changefreq: 'daily'
    },
    {
      url: 'https://compreaqui-324df.web.app/login',
      priority: 0.5,
      changefreq: 'monthly'
    },
    {
      url: 'https://compreaqui-324df.web.app/register',
      priority: 0.5,
      changefreq: 'monthly'
    }
  ],

  // Gera URLs dinâmicas baseadas em produtos
  generateProductUrls: (products) => {
    return products.map(product => ({
      url: `https://compreaqui-324df.web.app/produto/${product.id}`,
      priority: 0.7,
      changefreq: 'weekly',
      lastmod: product.updatedAt || new Date().toISOString()
    }));
  },

  // Gera o sitemap XML
  generateSitemap: (products = []) => {
    const allUrls = [
      ...this.staticUrls,
      ...this.generateProductUrls(products)
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
  },

  // Gera robots.txt
  generateRobotsTxt: () => {
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://compreaqui-324df.web.app/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /painel/
Disallow: /dashboard/

# Allow important pages
Allow: /categorias
Allow: /ofertas
Allow: /produto/`;
  },

  // Atualiza sitemap automaticamente
  updateSitemap: async (products) => {
    try {
      const sitemap = this.generateSitemap(products);
      
      // Em um ambiente real, você salvaria isso no servidor
      // Por enquanto, vamos apenas logar
      console.log('Sitemap atualizado:', sitemap);
      
      return sitemap;
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error);
      return null;
    }
  }
};


