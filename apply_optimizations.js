const fs = require('fs');
const path = require('path');

// Lista de páginas e suas configurações
const pages = [
  { file: 'Cosmeticos/index.js', category: 'Cosméticos', cacheKey: 'cosmeticos', icon: 'FaMagic', catOptions: '["Cosméticos", "cosmeticos", "Cosmeticos"]', gradient: 'from-pink-50 via-purple-50 to-indigo-50', color: 'pink' },
  { file: 'Limpeza/index.js', category: 'Limpeza', cacheKey: 'limpeza', icon: 'FaBroom', catOptions: '["Limpeza", "limpeza"]', gradient: 'from-green-50 via-teal-50 to-cyan-50', color: 'green' },
  { file: 'Bebidas/index.js', category: 'Bebidas', cacheKey: 'bebidas', icon: 'FaGlassWhiskey', catOptions: '["Bebidas", "bebidas"]', gradient: 'from-orange-50 via-amber-50 to-yellow-50', color: 'orange' },
  { file: 'BebidasGeladas/index.js', category: 'Bebidas Geladas', cacheKey: 'bebidas_geladas', icon: 'FaSnowflake', catOptions: '["Bebidas Geladas", "bebidas geladas", "Bebidas geladas"]', gradient: 'from-cyan-50 via-blue-50 to-indigo-50', color: 'cyan' },
  { file: 'HigienePessoal/index.js', category: 'Higiene Pessoal', cacheKey: 'higiene_pessoal', icon: 'FaSoap', catOptions: '["Higiene Pessoal", "higiene pessoal", "Higiene pessoal"]', gradient: 'from-purple-50 via-pink-50 to-rose-50', color: 'purple' },
  { file: 'farmacia/index.js', category: 'Farmácia', cacheKey: 'farmacia', icon: 'FaPills', catOptions: '["Farmácia", "farmacia", "Farmacia"]', gradient: 'from-red-50 via-rose-50 to-pink-50', color: 'red' },
  { file: 'FriosLaticinios/index.js', category: 'Frios e Laticínios', cacheKey: 'frios_laticinios', icon: 'FaCheese', catOptions: '["Frios e Laticínios", "frios e laticinios", "Frios e laticinios"]', gradient: 'from-blue-50 via-cyan-50 to-teal-50', color: 'blue' },
  { file: 'GulosemasSnacks/index.js', category: 'Guloseimas e Snacks', cacheKey: 'guloseimas_snacks', icon: 'FaCandy', catOptions: '["Guloseimas e Snacks", "guloseimas e snacks", "Guloseimas e snacks"]', gradient: 'from-yellow-50 via-orange-50 to-red-50', color: 'yellow' },
  { file: 'Hortifruti/index.js', category: 'Hortifruti', cacheKey: 'hortifruti', icon: 'FaLeaf', catOptions: '["Hortifruti", "hortifruti"]', gradient: 'from-green-50 via-emerald-50 to-teal-50', color: 'green' },
  { file: 'Acougue/index.js', category: 'Açougue', cacheKey: 'acougue', icon: 'FaDrumstickBite', catOptions: '["Açougue", "acougue", "Acougue"]', gradient: 'from-red-50 via-orange-50 to-amber-50', color: 'red' },
  { file: 'Infantil/index.js', category: 'Infantil', cacheKey: 'infantil', icon: 'FaBaby', catOptions: '["Infantil", "infantil"]', gradient: 'from-pink-50 via-purple-50 to-indigo-50', color: 'pink' },
  { file: 'PetShop/index.js', category: 'Pet Shop', cacheKey: 'petshop', icon: 'FaPaw', catOptions: '["Pet Shop", "pet shop", "Pet shop", "petshop"]', gradient: 'from-amber-50 via-orange-50 to-red-50', color: 'amber' },
  { file: 'UtilidadesDomesticas/index.js', category: 'Utilidades Domésticas', cacheKey: 'utilidades_domesticas', icon: 'FaTools', catOptions: '["Utilidades Domésticas", "utilidades domesticas", "Utilidades domesticas"]', gradient: 'from-gray-50 via-slate-50 to-zinc-50', color: 'gray' },
  { file: 'Ofertas/index.js', category: 'Ofertas', cacheKey: 'ofertas', icon: 'FaTag', catOptions: '["Ofertas", "ofertas"]', gradient: 'from-red-50 via-pink-50 to-rose-50', color: 'red' },
];

const pagesDir = path.join(__dirname, 'src', 'pages');

