import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { Cashier } from './components/Cashier';
import { Storage } from './components/Storage';
import { Analytics } from './components/Analytics';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  cost?: number;
  image?: string;
  category?: string;
}

interface Sale {
  items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number }>;
  total: number;
  date: Date;
}

type Tab = 'cashier' | 'storage' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('sari-products');
    const savedSales = localStorage.getItem('sari-sales');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const initialProducts: Product[] = [
        { id: '1', name: 'Coca Cola', price: 25, stock: 50, cost: 18, category: 'Drinks' },
        { id: '2', name: 'Lucky Me Noodles', price: 12, stock: 100, cost: 9, category: 'Instant Noodles' },
        { id: '3', name: 'Skyflakes Crackers', price: 35, stock: 60, cost: 28, category: 'Snacks' },
        { id: '4', name: 'Milo 3-in-1', price: 10, stock: 120, cost: 7, category: 'Drinks' },
        { id: '5', name: 'Eggs (per piece)', price: 9, stock: 80, cost: 7, category: 'Fresh Items' },
        { id: '6', name: 'Bread', price: 45, stock: 30, cost: 35, category: 'Fresh Items' },
        { id: '7', name: 'Bottled Water', price: 15, stock: 100, cost: 10, category: 'Drinks' },
        { id: '8', name: 'Shampoo Sachet', price: 8, stock: 150, cost: 5, category: 'Personal Care' },
      ];
      setProducts(initialProducts);
    }

    if (savedSales) {
      const parsed = JSON.parse(savedSales);
      setSales(parsed.map((s: Sale) => ({ ...s, date: new Date(s.date) })));
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('sari-products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (sales.length > 0) {
      localStorage.setItem('sari-sales', JSON.stringify(sales));
    }
  }, [sales]);

  const handleSale = (items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number; stock: number }>, total: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const soldItem = items.find(item => item.id === p.id);
        if (soldItem) {
          return { ...p, stock: p.stock - soldItem.quantity };
        }
        return p;
      })
    );

    const saleItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      cost: products.find(p => p.id === item.id)?.cost
    }));

    setSales(prev => [...prev, { items: saleItems, total, date: new Date() }]);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#E8746F] via-[#C44940] to-[#7A0C0C]">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="bg-[#7A0C0C] shadow-lg">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold">Sari-Sari Store POS</h1>
              <p className="text-white/70 text-sm mt-1">Point of Sale System</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('cashier')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'cashier'
                    ? 'bg-white text-[#7A0C0C] shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cashier</span>
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'storage'
                    ? 'bg-white text-[#7A0C0C] shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-white text-[#7A0C0C] shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
            {activeTab === 'cashier' && (
              <Cashier products={products} onSale={handleSale} />
            )}
            {activeTab === 'storage' && (
              <Storage products={products} onUpdate={setProducts} />
            )}
            {activeTab === 'analytics' && (
              <Analytics products={products} sales={sales} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full max-w-md mx-auto w-full">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'cashier' && (
            <Cashier products={products} onSale={handleSale} />
          )}
          {activeTab === 'storage' && (
            <Storage products={products} onUpdate={setProducts} />
          )}
          {activeTab === 'analytics' && (
            <Analytics products={products} sales={sales} />
          )}
        </div>

        <div className="bg-[#7A0C0C] border-t border-[#5A0909] shadow-lg">
          <div className="grid grid-cols-3 gap-1 p-2">
            <button
              onClick={() => setActiveTab('cashier')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'cashier'
                  ? 'bg-white text-[#7A0C0C] shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Cashier</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'storage'
                  ? 'bg-white text-[#7A0C0C] shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">Storage</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-[#7A0C0C] shadow-lg'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}