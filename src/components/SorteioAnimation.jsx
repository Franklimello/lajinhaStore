import { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { FaTrophy, FaTimes } from 'react-icons/fa';
import { saveWinner } from '../services/sorteioService';
import './SorteioAnimation.css';

/**
 * Componente de animação do sorteio
 * Exibe um ciclo de nomes que vai desacelerando até selecionar o vencedor
 * Versão otimizada para React 19 (sem Framer Motion)
 * 
 * @param {Array} entries - Lista de pedidos elegíveis (5+ itens)
 * @param {Function} onClose - Callback para fechar o modal
 */
export default function SorteioAnimation({ entries, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Anima a entrada do modal
  useEffect(() => {
    setTimeout(() => setShowModal(true), 10);
  }, []);

  useEffect(() => {
    if (!entries || entries.length === 0) {
      return;
    }

    // Seleciona um vencedor aleatório
    const winnerIndex = Math.floor(Math.random() * entries.length);
    const selectedWinner = entries[winnerIndex];

    // Configuração da animação
    let speed = 150; // velocidade inicial (ms) - mais lento para ver melhor
    const maxSpeed = 800; // velocidade final (mais lento)
    const acceleration = 1.05; // fator de aceleração (desaceleração mais suave)
    const minDuration = 10000; // Duração mínima de 10 segundos
    const startTime = Date.now(); // Marca o início da animação
    let currentIdx = 0;

    // Função que roda o ciclo de nomes
    const spin = () => {
      intervalRef.current = setInterval(() => {
        currentIdx = (currentIdx + 1) % entries.length;
        setCurrentIndex(currentIdx);
        
        // Aumenta gradualmente a velocidade (desacelera)
        speed = Math.min(speed * acceleration, maxSpeed);
        
        // Verifica se já passou o tempo mínimo
        const elapsedTime = Date.now() - startTime;
        const canStop = elapsedTime >= minDuration;
        
        // Para quando atingir a velocidade máxima, estiver no vencedor E passar 10 segundos
        if (speed >= maxSpeed && currentIdx === winnerIndex && canStop) {
          clearInterval(intervalRef.current);
          
          // Aguarda um pouco antes de mostrar o resultado
          timeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            setWinner(selectedWinner);
            setShowConfetti(true);
            handleSaveWinner(selectedWinner);
          }, 500);
        } else {
          // Atualiza o intervalo com a nova velocidade
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(spin, speed);
        }
      }, speed);
    };

    spin();

    // Cleanup
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [entries]);

  // Função para salvar o vencedor no Firestore
  const handleSaveWinner = async (winnerData) => {
    setSaving(true);
    try {
      const result = await saveWinner(winnerData);
      if (result.success) {
        console.log('✅ Vencedor salvo com sucesso!');
      } else {
        console.error('❌ Erro ao salvar vencedor:', result.message);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar vencedor:', error);
    } finally {
      setSaving(false);
    }
  };

  // Se não há entradas válidas
  if (!entries || entries.length === 0) {
    return (
      <div className="sorteio-overlay" onClick={onClose}>
        <div className={`sorteio-modal-empty ${showModal ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <p className="text-xl text-gray-700 mb-4">
              Nenhum pedido elegível encontrado
            </p>
            <p className="text-sm text-gray-500 mb-6">
              É necessário ter pelo menos um pedido com 5 ou mais itens para realizar o sorteio.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentEntry = entries[currentIndex];

  return (
    <div 
      className={`sorteio-overlay ${showModal ? 'show' : ''}`}
      onClick={isSpinning ? undefined : onClose}
    >
      {/* Confetti quando houver vencedor */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={true}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div 
        className={`sorteio-modal ${showModal ? 'show' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar (apenas quando não está girando) */}
        {!isSpinning && (
          <button
            onClick={onClose}
            className="sorteio-close-btn"
            title="Fechar"
          >
            <FaTimes className="text-2xl" />
          </button>
        )}

        {/* Título */}
        <div className="sorteio-header">
          <h2 className="sorteio-title">
            <FaTrophy className="trophy-icon" />
            {isSpinning ? 'Sorteando...' : '🎉 Vencedor! 🎉'}
          </h2>
          <p className="sorteio-subtitle">
            {isSpinning 
              ? 'Aguarde, estamos selecionando o ganhador...' 
              : 'Parabéns ao sortudo!'}
          </p>
        </div>

        {/* Área de exibição do nome */}
        <div className="sorteio-content">
          {isSpinning ? (
            // Animação enquanto está rodando
            <div key={currentIndex} className="sorteio-spinning">
              <div className="sorteio-name pulse">
                {currentEntry?.clientName || '...'}
              </div>
              <div className="sorteio-details">
                <p className="text-xl font-semibold">
                  Pedido #{currentEntry?.orderNumber || '...'}
                </p>
                <p className="text-sm">
                  {currentEntry?.totalItems || 0} itens
                </p>
              </div>
            </div>
          ) : (
            // Resultado final
            <div className={`sorteio-winner ${!isSpinning ? 'show' : ''}`}>
              <div className="trophy-bounce">
                <FaTrophy className="trophy-large" />
              </div>

              <div>
                <h3 className="winner-label">
                  Vencedor
                </h3>
                <p className="winner-name">
                  {winner?.clientName}
                </p>
              </div>

              <div className="winner-details">
                <div className="detail-card">
                  <p className="detail-label">Pedido</p>
                  <p className="detail-value-large">
                    #{winner?.orderNumber}
                  </p>
                </div>

                <div className="detail-grid">
                  <div className="detail-card-small">
                    <p className="detail-label-small">Telefone</p>
                    <p className="detail-value-small">
                      {winner?.clientPhone}
                    </p>
                  </div>
                  <div className="detail-card-small">
                    <p className="detail-label-small">Total de Itens</p>
                    <p className="detail-value-small">
                      {winner?.totalItems} itens
                    </p>
                  </div>
                </div>

                <div className="detail-card-value">
                  <p className="value-label">Valor do Pedido</p>
                  <p className="value-amount">
                    R$ {winner?.totalValue?.toFixed(2)}
                  </p>
                </div>
              </div>

              {saving && (
                <p className="text-sm text-gray-500 italic">
                  Salvando vencedor...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        {isSpinning && (
          <div className="sorteio-footer">
            <p>Total de participantes: {entries.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
