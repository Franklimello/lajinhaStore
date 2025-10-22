import { useState } from "react";
import { FaCut, FaTimes } from "react-icons/fa";

export default function MeatCutModal({ isOpen, onClose, onConfirm, productName }) {
  const [cutType, setCutType] = useState("");
  const [customCut, setCustomCut] = useState("");

  const predefinedCuts = [
    "Moído",
    "Pedaços",
    "Bife",
    "Inteiro",
    "Churrasco Grelha",
    "Churrasco Espeto",
    "Outro"
  ];

  const handleConfirm = () => {
    const finalCut = cutType === "Outro" ? customCut : cutType;
    
    if (!finalCut.trim()) {
      alert("Por favor, selecione ou digite como deseja o corte");
      return;
    }

    onConfirm(finalCut);
    handleClose();
  };

  const handleClose = () => {
    setCutType("");
    setCustomCut("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <FaCut className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Como deseja o corte?</h3>
              <p className="text-sm text-gray-600">{productName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Opções de corte */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Selecione o tipo de corte:</p>
          <div className="grid grid-cols-2 gap-2">
            {predefinedCuts.map((cut) => (
              <button
                key={cut}
                onClick={() => setCutType(cut)}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  cutType === cut
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-red-300"
                }`}
              >
                {cut}
              </button>
            ))}
          </div>
        </div>

        {/* Campo customizado quando seleciona "Outro" */}
        {cutType === "Outro" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Especifique o corte:
            </label>
            <input
              type="text"
              value={customCut}
              onChange={(e) => setCustomCut(e.target.value)}
              placeholder="Ex: em fatias finas, em postas, etc."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        {/* Dica */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-orange-800">
            💡 <strong>Dica:</strong> Especifique como deseja o corte para garantir que seu pedido seja preparado exatamente como você precisa!
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