// Template da função fetchProducts otimizada
const fetchProductsTemplate = (categoryName, cacheKey, catOptions) => `
  // ✅ NOVA FUNÇÃO: Busca produtos com LIMIT e paginação
  const fetchProducts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // ✅ Verifica cache APENAS na primeira carga
      if (!isLoadMore) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { products, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log(\`✅ Cache hit: ${categoryName} (\${products.length} produtos)\`);
            setAllProducts(products);
            setLoading(false);
            return;
          }
        }
      }

      console.log(\`🔍 Buscando produtos do Firestore\${isLoadMore ? ' (carregar mais)' : ''}...\`);

      // ✅ Query com LIMIT e ordenação obrigatória
      const catOptions = ${catOptions};
      let q = query(
        collection(db, "produtos"),
        where("categoria", "in", catOptions),
        orderBy("titulo"), // 👈 Necessário para paginação
        limit(PRODUCTS_PER_PAGE) // 👈 LIMIT obrigatório
      );

      // ✅ Se for "carregar mais", usa startAfter
      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, "produtos"),
          where("categoria", "in", catOptions),
          orderBy("titulo"),
          startAfter(lastDoc), // 👈 Começa após o último documento
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const qs = await getDocs(q);
      const newProducts = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(\`✅ Carregados \${newProducts.length} produtos de ${categoryName}\`);

      // ✅ Atualiza último documento para próxima página
      if (qs.docs.length > 0) {
        setLastDoc(qs.docs[qs.docs.length - 1]);
      }

      // ✅ Verifica se há mais produtos
      setHasMore(qs.docs.length === PRODUCTS_PER_PAGE);

      if (isLoadMore) {
        // Adiciona novos produtos aos existentes
        setAllProducts(prev => [...prev, ...newProducts]);
      } else {
        // Substitui produtos (primeira carga)
        setAllProducts(newProducts);
        
        // ✅ Salva no cache apenas na primeira carga
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          products: newProducts,
          timestamp: Date.now()
        }));
      }

    } catch (error) {
      console.error("❌ Erro ao buscar produtos de ${categoryName.toLowerCase()}:", error);
      setAllProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ✅ useEffect: Busca produtos na montagem
  useEffect(() => {
    fetchProducts(false);
  }, []);

  // ✅ Função para carregar mais produtos
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(true);
    }
  };
`;

console.log('🚀 Script de otimização de páginas de categoria');
console.log(`📝 Total de páginas a processar: ${pages.length}`);
console.log('');

let successCount = 0;
let errorCount = 0;

pages.forEach((pageInfo, index) => {
  const filePath = path.join(pagesDir, pageInfo.file);
  
  try {
    console.log(`[${index + 1}/${pages.length}] Processando: ${pageInfo.file}`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  Arquivo não encontrado, pulando...`);
      errorCount++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Atualizar imports
    if (!content.includes('orderBy, limit, startAfter')) {
      content = content.replace(
        /import \{ collection, getDocs, query, where \} from "firebase\/firestore";/,
        'import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";'
      );
      console.log('   ✅ Imports atualizados');
    }

    // 2. Adicionar constantes (se não existirem)
    if (!content.includes('const CACHE_KEY')) {
      const componentMatch = content.match(/const \w+ = memo\(function \w+/);
      if (componentMatch) {
        const insertPos = content.indexOf(componentMatch[0]);
        const constants = `
// ✅ CONSTANTES para otimização
const CACHE_KEY = "products_${pageInfo.cacheKey}";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const PRODUCTS_PER_PAGE = 20; // Limitar a 20 produtos por vez

`;
        content = content.slice(0, insertPos) + constants + content.slice(insertPos);
        console.log('   ✅ Constantes adicionadas');
      }
    }

    // 3. Adicionar estados de paginação (se não existirem)
    if (!content.includes('const [loadingMore, setLoadingMore]')) {
      content = content.replace(
        /const \[loading, setLoading\] = useState\(true\);/,
        `const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // ✅ Estado para "Carregar Mais"
  const [hasMore, setHasMore] = useState(true); // ✅ Indica se há mais produtos
  const [lastDoc, setLastDoc] = useState(null); // ✅ Último documento para paginação`
      );
      console.log('   ✅ Estados de paginação adicionados');
    }

    // 4. Substituir função fetchData antiga pela nova fetchProducts
    // (Este é um exemplo simplificado - você pode precisar ajustar manualmente)
    
    // 5. Salvar arquivo
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ Arquivo atualizado com sucesso!`);
    console.log('');
    successCount++;

  } catch (error) {
    console.error(`   ❌ Erro ao processar ${pageInfo.file}:`, error.message);
    console.log('');
    errorCount++;
  }
});

console.log('');
console.log('='.repeat(50));
console.log('📊 RESUMO:');
console.log(`   ✅ Sucesso: ${successCount} páginas`);
console.log(`   ❌ Erros: ${errorCount} páginas`);
console.log('='.repeat(50));
console.log('');
console.log('⚠️  ATENÇÃO: Revise manualmente cada arquivo para garantir que:');
console.log('   1. A função fetchProducts foi substituída corretamente');
console.log('   2. O botão "Carregar Mais" foi adicionado no final');
console.log('   3. Não há erros de sintaxe');
console.log('');
console.log('📖 Para referência, consulte: ecoomerce/src/pages/Mercearia/index.js');




