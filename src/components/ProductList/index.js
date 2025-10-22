import { useContext } from "react";
import { ShopContext } from "../../context/ShopContext";
import { CartContext } from "../../context/CartContext";

 function ProductList() {
  const { favorites, toggleFavorite } = useContext(ShopContext);
  const { addToCart } = useContext(CartContext);

  const products = [
    { id: 1, name: "Produto 1", price: 49.9 },
    { id: 2, name: "Produto 2", price: 79.9 },
    { id: 3, name: "Produto 3", price: 99.9 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-600">R$ {product.price.toFixed(2)}</p>

          <div className="flex items-center justify-between mt-4">
            {/* Favorito */}
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`text-2xl transition ${
                favorites.includes(product.id)
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-400"
              }`}
            >
              ❤️
            </button>

            {/* Carrinho */}
            <button
              onClick={() => addToCart(product)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Adicionar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default ProductList;
