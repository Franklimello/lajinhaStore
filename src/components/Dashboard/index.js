import React, { useState, useEffect } from 'react';
import { FaChartBar, FaShoppingCart, FaMoneyBillWave, FaUsers, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 dias

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      setOrders(savedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtra pedidos por período
  const getFilteredOrders = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
  };

  const filteredOrders = getFilteredOrders();

  // Calcula estatísticas
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    confirmedOrders: filteredOrders.filter(o => o.status === 'confirmed').length,
    pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
    cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
    averageOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length : 0
  };

  // Calcula dados para gráficos
  const getDailySales = () => {
    const dailyData = {};
    const days = parseInt(timeRange);
    
    // Inicializa todos os dias com 0
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { orders: 0, revenue: 0 };
    }
    
    // Preenche com dados reais
    filteredOrders.forEach(order => {
      const dateStr = order.createdAt.split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].orders += 1;
        dailyData[dateStr].revenue += order.total;
      }
    });
    
    return Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      orders: data.orders,
      revenue: data.revenue
    }));
  };

  const getStatusDistribution = () => {
    return [
      { status: 'Confirmados', count: stats.confirmedOrders, color: '#10B981' },
      { status: 'Pendentes', count: stats.pendingOrders, color: '#F59E0B' },
      { status: 'Cancelados', count: stats.cancelledOrders, color: '#EF4444' }
    ];
  };

  const getTopProducts = () => {
    const productCount = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.titulo;
        if (productCount[key]) {
          productCount[key] += item.qty;
        } else {
          productCount[key] = item.qty;
        }
      });
    });
    
    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const dailySales = getDailySales();
  const statusDistribution = getStatusDistribution();
  const topProducts = getTopProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <FaChartBar className="text-blue-600" />
            Dashboard de Vendas
          </h1>
          <p className="text-gray-600">Acompanhe o desempenho do seu e-commerce</p>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Período:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaShoppingCart className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <FaArrowUp className="text-green-500 text-sm mr-1" />
              <span className="text-sm text-green-600 font-medium">+12%</span>
              <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <FaArrowUp className="text-green-500 text-sm mr-1" />
              <span className="text-sm text-green-600 font-medium">+8%</span>
              <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Confirmados</p>
                <p className="text-3xl font-bold text-gray-900">{stats.confirmedOrders}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaUsers className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <FaArrowUp className="text-green-500 text-sm mr-1" />
              <span className="text-sm text-green-600 font-medium">+15%</span>
              <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <FaArrowDown className="text-red-500 text-sm mr-1" />
              <span className="text-sm text-red-600 font-medium">-3%</span>
              <span className="text-sm text-gray-500 ml-2">vs período anterior</span>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Vendas Diárias */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendas Diárias</h3>
            <div className="h-64">
              <div className="flex items-end justify-between h-full space-x-2">
                {dailySales.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t mb-2 relative">
                      <div
                        className="bg-blue-500 rounded-t transition-all duration-500"
                        style={{ height: `${Math.max((day.revenue / Math.max(...dailySales.map(d => d.revenue))) * 100, 5)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{day.date}</span>
                    <span className="text-xs font-medium text-gray-800">{day.orders} pedidos</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribuição de Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status dos Pedidos</h3>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800 mr-2">{item.count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">{product.count} vendidos</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${topProducts.length > 0 ? (product.count / topProducts[0].count) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum produto vendido no período selecionado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
