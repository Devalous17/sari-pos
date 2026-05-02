import { TrendingUp, Package, DollarSign, ShoppingBag, Receipt, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { useState, useId } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  cost?: number;
}

interface Sale {
  items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number }>;
  total: number;
  date: Date;
  paymentAmount?: number;
  change?: number;
}

interface AnalyticsProps {
  products: Product[];
  sales: Sale[];
}

export function Analytics({ products, sales }: AnalyticsProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [showTransactions, setShowTransactions] = useState(false);
  const lineGradientId = `line-gradient-${useId()}`;
  const barGradientId = `bar-gradient-${useId()}`;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekStartDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const monthlySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const weeklySalesMap = new Map<string, { sales: Sale[]; weekStart: Date; weekNum: number }>();
  const currentWeekNum = getWeekNumber(now);

  for (let i = 3; i >= 0; i--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const weekStart = getWeekStartDate(weekDate);
    const weekNum = getWeekNumber(weekDate);
    const key = `${weekStart.getFullYear()}-W${weekNum}`;
    weeklySalesMap.set(key, { sales: [], weekStart, weekNum });
  }

  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const weekStart = getWeekStartDate(saleDate);
    const weekNum = getWeekNumber(saleDate);
    const key = `${weekStart.getFullYear()}-W${weekNum}`;

    const weekData = weeklySalesMap.get(key);
    if (weekData) {
      weekData.sales.push(sale);
    }
  });

  const monthlySalesMap = new Map<string, { sales: Sale[]; month: number; year: number }>();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlySalesMap.set(key, { sales: [], month: date.getMonth(), year: date.getFullYear() });
  }

  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
    const monthData = monthlySalesMap.get(key);
    if (monthData) {
      monthData.sales.push(sale);
    }
  });

  const periodData = viewMode === 'week'
    ? Array.from(weeklySalesMap.values()).map(({ sales, weekStart, weekNum }, index) => {
        const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const itemCount = sales.reduce((sum, sale) =>
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        return {
          id: `week-${weekNum}-${index}`,
          label: `Week ${weekNum}`,
          fullLabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          revenue,
          itemCount,
          transactions: sales.length
        };
      })
    : Array.from(monthlySalesMap.values()).map(({ sales, month, year }, index) => {
        const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const itemCount = sales.reduce((sum, sale) =>
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        return {
          id: `month-${year}-${month}-${index}`,
          label: new Date(year, month).toLocaleDateString('en-US', { month: 'short' }),
          fullLabel: new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          revenue,
          itemCount,
          transactions: sales.length
        };
      });

  const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);

  const totalCost = monthlySales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => {
      return itemSum + ((item.cost || 0) * item.quantity);
    }, 0);
  }, 0);

  const grossProfit = totalRevenue - totalCost;

  const productSales = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
  monthlySales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productSales.set(item.id, {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const chartData = topProducts.map((p, index) => ({
    id: p.id,
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    sales: p.quantity
  }));

  const totalItems = monthlySales.reduce((sum, sale) =>
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const stockPredictions = products.map(product => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = sales.filter(sale => new Date(sale.date) >= thirtyDaysAgo);
    const totalSold = recentSales.reduce((sum, sale) => {
      const item = sale.items.find(i => i.id === product.id);
      return sum + (item ? item.quantity : 0);
    }, 0);

    const daysWithData = Math.max(1, Math.min(30, sales.length > 0 ? 30 : 1));
    const dailyAverage = totalSold / daysWithData;

    const daysUntilOutOfStock = dailyAverage > 0 ? product.stock / dailyAverage : Infinity;

    return {
      ...product,
      totalSold,
      dailyAverage,
      daysUntilOutOfStock
    };
  });

  const productsRunningOutSoon = stockPredictions
    .filter(p => p.daysUntilOutOfStock < 14 && p.daysUntilOutOfStock > 0)
    .sort((a, b) => a.daysUntilOutOfStock - b.daysUntilOutOfStock)
    .slice(0, 5);

  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-[#1E40AF]">Analytics</h2>
        <div className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex gap-2">
          <div className="flex gap-2 p-1 bg-gray-200 rounded-xl flex-1 max-w-md">
            <button
              onClick={() => {
                setViewMode('week');
                setShowTransactions(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                viewMode === 'week' && !showTransactions
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setViewMode('month');
                setShowTransactions(false);
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                viewMode === 'month' && !showTransactions
                  ? 'bg-[#3B82F6] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className={`py-2 px-6 rounded-xl transition-all flex items-center gap-2 ${
              showTransactions
                ? 'bg-[#3B82F6] text-white shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span className="hidden md:inline">Transactions</span>
          </button>
        </div>

        {showTransactions ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#1E40AF]">Transaction History</h3>
            {sales.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...sales].reverse().map((sale, index) => {
                  const saleDate = new Date(sale.date);
                  return (
                    <div key={index} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-3 mb-2 md:mb-0">
                          <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">
                            {sales.length - index}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {saleDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {saleDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Total</div>
                          <div className="text-2xl font-bold text-[#1E40AF]">₱{sale.total.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 mb-2">Items:</div>
                        {sale.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{item.name}</div>
                              <div className="text-sm text-gray-500">
                                ₱{item.price.toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                            <div className="font-semibold text-[#1E40AF]">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}

                        {sale.paymentAmount !== undefined && (
                          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Payment Amount:</span>
                              <span className="font-semibold text-gray-800">₱{sale.paymentAmount.toFixed(2)}</span>
                            </div>
                            {sale.change !== undefined && sale.change > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Change:</span>
                                <span className="font-semibold text-[#3B82F6]">₱{sale.change.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-[#3B82F6] mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">This Month</span>
            </div>
            <div className="text-[20px] md:text-[24px]">₱{totalRevenue.toFixed(2)}</div>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-[#1E40AF] mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Profit</span>
            </div>
            <div className="text-[20px] md:text-[24px]">₱{grossProfit.toFixed(2)}</div>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-[#3B82F6] mb-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-sm">Items Sold</span>
            </div>
            <div className="text-[20px] md:text-[24px]">{totalItems}</div>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-[#1E40AF] mb-2">
              <Package className="w-5 h-5" />
              <span className="text-sm">Transactions</span>
            </div>
            <div className="text-[20px] md:text-[24px]">{monthlySales.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="mb-4 text-[#1E40AF]">
              Income by {viewMode === 'week' ? 'Week' : 'Month'}
            </h3>
            {periodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key={`line-container-${viewMode}`}>
                <LineChart data={periodData} key={`line-chart-${viewMode}`}>
                  <defs>
                    <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
                      <stop key={`${lineGradientId}-stop-0`} offset="0%" stopColor="#1E40AF" />
                      <stop key={`${lineGradientId}-stop-100`} offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" key={`${lineGradientId}-grid`} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} key={`${lineGradientId}-xaxis`} />
                  <YAxis tick={{ fontSize: 12 }} key={`${lineGradientId}-yaxis`} />
                  <Tooltip
                    key={`${lineGradientId}-tooltip`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`₱${value.toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullLabel;
                      }
                      return label;
                    }}
                  />
                  <Line
                    key={`${lineGradientId}-line`}
                    type="monotone"
                    dataKey="revenue"
                    stroke={`url(#${lineGradientId})`}
                    strokeWidth={3}
                    dot={{ fill: '#1E40AF', r: 5 }}
                    activeDot={{ r: 7 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                No sales data yet
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="mb-4 text-[#1E40AF]">Top 5 Best Sellers (This Month)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280} key="bar-container-top-products">
                <BarChart data={chartData} key="bar-chart-top-products">
                  <defs>
                    <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop key={`${barGradientId}-stop-0`} offset="0%" stopColor="#1E40AF" />
                      <stop key={`${barGradientId}-stop-100`} offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} key={`${barGradientId}-xaxis`} />
                  <YAxis key={`${barGradientId}-yaxis`} />
                  <Tooltip key={`${barGradientId}-tooltip`} />
                  <Bar dataKey="sales" fill={`url(#${barGradientId})`} radius={[8, 8, 0, 0]} isAnimationActive={false} key={`${barGradientId}-bar`} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                No sales data yet
              </div>
            )}
          </div>
        </div>

        {topProducts.length > 0 && (
          <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="mb-4 text-[#1E40AF]">Product Performance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#3B82F6] font-semibold">{product.quantity} units</div>
                    <div className="text-xs text-gray-600">₱{product.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productsRunningOutSoon.length > 0 && (
          <div className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-orange-600">Stock Prediction - Running Out Soon</h3>
            </div>
            <div className="space-y-2">
              {productsRunningOutSoon.map(product => {
                const urgencyColor =
                  product.daysUntilOutOfStock < 3 ? 'text-orange-700 bg-orange-100' :
                  product.daysUntilOutOfStock < 7 ? 'text-orange-600 bg-orange-50' :
                  'text-yellow-700 bg-yellow-50';

                return (
                  <div key={product.id} className="bg-white/60 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Current stock: {product.stock} | Avg. daily sales: {product.dailyAverage.toFixed(1)}
                        </div>
                      </div>
                      <div className={`px-3 py-2 rounded-lg font-semibold text-sm ${urgencyColor}`}>
                        ~{Math.ceil(product.daysUntilOutOfStock)} days left
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lowStockProducts.length > 0 && (
          <div className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-orange-700">Low Stock Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center bg-white/60 p-3 rounded-lg">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-sm text-orange-700 font-semibold">{product.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
