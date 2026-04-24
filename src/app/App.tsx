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
  paymentAmount?: number;
  change?: number;
}

type Tab = 'cashier' | 'storage' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('sari-products');
    const savedSales = localStorage.getItem('sari-sales');
    const dataVersion = localStorage.getItem('sari-data-version');

    // Force update to version 6 with actual product images
    const initialProducts: Product[] = [
      { id: '1', name: 'Coca Cola', price: 25, stock: 50, cost: 18, category: 'Drinks', image: 'https://images.unsplash.com/photo-1622708862830-a026e3ef60bd?w=400&h=400&fit=crop' },
      { id: '2', name: 'Pancit Canton', price: 12, stock: 100, cost: 9, category: 'Instant Noodles', image: 'https://avicatransport.com/cdn/shop/products/PCCAL.jpg?v=1676973703' },
      { id: '3', name: 'Skyflakes Crackers', price: 35, stock: 60, cost: 28, category: 'Snacks', image: 'https://mondemysan.com.ph/wp-content/uploads/2025/09/SkyFlakes-Single_25g_.webp' },
      { id: '4', name: 'Milo 3-in-1', price: 10, stock: 120, cost: 7, category: 'Drinks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsuRCWlLEPNtlFNJ_XVDRC0ydYORASEcweDA&s' },
      { id: '5', name: 'Eggs (per piece)', price: 9, stock: 80, cost: 7, category: 'Fresh Items', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=400&fit=crop' },
      { id: '6', name: 'Bread', price: 45, stock: 30, cost: 35, category: 'Fresh Items', image: 'https://images.unsplash.com/photo-1586765501508-cffc1fe200c8?w=400&h=400&fit=crop' },
      { id: '7', name: 'Bottled Water', price: 15, stock: 100, cost: 10, category: 'Drinks', image: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400&h=400&fit=crop' },
      { id: '8', name: 'Head n Shoulders Shampoo Sachet', price: 8, stock: 150, cost: 5, category: 'Personal Care', image: 'https://bxtra.ph/images/thumbs/000/0007088_head-shoulder-shampoo-menthol-12ml.jpeg' },
      { id: '9', name: 'PureFood Corned Beef', price: 65, stock: 20, cost: 50, category: 'Canned Foods', image: 'https://deligoodph.com/cdn/shop/products/PFcornedbeef210grams_540x.jpg?v=1634134648' },
      { id: '10', name: 'Trash Bag 50 pcs', price: 85, stock: 15, cost: 65, category: 'Household Items', image: 'https://static.vecteezy.com/system/resources/previews/044/267/179/non_2x/black-garbage-bag-isolated-on-transparent-background-free-png.png' },
    ];

    if (!dataVersion || dataVersion !== '6') {
      localStorage.setItem('sari-data-version', '6');
      setProducts(initialProducts);
      localStorage.setItem('sari-products', JSON.stringify(initialProducts));
    } else if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
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

  const handleSale = (items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number; stock: number }>, total: number, paymentAmount?: number, change?: number) => {
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

    setSales(prev => [...prev, { items: saleItems, total, date: new Date(), paymentAmount, change }]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col h-full max-w-[1400px] mx-auto w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-[#1E40AF] text-2xl font-bold">Sari-Sari Store POS</h1>
              <p className="text-gray-500 text-sm mt-1">Point of Sale System</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('cashier')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'cashier'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cashier</span>
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'storage'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
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
          <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
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

        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-3 gap-1 p-2">
            <button
              onClick={() => setActiveTab('cashier')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'cashier'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">Cashier</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'storage'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-xs">Storage</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-4 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
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
