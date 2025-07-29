import CardProduto from "../../components/CardProduto"; // ajuste o caminho se precisar
import { useGetDocuments } from "../../hooks/useGetDocuments";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Home() {
  const { documents: produtos, loading } = useGetDocuments("produtos");

  if (loading) {
    return <p className="text-center mt-10">Carregando produtos...</p>;
  }

 

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-6 text-center text-green-700 bg-green-300 p-2 rounded-md">Entregamos na sua casa</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {produtos && produtos.length > 0 ? (
          produtos.map((produto) => (
            <CardProduto
              key={produto.id}
              fotosUrl={produto.fotosUrl}
              titulo={produto.titulo}
              descricao={produto.descricao}
              preco={produto.preco}
            />
          ))
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}
