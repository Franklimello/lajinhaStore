import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAdmin } from '../../hooks/useAdmin';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const AdminNotificationCleaner = () => {
  const [loading, setLoading] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  const getTotalNotifications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notifications'));
      setNotificationsCount(querySnapshot.size);
    } catch (error) {
      console.error('Erro ao contar notificações:', error);
    }
  };

  const deleteAllNotifications = () => {
    setDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteConfirm(false);
    setLoading(true);

    try {
      // Buscar todas as notificações
      const querySnapshot = await getDocs(collection(db, 'notifications'));
      
      // Usar batch para deletar todas de uma vez (máximo 500 por vez)
      const batch = writeBatch(db);
      let count = 0;
      
      querySnapshot.forEach((docSnapshot) => {
        batch.delete(doc(db, 'notifications', docSnapshot.id));
        count++;
        
        // Se atingir 500 operações, commita e cria novo batch
        if (count % 500 === 0) {
          batch.commit();
          // Novo batch para próximas operações
        }
      });

      // Commitar o último batch
      if (count % 500 !== 0) {
        await batch.commit();
      }

      setNotificationsCount(0);
      alert(`✅ Sucesso! ${count} notificações foram apagadas do banco de dados.`);
      
    } catch (error) {
      console.error('❌ Erro ao apagar notificações:', error);
      alert('❌ Erro ao apagar notificações. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <FaExclamationTriangle className="text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">
          Limpeza de Banco de Dados
        </h3>
      </div>
      
      <p className="text-red-700 text-sm mb-4">
        Esta ferramenta permite apagar todas as notificações do banco de dados para liberar espaço.
      </p>

      <div className="space-y-3">
        <button
          onClick={getTotalNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Total de Notificações
        </button>

        {notificationsCount > 0 && (
          <div className="p-3 bg-white rounded border">
            <p className="text-sm">
              <strong>Total encontrado:</strong> {notificationsCount} notificações
            </p>
          </div>
        )}

        {notificationsCount > 0 && (
          <button
            onClick={deleteAllNotifications}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaTrash />
            {loading ? 'Apagando...' : 'APAGAR TODAS AS NOTIFICAÇÕES'}
          </button>
        )}

        {notificationsCount === 0 && (
          <div className="p-3 bg-green-100 rounded border border-green-200">
            <p className="text-green-800 text-sm">
              ✅ Banco de dados limpo! Não há notificações para apagar.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-200">
        <p className="text-yellow-800 text-xs">
          ⚠️ <strong>Importante:</strong> Esta ação apaga todas as notificações de todos os usuários. 
          Use com cuidado e apenas quando necessário para liberar espaço no banco de dados.
        </p>
      </div>
    </div>
  );
};

export default AdminNotificationCleaner;
