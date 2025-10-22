import React from 'react';
import NotificationsList from '../../components/NotificationsList';
import NotificationPermission from '../../components/NotificationPermission';
import AdminNotificationCleaner from '../../components/AdminNotificationCleaner';
import NotificationTester from '../../components/NotificationTester';
import NotificationInitializer from '../../components/NotificationInitializer';
import { useAuth } from '../../context/AuthContext';

const Notificacoes = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-2">
            Fique por dentro de todas as atualizações dos seus pedidos
          </p>
        </div>

                <div className="space-y-6">
                  {/* Inicializador de notificações */}
                  
                  
                  {/* Componente de permissão */}
                  <NotificationPermission />
                  
                  {/* Teste de notificações */}
                  
                  
                  {/* Ferramenta de limpeza para administradores */}
                  <AdminNotificationCleaner />
                  
                  {/* Lista de notificações */}
                  <NotificationsList />
                </div>
      </div>
    </div>
  );
};

export default Notificacoes;
