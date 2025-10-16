import React, { useContext, useState } from "react";
import { ShopContext } from "../../context/ShopContext";
import { FaTrash, FaShoppingCart, FaArrowLeft, FaPlus, FaMinus } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useContext(ShopContext);
  const navigate = useNavigate();
  
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [trocoPara, setTrocoPara] = useState("");
  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    referencia: ""
  });

  // Calcula o valor total do carrinho
  const total = cart.reduce((acc, item) => {
    const preco = parseFloat(item.preco) || 0;
    const quantidade = item.qty || 1;
    return acc + (preco * quantidade);
  }, 0);

  const entrega = 5;
  const totalComEntrega = total + entrega;

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
    } else if (updateQuantity) {
      updateQuantity(itemId, newQty);
    }
  };

  // Função para montar a mensagem para o WhatsApp
  const gerarMensagemWhats = () => {
    if (cart.length === 0) return "";

    let mensagem = "Olá, quero fazer um pedido:\n\n";

    cart.forEach((item, index) => {
      const nome = item.titulo || "Produto";
      const qtd = item.qty || 1;
      mensagem += `${index + 1}. ${nome} - Quantidade: ${qtd}\n`;
    });

    mensagem += `\n📦 Total: R$ ${totalComEntrega.toFixed(2)} (incluindo R$ ${entrega.toFixed(2)} de entrega)\n`;
    
    // Adiciona endereço de entrega
    if (endereco.rua || endereco.numero || endereco.bairro) {
      mensagem += `\n📍 Endereço de Entrega:\n`;
      if (endereco.rua) mensagem += `Rua: ${endereco.rua}\n`;
      if (endereco.numero) mensagem += `Número: ${endereco.numero}\n`;
      if (endereco.bairro) mensagem += `Bairro: ${endereco.bairro}\n`;
      if (endereco.referencia) mensagem += `Referência: ${endereco.referencia}\n`;
    }
    
    // Adiciona forma de pagamento
    mensagem += `\n💳 Forma de pagamento: ${formaPagamento === "pix" ? "PIX" : "Dinheiro"}`;
    
    // Se for dinheiro e tiver valor de troco
    if (formaPagamento === "dinheiro" && trocoPara) {
      const valorTroco = parseFloat(trocoPara);
      if (valorTroco > totalComEntrega) {
        const troco = valorTroco - totalComEntrega;
        mensagem += `\n💵 Troco para: R$ ${valorTroco.toFixed(2)} (Troco: R$ ${troco.toFixed(2)})`;
      } else {
        mensagem += `\n💵 Troco para: R$ ${valorTroco.toFixed(2)}`;
      }
    }

    return encodeURIComponent(mensagem);
  };

  const whatsappNumber = "5519997050303";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${gerarMensagemWhats()}`;

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header com navegação */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FaArrowLeft />
            <span className="font-medium">Voltar</span>
          </button>
          
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaShoppingCart className="text-blue-600" />
            Carrinho ({cart.length})
          </h1>
          
          <div className="w-20"></div>
        </div>
      </div>
      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-center">
          <p className="font-bold flex items-center justify-center gap-2">
            <span>🕐</span> Horário de Funcionamento
          </p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Segunda a Sábado:</span>
            <span className="text-blue-600 font-bold text-lg">08:00 - 19:00</span>
          </div>
          <div className="border-t border-gray-200"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Domingo:</span>
            <span className="text-purple-600 font-bold text-lg">08:00 - 11:00</span>
          </div>
        </div>
      </div>


      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-6">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu carrinho está vazio</h2>
              <p className="text-gray-500 text-lg mb-8">
                Adicione produtos para começar suas compras!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Lista de produtos */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaShoppingCart className="text-blue-600" />
                  Itens no Carrinho
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-2 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-1">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.fotosUrl?.[0] || '/placeholder-image.jpg'} 
                          alt={item.titulo} 
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 truncate">
                          {item.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Preço unitário: R$ {parseFloat(item.preco || 0).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-sm text-gray-600">Qtd:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, (item.qty || 1) - 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                            >
                              <FaMinus className="text-xs text-gray-600" />
                            </button>
                            
                            <span className="w-12 text-center font-semibold text-gray-800">
                              {item.qty || 1}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.id, (item.qty || 1) + 1)}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                            >
                              <FaPlus className="text-xs text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-xl font-bold text-blue-600">
                          R$ {(parseFloat(item.preco || 0) * (item.qty || 1)).toFixed(2)}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110"
                          title="Remover item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'itens'}):</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Entrega:</span>
                  <span className="text-green-600 font-semibold">R$ 5,00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">Total:</span>
                    <span className="text-3xl font-bold text-blue-600">R$ {totalComEntrega.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Endereço de entrega */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">Endereço de Entrega</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da rua"
                      value={endereco.rua}
                      onChange={(e) => setEndereco({...endereco, rua: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        placeholder="Nº"
                        value={endereco.numero}
                        onChange={(e) => setEndereco({...endereco, numero: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        placeholder="Bairro"
                        value={endereco.bairro}
                        onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referência (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Próximo ao mercado"
                      value={endereco.referencia}
                      onChange={(e) => setEndereco({...endereco, referencia: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Forma de pagamento */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-gray-800 mb-3">Forma de Pagamento</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pagamento"
                      value="pix"
                      checked={formaPagamento === "pix"}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 font-medium">PIX</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pagamento"
                      value="dinheiro"
                      checked={formaPagamento === "dinheiro"}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 font-medium">Dinheiro</span>
                  </label>
                  
                  {formaPagamento === "dinheiro" && (
                    <div className="mt-3 pl-7">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Troco para quanto?
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 50.00"
                        value={trocoPara}
                        onChange={(e) => setTrocoPara(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {trocoPara && parseFloat(trocoPara) > totalComEntrega && (
                        <p className="mt-2 text-sm text-green-600">
                          Troco: R$ {(parseFloat(trocoPara) - totalComEntrega).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-center"
                >
                  Finalizar Compra via WhatsApp
                </a>
                
                <Link
                  to="/"
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-center block hover:bg-gray-200 transition-colors duration-200"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}