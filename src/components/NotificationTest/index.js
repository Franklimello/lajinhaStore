import { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import { 
  createNewOrderNotification,
  getAdminNotifications,
  getUnreadNotificationsCount,
  initializeNotificationsCollection
} from "../../firebase/notifications";

export default function NotificationTest() {
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const testCreateNotification = async () => {
    try {
      setLoading(true);
      setResult("Criando notificação de teste...");
      
      const testOrderData = {
        id: "test-" + Date.now(),
        userId: "test-user-" + Date.now(),
        total: 99.99,
        items: [{ nome: "Produto Teste", quantidade: 1, subtotal: 99.99 }],
        endereco: { nome: "Cliente Teste" },
        paymentMethod: "PIX"
      };

      console.log("🧪 Dados do teste:", testOrderData);

      const result = await createNewOrderNotification(testOrderData);
      
      if (result.success) {
        setResult("✅ Notificação de teste criada com sucesso! ID: " + result.id);
        console.log("✅ Notificação criada:", result);
      } else {
        setResult("❌ Erro ao criar notificação: " + result.error);
        console.error("❌ Erro:", result.error);
      }
    } catch (error) {
      setResult("❌ Erro ao testar notificação: " + error.message);
      console.error("❌ Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGetNotifications = async () => {
    try {
      setLoading(true);
      setResult("Buscando notificações...");
      
      const result = await getAdminNotifications();
      
      if (result.success) {
        setResult(`✅ Encontradas ${result.notifications.length} notificações`);
        console.log("📊 Notificações:", result.notifications);
      } else {
        setResult("❌ Erro ao buscar notificações: " + result.error);
        console.error("❌ Erro:", result.error);
      }
    } catch (error) {
      setResult("❌ Erro ao buscar notificações: " + error.message);
      console.error("❌ Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const testGetCount = async () => {
    try {
      setLoading(true);
      setResult("Contando notificações não lidas...");
      
      const result = await getUnreadNotificationsCount();
      
      if (result.success) {
        setResult(`✅ ${result.count} notificações não lidas`);
        console.log("📊 Contagem:", result.count);
      } else {
        setResult("❌ Erro ao contar notificações: " + result.error);
        console.error("❌ Erro:", result.error);
      }
    } catch (error) {
      setResult("❌ Erro ao contar notificações: " + error.message);
      console.error("❌ Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCollection = async () => {
    try {
      setLoading(true);
      setResult("Inicializando coleção de notificações...");
      
      const result = await initializeNotificationsCollection();
      
      if (result.success) {
        setResult("✅ Coleção de notificações inicializada com sucesso! ID: " + result.id);
        console.log("✅ Coleção inicializada:", result);
      } else {
        setResult("❌ Erro ao inicializar coleção: " + result.error);
        console.error("❌ Erro:", result.error);
      }
    } catch (error) {
      setResult("❌ Erro ao inicializar coleção: " + error.message);
      console.error("❌ Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            🧪 Teste de Notificações
          </h1>
          <p className="text-gray-600 mt-1">
            Teste as funções de notificação para diagnosticar problemas
          </p>
        </div>

        {/* Botões de Teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={initializeCollection}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Inicializando..." : "Inicializar Coleção"}
          </button>

          <button
            onClick={testCreateNotification}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Testando..." : "Criar Notificação"}
          </button>

          <button
            onClick={testGetNotifications}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Testando..." : "Buscar Notificações"}
          </button>

          <button
            onClick={testGetCount}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Testando..." : "Contar Não Lidas"}
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado do Teste</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruções</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>1. <strong>Inicializar Coleção:</strong> Cria a coleção 'notificacoes' no Firestore</p>
            <p>2. <strong>Criar Notificação:</strong> Cria uma notificação de teste</p>
            <p>3. <strong>Buscar Notificações:</strong> Lista todas as notificações do admin</p>
            <p>4. <strong>Contar Não Lidas:</strong> Conta notificações não lidas</p>
            <p>5. <strong>Console:</strong> Abra o console (F12) para ver logs detalhados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
