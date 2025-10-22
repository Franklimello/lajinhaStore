import { useStoreStatus } from "../../context/StoreStatusContext";
import { FaStore, FaClock } from "react-icons/fa";

export default function StoreClosedModal() {
  const { isClosed, hasSeenModal, markModalAsSeen, loading } = useStoreStatus();

  // Não mostra nada se estiver carregando ou se já viu o modal
  if (loading || !isClosed || hasSeenModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-fade-in">
        {/* Ícone */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4 shadow-lg">
            <FaStore className="text-white text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Loja Fechada
          </h2>
        </div>

        {/* Mensagem */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 text-orange-600 mb-3">
            <FaClock className="text-xl" />
            <p className="font-semibold text-lg">
              Estamos temporariamente fechados
            </p>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Nosso atendimento está pausado no momento. Você pode continuar navegando no site, 
            mas não será possível realizar compras até reabrirmos.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
            <p className="text-green-800 font-bold text-base">
              ✅ Abriremos normalmente amanhã!
            </p>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 text-center">
            <strong>📞 Dúvidas?</strong><br />
            Entre em contato pelo WhatsApp<br />
            <span className="text-orange-600 font-semibold">(19) 99705-0303</span>
          </p>
        </div>

        {/* Botão */}
        <button
          onClick={markModalAsSeen}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Entendi, continuar navegando
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Volte em breve! Estamos ansiosos para atendê-lo.
        </p>
      </div>
    </div>
  );
}

