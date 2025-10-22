# 🔴 CORREÇÃO PRIORIDADE 1: Adicionar LIMIT em Páginas de Categoria

## Problema
Todas as 15 páginas de categoria estão carregando **TODOS os produtos** de uma vez, sem `limit()`.

---

## Solução: Template Otimizado para Páginas de Categoria

### Arquivo: `src/pages/Mercearia/index.js` (e todas as outras)

```javascript
"use client";
import { useState, useEffect, useContext, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { db } from "../../firebase/config";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { buildFormatSources, defaultSizes } from "../../utils/imageSources";
import { FaHeart, FaShoppingCart, FaStar, FaEye, FaShoppingBasket, FaSearch } from "react-icons/fa";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";

const CACHE_KEY_PREFIX = "products_category_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const PRODUCTS_PER_PAGE = 20; // 👈 Limitar a 20 produtos por vez

const Mercearia = memo(function Mercearia({ searchTerm = "", isPreview = false }) {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const [carousels, setCarousels] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // 👈 Estado para "Carregar Mais"
  const [hasMore, setHasMore] = useState(true); // 👈 Indica se há mais produtos
  const [lastDoc, setLastDoc] = useState(null); // 👈 Último documento para paginação
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // ✅ NOVA FUNÇÃO: Busca produtos com LIMIT e paginação
  const fetchProducts = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const categoryName = "Mercearia"; // 👈 Ajustar para cada categoria
      const cacheKey = `${CACHE_KEY_PREFIX}${categoryName}`;

      // ✅ Verifica cache APENAS na primeira carga
      if (!isLoadMore) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { products, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            console.log(`✅ Cache hit: ${categoryName} (${products.length} produtos)`);
            setAllProducts(products);
            setLoading(false);
            return;
          }
        }
      }

      // ✅ Query com LIMIT e ordenação
      const catOptions = [categoryName, categoryName.toLowerCase()];
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

      console.log(`✅ Carregados ${newProducts.length} produtos de ${categoryName}`);

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
        sessionStorage.setItem(cacheKey, JSON.stringify({
          products: newProducts,
          timestamp: Date.now()
        }));
      }

    } catch (error) {
      console.error("❌ Erro ao buscar produtos:", error);
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

  // Restante do código permanece igual...
  useEffect(() => {
    const term = isPreview ? searchTerm.trim().toLowerCase() : localSearchTerm.trim().toLowerCase();
    const source = term
      ? allProducts.filter(p => (p.titulo || "").toLowerCase().includes(term))
      : allProducts;

    const productsToShow = isPreview ? source.slice(0, 10) : source;
    
    // Carrossel com produtos em destaque (primeiros 5)
    setCarousels(productsToShow.slice(0, 5));
  }, [allProducts, searchTerm, localSearchTerm, isPreview]);

  // Resto do componente (renderização) permanece igual...
  // Adicionar botão "Carregar Mais" no final da lista

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... código existente do carrossel e produtos ... */}

      {/* ✅ NOVO: Botão "Carregar Mais" */}
      {!isPreview && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando...
              </>
            ) : (
              <>
                <FaShoppingBasket />
                Carregar Mais Produtos
              </>
            )}
          </button>
        </div>
      )}

      {/* ✅ Indicador de fim da lista */}
      {!isPreview && !hasMore && allProducts.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          <p className="font-semibold">✅ Todos os produtos foram carregados!</p>
          <p className="text-sm mt-2">Total: {allProducts.length} produtos</p>
        </div>
      )}
    </div>
  );
});

export default Mercearia;
```

---

## Mudanças Principais

### 1. ✅ Adicionar LIMIT obrigatório
```javascript
// ❌ ANTES
const q = query(collection(db, "produtos"), where("categoria", "in", catOptions));

// ✅ DEPOIS
const q = query(
  collection(db, "produtos"),
  where("categoria", "in", catOptions),
  orderBy("titulo"),
  limit(20) // 👈 OBRIGATÓRIO
);
```

### 2. ✅ Implementar Paginação com startAfter
```javascript
// Primeira página
const q1 = query(collection(db, "produtos"), limit(20));

// Páginas seguintes
const q2 = query(
  collection(db, "produtos"),
  startAfter(lastDoc), // 👈 Último documento da página anterior
  limit(20)
);
```

### 3. ✅ Cache com sessionStorage
```javascript
// Salvar no cache
sessionStorage.setItem(cacheKey, JSON.stringify({
  products: newProducts,
  timestamp: Date.now()
}));

// Buscar do cache
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  const { products, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_TTL) {
    return products; // 👈 Cache válido
  }
}
```

### 4. ✅ Botão "Carregar Mais"
```javascript
<button onClick={handleLoadMore} disabled={loadingMore}>
  {loadingMore ? 'Carregando...' : 'Carregar Mais Produtos'}
</button>
```

---

## Aplicar em Todas as Páginas

**Páginas que precisam desta correção:**
1. `src/pages/Mercearia/index.js`
2. `src/pages/Cosmeticos/index.js`
3. `src/pages/Limpeza/index.js`
4. `src/pages/Bebidas/index.js`
5. `src/pages/BebidasGeladas/index.js`
6. `src/pages/HigienePessoal/index.js`
7. `src/pages/farmacia/index.js`
8. `src/pages/FriosLaticinios/index.js`
9. `src/pages/GulosemasSnacks/index.js`
10. `src/pages/Hortifruti/index.js`
11. `src/pages/Acougue/index.js`
12. `src/pages/Infantil/index.js`
13. `src/pages/PetShop/index.js`
14. `src/pages/UtilidadesDomesticas/index.js`
15. `src/pages/Ofertas/index.js`

**Ajustar apenas:**
- Nome da categoria (`const categoryName = "Mercearia"` → `"Limpeza"`, etc.)

---

## Resultado Esperado

### Antes:
- Carrega **TODOS os produtos** da categoria (50-100)
- **500 leituras** por visita à página

### Depois:
- Carrega **20 produtos** iniciais
- **20 leituras** iniciais
- Mais 20 leituras apenas se o usuário clicar em "Carregar Mais"

**Redução: 96%** 🎉

