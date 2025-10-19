import React, { useState, useEffect } from 'react';
import { FaChartBar, FaShoppingCart, FaMoneyBillWave, FaCalendarAlt, FaArrowUp, FaArrowDown, FaTrophy, FaClock, FaPercentage, FaSync } from 'react-icons/fa';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
      setLastUpdate(new Date());
    }, 30000); // Atualiza a cada 30 segundos
    
    return () => clearInterval(interval);
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

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString('pt-BR');
  // };

  const getFilteredOrders = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return orders.filter(order => new Date(order.createdAt) >= cutoffDate);
  };

  const getPreviousPeriodOrders = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days * 2);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && orderDate < endDate;
    });
  };

  const filteredOrders = getFilteredOrders();
  const previousOrders = getPreviousPeriodOrders();

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
    confirmedOrders: filteredOrders.filter(o => o.status === 'confirmed').length,
    pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
    cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
    averageOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length : 0,
    conversionRate: filteredOrders.length > 0 ? (filteredOrders.filter(o => o.status === 'confirmed').length / filteredOrders.length) * 100 : 0
  };

  const previousStats = {
    totalOrders: previousOrders.length,
    totalRevenue: previousOrders.reduce((sum, order) => sum + order.total, 0),
    confirmedOrders: previousOrders.filter(o => o.status === 'confirmed').length,
    averageOrderValue: previousOrders.length > 0 ? previousOrders.reduce((sum, order) => sum + order.total, 0) / previousOrders.length : 0
  };

  const growth = {
    orders: calculateGrowth(stats.totalOrders, previousStats.totalOrders),
    revenue: calculateGrowth(stats.totalRevenue, previousStats.totalRevenue),
    confirmed: calculateGrowth(stats.confirmedOrders, previousStats.confirmedOrders),
    averageValue: calculateGrowth(stats.averageOrderValue, previousStats.averageOrderValue)
  };

  const getDailySales = () => {
    const dailyData = {};
    const days = parseInt(timeRange);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { orders: 0, revenue: 0 };
    }
    
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
      { status: 'Confirmados', count: stats.confirmedOrders, color: '#10B981', icon: '✅' },
      { status: 'Pendentes', count: stats.pendingOrders, color: '#F59E0B', icon: '⏳' },
      { status: 'Cancelados', count: stats.cancelledOrders, color: '#EF4444', icon: '❌' }
    ];
  };

  const getTopProducts = () => {
    const productData = {};
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.titulo;
        if (productData[key]) {
          productData[key].qty += item.qty;
          productData[key].revenue += parseFloat(item.preco) * item.qty;
        } else {
          productData[key] = {
            name: item.titulo,
            qty: item.qty,
            revenue: parseFloat(item.preco) * item.qty
          };
        }
      });
    });
    
    return Object.values(productData)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getHourlySales = () => {
    const hourlyData = Array(24).fill(0).map((_, i) => ({ hour: i, orders: 0 }));
    
    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders += 1;
    });
    
    return hourlyData;
  };

  const dailySales = getDailySales();
  const statusDistribution = getStatusDistribution();
  const topProducts = getTopProducts();
  const hourlySales = getHourlySales();
  const maxHourlySales = Math.max(...hourlySales.map(h => h.orders));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <FaChartBar className="text-blue-600" />
                Dashboard de Vendas
              </h1>
              <p className="text-gray-600">Acompanhe o desempenho do seu e-commerce em tempo real</p>
            </div>
            <button
              onClick={() => {
                loadOrders();
                setLastUpdate(new Date());
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium"
            >
              <FaSync className="text-blue-600" />
              Atualizar
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <FaClock className="inline mr-1" />
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Período:
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-blue-100">Total de Pedidos</p>
                <p className="text-4xl font-bold mt-1">{stats.totalOrders}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaShoppingCart className="text-3xl" />
              </div>
            </div>
            <div className="flex items-center">
              {growth.orders >= 0 ? (
                <FaArrowUp className="text-blue-200 mr-1" />
              ) : (
                <FaArrowDown className="text-red-300 mr-1" />
              )}
              <span className={`text-sm font-bold ${growth.orders >= 0 ? 'text-blue-100' : 'text-red-200'}`}>
                {Math.abs(growth.orders).toFixed(1)}%
              </span>
              <span className="text-sm text-blue-100 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-green-100">Receita Total</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaMoneyBillWave className="text-3xl" />
              </div>
            </div>
            <div className="flex items-center">
              {growth.revenue >= 0 ? (
                <FaArrowUp className="text-green-200 mr-1" />
              ) : (
                <FaArrowDown className="text-red-300 mr-1" />
              )}
              <span className={`text-sm font-bold ${growth.revenue >= 0 ? 'text-green-100' : 'text-red-200'}`}>
                {Math.abs(growth.revenue).toFixed(1)}%
              </span>
              <span className="text-sm text-green-100 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-purple-100">Ticket Médio</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaCalendarAlt className="text-3xl" />
              </div>
            </div>
            <div className="flex items-center">
              {growth.averageValue >= 0 ? (
                <FaArrowUp className="text-purple-200 mr-1" />
              ) : (
                <FaArrowDown className="text-red-300 mr-1" />
              )}
              <span className={`text-sm font-bold ${growth.averageValue >= 0 ? 'text-purple-100' : 'text-red-200'}`}>
                {Math.abs(growth.averageValue).toFixed(1)}%
              </span>
              <span className="text-sm text-purple-100 ml-2">vs período anterior</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-orange-100">Taxa de Conversão</p>
                <p className="text-4xl font-bold mt-1">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <FaPercentage className="text-3xl" />
              </div>
            </div>
            <p className="text-sm text-orange-100">
              {stats.confirmedOrders} de {stats.totalOrders} pedidos confirmados
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Vendas Diárias */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📊 Vendas Diárias
            </h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {dailySales.map((day, index) => {
                const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative mb-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
                        style={{ height: `${Math.max(height, 10)}px` }}
                        title={`${formatCurrency(day.revenue)} - ${day.orders} pedidos`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(day.revenue)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{day.date}</span>
                    <span className="text-xs text-gray-500">{day.orders}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição por Horário */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              🕐 Vendas por Horário
            </h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {hourlySales.map((hour, index) => {
                const height = maxHourlySales > 0 ? (hour.orders / maxHourlySales) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative mb-2">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-600 hover:to-purple-500 cursor-pointer"
                        style={{ height: `${Math.max(height, 5)}px` }}
                        title={`${hour.hour}h: ${hour.orders} pedidos`}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {hour.orders} pedidos
                        </div>
                      </div>
                    </div>
                    {index % 3 === 0 && (
                      <span className="text-xs text-gray-600 font-medium">{hour.hour}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status e Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição de Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📈 Status dos Pedidos
            </h3>
            <div className="space-y-6">
              {statusDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-gray-700">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-lg">{item.count}</span>
                      <span className="text-sm text-gray-500">
                        ({stats.totalOrders > 0 ? ((item.count / stats.totalOrders) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalOrders > 0 ? (item.count / stats.totalOrders) * 100 : 0}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Produtos Mais Vendidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Top 5 Produtos
            </h3>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-lg"
                        style={{
                          background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
                                     index === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' :
                                     index === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' :
                                     'linear-gradient(135deg, #6366F1, #4F46E5)'
                        }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.qty} unidades vendidas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${topProducts.length > 0 ? (product.revenue / topProducts[0].revenue) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-3">📦</div>
                  <p className="text-gray-500 font-medium">Nenhum produto vendido no período</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo Rápido */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-2xl font-bold mb-4">📊 Resumo do Período</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total de Vendas</p>
              <p className="text-3xl font-bold">{stats.confirmedOrders}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Pedidos Pendentes</p>
              <p className="text-3xl font-bold">{stats.pendingOrders}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Taxa de Cancelamento</p>
              <p className="text-3xl font-bold">
                {stats.totalOrders > 0 ? ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Produtos Vendidos</p>
              <p className="text-3xl font-bold">
                {filteredOrders.reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.qty, 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

