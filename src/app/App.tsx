import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Package, ShoppingCart, BarChart3, UserCircle, Info } from 'lucide-react';
import { Cashier } from './components/Cashier';
import { Storage } from './components/Storage';
import { Analytics } from './components/Analytics';
import { Utang } from './components/Utang';
import { About } from './components/About';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  cost?: number;
  image?: string;
  category?: string;
  maxStock?: number;
}

interface Sale {
  items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number }>;
  total: number;
  date: Date;
  paymentAmount?: number;
  change?: number;
  paymentMethod?: 'cash' | 'gcash' | 'utang';
  customerId?: string;
  customerName?: string;
}

type Tab = 'cashier' | 'storage' | 'analytics' | 'utang' | 'about';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('sari-products');
    const savedSales = localStorage.getItem('sari-sales');
    const dataVersion = localStorage.getItem('sari-data-version');

    // Updated product list - version 11 with cigarettes and alcohol, reduced snacks/drinks stock
    const initialProducts: Product[] = [
      { id: '1', name: 'Coca Cola', price: 25, stock: 47, cost: 18, category: 'Drinks', image: 'https://images.unsplash.com/photo-1622708862830-a026e3ef60bd?w=400&h=400&fit=crop', maxStock: 50 },
      { id: '2', name: 'Pancit Canton Kalamansi', price: 20, stock: 100, cost: 15, category: 'Instant Noodles', image: 'https://avicatransport.com/cdn/shop/products/PCCAL.jpg?v=1676973703', maxStock: 100 },
      { id: '3', name: 'Pancit Canton Original', price: 20, stock: 100, cost: 15, category: 'Instant Noodles', image: 'https://luckyme.ph/static/uploads/products/product_16_3dbc1962.webp', maxStock: 100 },
      { id: '4', name: 'Pancit Canton Sweet and Spicy', price: 20, stock: 100, cost: 15, category: 'Instant Noodles',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxzxahjF2aB9roK6zfAng1hFJl9XXWqeZumw&s', maxStock: 100 },
      { id: '5', name: 'Pancit Canton Chilimansi', price: 20, stock: 100, cost: 15, category: 'Instant Noodles', image: 'https://store.iloilosupermart.com/wp-content/uploads/2020/05/87456456.jpg', maxStock: 100 },
      { id: '6', name: 'Skyflakes', price: 10, stock: 45, cost: 7, category: 'Snacks', image: 'https://mondemysan.com.ph/wp-content/uploads/2025/09/SkyFlakes-Single_25g_.webp', maxStock: 60 },
      { id: '7', name: 'Fudgee Barr', price: 10, stock: 65, cost: 7, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvn3PLEsSESwg5pNFgM6uBQ8aSfwpmFmEsGg&s', maxStock: 80 },
      { id: '8', name: 'Pillows', price: 10, stock: 65, cost: 7, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiCZaRtw6tjXpzZAWlW_-RRftKRAcgXzA2-Q&s', maxStock: 80 },
      { id: '9', name: 'Loaded', price: 10, stock: 65, cost: 7, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR2rgZA7X2iSgB1e9RfMMr_OozBEmMS9ec7A&s', maxStock: 80 },
      { id: '10', name: 'Milo', price: 10, stock: 117, cost: 7, category: 'Drinks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsuRCWlLEPNtlFNJ_XVDRC0ydYORASEcweDA&s', maxStock: 120 },
      { id: '11', name: 'Mountain Dew', price: 25, stock: 47, cost: 18, category: 'Drinks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIlqo3VzluyktDhXFlDhDckg0tgBpZd-Hk2A&s', maxStock: 50 },
      { id: '12', name: 'Bottled Water', price: 15, stock: 97, cost: 10, category: 'Drinks', image: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?w=400&h=400&fit=crop', maxStock: 100 },
      { id: '13', name: 'Eggs', price: 9, stock: 80, cost: 7, category: 'Fresh Items', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=400&fit=crop', maxStock: 80 },
      { id: '14', name: 'Malunggay Pandesal', price: 2, stock: 100, cost: 1, category: 'Fresh Items', image: 'https://seasiderecipes.com/wp-content/uploads/malunggay-pan-de-sal-recipe.jpg', maxStock: 100 },
      { id: '15', name: 'Head n Shoulders Shampoo Sachet', price: 8, stock: 150, cost: 5, category: 'Personal Care', image: 'https://bxtra.ph/images/thumbs/000/0007088_head-shoulder-shampoo-menthol-12ml.jpeg', maxStock: 150 },
      { id: '16', name: 'Century Tuna', price: 65, stock: 30, cost: 50, category: 'Canned Foods', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh6SRMhf9Pk-kQAHlZsYZrynk-G9Z3vb23iw&s', maxStock: 30 },
      { id: '17', name: '555 Tuna', price: 65, stock: 30, cost: 50, category: 'Canned Foods', image: 'https://www.centurypacific.com.ph/wp-content/uploads/2020/12/cans-AFRITADA-scaled.jpg', maxStock: 30 },
      { id: '18', name: 'PureFood Corned Beef', price: 65, stock: 20, cost: 50, category: 'Canned Foods', image: 'https://deligoodph.com/cdn/shop/products/PFcornedbeef210grams_540x.jpg?v=1634134648', maxStock: 20 },
      { id: '19', name: 'Trash Bag', price: 5, stock: 50, cost: 3, category: 'Household Items', image: 'https://static.vecteezy.com/system/resources/previews/044/267/179/non_2x/black-garbage-bag-isolated-on-transparent-background-free-png.png', maxStock: 50 },
      { id: '20', name: 'Oishi Prawn Crackers (S)', price: 8, stock: 25, cost: 6.50, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd5fNYvVXWYJZ33sh_NMrbNF0pFuxhZsoO9Q&s', maxStock: 40 },
      { id: '21', name: 'Nova Multigrain (S)', price: 17, stock: 20, cost: 14.50, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVXmE_ukklWBgAgAFj3XvNGbsa-5qCp5XD6A&s', maxStock: 35 },
      { id: '22', name: 'Ding Dong Mixed Nuts', price: 9, stock: 35, cost: 7, category: 'Snacks', image: 'https://www.rebisco.com.ph/941-thickbox_default/dingdong-mixed-nuts-original.jpg', maxStock: 50 },
      { id: '23', name: 'Piattos Cheese (S)', price: 17, stock: 15, cost: 14.50, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIgsfd20JcIbkPHL9UbYivOUK2HUTrxRC-tQ&s', maxStock: 30 },
      { id: '24', name: 'Chippy Mild & Tasty', price: 9, stock: 30, cost: 7, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTC3P_sxN-XwKE1E1oZZtWRf3zMe_3h6Nl0Cw&s', maxStock: 45 },
      { id: '25', name: 'Vcut Potato Chips', price: 17, stock: 17, cost: 14.50, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdy6FtvX2bX9bULBZkcMTZ0e-JBV78ySRtAQ&s',  maxStock: 32 },
      { id: '26', name: 'Mr. Chips (S)', price: 9, stock: 33, cost: 7, category: 'Snacks', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjX4HG9C43vc6qRyoOkbTXWyShN8qVdCuGjQ&s', maxStock: 48 },
      { id: '27', name: 'Carcklings (S)', price: 8, stock: 25, cost: 6, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQbhJwNul3HspkCElz1T88bTcpMYzrMAFT0A&s',  maxStock: 40 },
      { id: '28', name: 'Hansel Mocha Sandwich', price: 10, stock: 20, cost: 7.50, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsQR9_6-taxQCtbHMvS0ZMzK3y-Yft_YK0Cw&s',  maxStock: 35 },
      { id: '29', name: 'Cream-O (3pcs pack)', price: 10, stock: 15, cost: 8, category: 'Snacks',image: 'https://ever.ph/cdn/shop/files/9000005833-Cream-O-Vanilla-90g-201123_19448866-98d1-4819-a8d0-52b18c077c4c.jpg?v=1725258903',  maxStock: 30 },
      { id: '30', name: 'Stick-O (Single Tub)', price: 85, stock: 15, cost: 65, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMeNT-sge1oUHe6v6AgV9Z2k29PDu3eeT4Gw&s',  maxStock: 30 },
      { id: '31', name: 'Cloud 9 Classic', price: 11, stock: 35, cost: 8.50, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9OxZIMeVTKnqqFF11JFR559DSi_a91gOUNg&s',  maxStock: 50 },
      { id: '32', name: 'Choc-Nut (24s pack)', price: 55, stock: 10, cost: 42, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLsd3ETVq4-SGqV85YLKutmqZTJRSG3yEsjw&s',  maxStock: 25 },
      { id: '33', name: 'Potchi Gummy (Sachet)', price: 8, stock: 25, cost: 6, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8y1jS3sbVY7Cd2mRP-U8EceU7_ko4rHKwYg&s',  maxStock: 40 },
      { id: '34', name: 'Super Crunch (Corn)', price: 2, stock: 35, cost: 1, category: 'Snacks',image: 'https://images.freshop.ncrcloud.com/1564405684710279265/f6af6f7503a410edfb51cb2b0db8a707_large.png',  maxStock: 50 },
      { id: '35', name: 'Boy Bawang (Small)', price: 8, stock: 30, cost: 6, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjRkjB3FufpxChQ5txOj4S-QFzoHMKaTzVxA&s',  maxStock: 45 },
      { id: '36', name: 'Clover Chips (S)', price: 9, stock: 23, cost: 7, category: 'Snacks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR40AYkeIN2otUa4zhm8S8qtBWIdFZHsRId0Q&s',  maxStock: 38 },
      { id: '42', name: 'Kopiko Blanca (Sachet)', price: 12, stock: 47, cost: 9.50, category: 'Drinks',image: 'https://k2pharmacy.ph/cdn/shop/files/Kopiko_BlancaTwinPack58g-Resized1_grande.jpg?v=1713142796',  maxStock: 50 },
      { id: '43', name: 'Nescafe Original (3-in-1)', price: 13, stock: 47, cost: 10, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPWNPjbkEb1AMHtWxqHOA1M2kME4yqdpbMmQ&s',  maxStock: 50 },
      { id: '44', name: 'C2 Green Tea (230ml)', price: 17, stock: 27, cost: 14, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc7GlYreYyON7LA2h_GoczPE0HMQGnCFURdw&s',  maxStock: 30 },
      { id: '47', name: 'Royal Tru-Orange (Mismo)', price: 22, stock: 22, cost: 18, category: 'Drinks',image: 'https://www.magicstarsupermarket.com/cdn/shop/products/download_46_580x.jpg?v=1590302413',  maxStock: 25 },
      { id: '48', name: 'Mountain Dew (290ml)', price: 20, stock: 27, cost: 16, category: 'Drinks',image: 'https://cdn.store-assets.com/s/377840/i/16427684.jpeg',  maxStock: 30 },
      { id: '49', name: 'Sting Energy (Strawberry)', price: 22, stock: 25, cost: 18, category: 'Drinks',image: 'https://zbga.shopsuki.ph/cdn/shop/files/480392503342_1024x.jpg?v=1733891475',  maxStock: 28 },
      { id: '50', name: 'Chuckie (180ml)', price: 28, stock: 27, cost: 24, category: 'Drinks',image: 'https://images.freshop.ncrcloud.com/1564405684702540403/48dd27e587e548bcec2d8589f52ee892_large.png',  maxStock: 30 },
      { id: '51', name: 'Zesto Big 250 (Orange)', price: 12, stock: 42, cost: 9.50, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHwwk7pD_uPlpyYKDCjtJO_k6use7-CgDRRA&s',  maxStock: 45 },
      { id: '52', name: 'Red Horse (500ml Bottle)', price: 65, stock: 21, cost: 58, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStE2rxPubiUen8bBLah68MfUApLp2eucPh3g&s',  maxStock: 24 },
      { id: '53', name: 'San Mig Light (Can)', price: 70, stock: 21, cost: 62, category: 'Drinks',image: 'https://store.iloilosupermart.com/wp-content/uploads/2020/12/878798.jpg',  maxStock: 24 },
      { id: '54', name: 'Marlboro Light', price: 10, stock: 50, cost: 7.50, category: 'Other',image: 'https://www.srssulit.com/wp-content/uploads/products/9338-3.png',  maxStock: 50 },
      { id: '55', name: 'Marlboro Blue', price: 10, stock: 50, cost: 7.50, category: 'Other',image: 'https://www.srssulit.com/wp-content/uploads/products/28700-3.png',  maxStock: 50 },
      { id: '56', name: 'Camel', price: 10, stock: 50, cost: 7.50, category: 'Other',image: 'https://www.magicstarsupermarket.com/cdn/shop/products/C-LOCAL-22_CIGARETTE_LOCAL_WINSTON_LIGHT_HARD_PACK_1024x1024_c3c955da-68df-431b-a69f-514529530cb0_580x.jpg?v=1592192822',  maxStock: 50 },
      { id: '57', name: 'Mighty', price: 10, stock: 50, cost: 7.50, category: 'Other',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlO9z7ta8Ahg2oEe6vc74mo7F-3m29yMkXEw&s',  maxStock: 50 },
      { id: '58', name: 'Winston Light', price: 10, stock: 50, cost: 7.50, category: 'Other',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR26CweOiVb52wi8g0Wcf16zgk_hZrmJCPQSA&s',  maxStock: 50 },
      { id: '59', name: 'Gin 2x2', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://images.freshop.ncrcloud.com/1564405684702538189/ebd347d598d912f1ac7d293427734ac8_large.png',  maxStock: 10 },
      { id: '60', name: 'Gin 4x4', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHRpR-_MUzRADPZ96f2_B61XjVXW2YELG62A&s',  maxStock: 10 },
      { id: '61', name: 'Primera', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://ever.ph/cdn/shop/files/100000093155-Primera-Light-Premium-Brandy-1L-230626_18ea256d-ebac-46ab-9f83-e5f0e4baa2d6.jpg?v=1770003845',  maxStock: 10 },
      { id: '62', name: 'Red Horse (Bottle)', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQry8jAeGx6xL0YeuPgctj474_CyyI9JmuRIA&s',  maxStock: 10 },
      { id: '63', name: 'Emperador Lights', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCJL_dD6vPw6pdAat0mxgeTgRedGwk_qsUdw&s',  maxStock: 10 },
      { id: '64', name: 'Alfonso Light', price: 150, stock: 10, cost: 120, category: 'Drinks',image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyGGj6GSQD3ScSSQrNkItGzEu8yw7FNowDtw&s',  maxStock: 10 },
    ];

    if (!dataVersion || dataVersion !== '11') {
      localStorage.setItem('sari-data-version', '11');
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

  const handleSale = (
    items: Array<{ id: string; name: string; price: number; quantity: number; cost?: number; stock: number }>,
    total: number,
    paymentAmount?: number,
    change?: number,
    paymentMethod?: 'cash' | 'gcash' | 'utang',
    customerId?: string,
    customerName?: string
  ) => {
    // Only deduct stock if not utang (credit will be tracked separately)
    if (paymentMethod !== 'utang') {
      setProducts(prevProducts =>
        prevProducts.map(p => {
          const soldItem = items.find(item => item.id === p.id);
          if (soldItem) {
            return { ...p, stock: p.stock - soldItem.quantity };
          }
          return p;
        })
      );
    }

    const saleItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      cost: products.find(p => p.id === item.id)?.cost
    }));

    setSales(prev => [...prev, {
      items: saleItems,
      total,
      date: new Date(),
      paymentAmount,
      change,
      paymentMethod: paymentMethod || 'cash',
      customerId,
      customerName
    }]);

    // If utang, update customer's utang record
    if (paymentMethod === 'utang' && customerId) {
      const savedCustomers = localStorage.getItem('sari-customers');
      if (savedCustomers) {
        const customers = JSON.parse(savedCustomers);
        const updatedCustomers = customers.map((c: any) => {
          if (c.id === customerId) {
            const newTransaction = {
              id: Date.now().toString(),
              items: saleItems,
              total,
              date: new Date(),
              paid: 0,
              balance: total
            };
            return {
              ...c,
              totalUtang: c.totalUtang + total,
              transactions: [...c.transactions, newTransaction]
            };
          }
          return c;
        });
        localStorage.setItem('sari-customers', JSON.stringify(updatedCustomers));
      }
    }
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
              <button
                onClick={() => setActiveTab('utang')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'utang'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserCircle className="w-5 h-5" />
                <span>Utang</span>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  activeTab === 'about'
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Info className="w-5 h-5" />
                <span>About</span>
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
            {activeTab === 'utang' && (
              <Utang />
            )}
            {activeTab === 'about' && (
              <About />
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
          {activeTab === 'utang' && (
            <Utang />
          )}
          {activeTab === 'about' && (
            <About />
          )}
        </div>

        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-5 gap-1 p-2">
            <button
              onClick={() => setActiveTab('cashier')}
              className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'cashier'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px]">Cashier</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'storage'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px]">Storage</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px]">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('utang')}
              className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'utang'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-[10px]">Utang</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === 'about'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Info className="w-5 h-5" />
              <span className="text-[10px]">About</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
