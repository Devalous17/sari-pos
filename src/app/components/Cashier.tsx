import { useState, useEffect, useRef } from 'react';
import { Search, Package, ShoppingCart, Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category?: string;
  maxStock?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CashierProps {
  products: Product[];
  onSale: (
    items: CartItem[],
    total: number,
    paymentAmount?: number,
    change?: number,
    paymentMethod?: 'cash' | 'gcash' | 'utang',
    customerId?: string,
    customerName?: string
  ) => void;
}

export function Cashier({ products, onSale }: CashierProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash' | 'utang'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualProductId, setManualProductId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunningRef = useRef(false);

  const categories = ['All', 'Canned Foods', 'Instant Noodles', 'Snacks', 'Drinks', 'Fresh Items', 'Personal Care', 'Household Items', 'Other'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else if (quantity <= item.stock) {
      setCart(cart.map(i =>
        i.id === id ? { ...i, quantity } : i
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const change = cashAmount ? parseFloat(cashAmount) - total : 0;

  const handleCompleteSale = () => {
    const payment = paymentMethod === 'gcash' ? total : (cashAmount ? parseFloat(cashAmount) : total);
    const changeAmount = paymentMethod === 'cash' && change >= 0 ? change : 0;

    onSale(
      cart,
      total,
      payment,
      changeAmount,
      paymentMethod,
      paymentMethod === 'utang' ? selectedCustomerId : undefined,
      paymentMethod === 'utang' ? selectedCustomerName : undefined
    );

    setCart([]);
    setSearchQuery('');
    setShowPayment(false);
    setCashAmount('');
    setPaymentMethod('cash');
    setSelectedCustomerId('');
    setSelectedCustomerName('');
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === manualProductId.trim());

    if (product && product.stock > 0) {
      addToCart(product);
      setManualProductId('');
      setShowManualInput(false);
    } else if (!product) {
      alert(`Product ID "${manualProductId}" not found. Please check the ID and try again.`);
    } else {
      alert(`${product.name} is out of stock.`);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScannerRunningRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        isScannerRunningRef.current = false;
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('Failed to stop scanner', err);
        isScannerRunningRef.current = false;
        html5QrCodeRef.current = null;
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    const product = products.find(p => p.id === decodedText);
    if (product && product.stock > 0) {
      addToCart(product);
      stopScanner().then(() => {
        setIsScanning(false);
        setScanError('');
      });
    } else {
      setScanError('Product not found or out of stock');
      setTimeout(() => setScanError(''), 3000);
    }
  };

  useEffect(() => {
    if (isScanning && !isScannerRunningRef.current) {
      setTimeout(() => {
        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          undefined
        ).then(() => {
          isScannerRunningRef.current = true;
          setScanError('');
        }).catch((err) => {
          console.error('Failed to start scanner', err);
          setScanError('Camera access denied or not available. Use "Enter ID" instead.');
          html5QrCodeRef.current = null;
        });
      }, 100);
    } else if (!isScanning && isScannerRunningRef.current) {
      stopScanner();
    }

    return () => {
      if (isScannerRunningRef.current) {
        stopScanner();
      }
    };
  }, [isScanning]);


  return (
    <div className="flex flex-col h-full relative">
      {/* Products Section */}
      <div className="flex flex-col flex-1 h-full">
        <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1E40AF]">Cashier</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Check Out</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border-0"
              />
            </div>
            <button
              onClick={() => setIsScanning(true)}
              className="px-4 py-3 bg-[#3B82F6] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden md:inline">Scan</span>
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className="px-4 py-3 bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              title="Enter product ID manually"
            >
              <span className="text-lg">#</span>
              <span className="hidden md:inline">Enter ID</span>
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-[#3B82F6] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50 text-left border border-gray-100"
              >
                <div className="aspect-square bg-blue-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-[#3B82F6]" />
                  )}
                </div>
                <div className="font-medium text-sm mb-1">{product.name}</div>
                {product.category && (
                  <div className="text-xs text-white bg-[#3B82F6] px-2 py-1 rounded-md inline-block mb-2">
                    {product.category}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[16px] text-[#1E40AF] font-semibold">₱{product.price}</span>
                  <span className="text-xs text-gray-500">{product.stock} left</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Modal - Universal for Mobile & Desktop */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
            <div className="bg-[#3B82F6] p-6 rounded-t-3xl flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-semibold text-white">Current Order</h3>
                <p className="text-sm text-white/80 mt-1">{cart.length} items</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-blue-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500 mt-1">₱{item.price.toFixed(2)} each</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1E40AF]">₱{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#3B82F6] rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#3B82F6] rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-[#1E40AF]">₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  handleCheckout();
                }}
                className="w-full py-4 bg-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScanning && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
          <button
            onClick={() => {
              stopScanner().then(() => {
                setIsScanning(false);
                setScanError('');
              });
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
              {!scanError ? (
                <>
                  <div id="qr-reader" className="rounded-xl overflow-hidden shadow-2xl"></div>
                  <div className="mt-4 bg-blue-500/20 border border-blue-500 rounded-xl p-3 text-center">
                    <p className="text-white text-sm">
                      <strong>Point camera at QR code</strong>
                    </p>
                    <p className="text-white/70 text-xs mt-2">
                      Generate QR codes with product IDs (1-10) at{' '}
                      <a href="https://www.figma.com/qr-code-generator/" target="_blank" rel="noopener noreferrer" className="underline">
                        Figma QR Generator
                      </a>
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 rounded-xl p-8 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                  <p className="text-white font-semibold mb-3 text-lg">Camera Not Available</p>
                  <p className="text-gray-300 text-sm mb-4">{scanError}</p>

                  <button
                    onClick={() => {
                      setIsScanning(false);
                      setShowManualInput(true);
                      setScanError('');
                    }}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all mb-2"
                  >
                    # Enter Product ID Instead
                  </button>

                  <button
                    onClick={() => {
                      setScanError('');
                      setIsScanning(false);
                      setTimeout(() => setIsScanning(true), 100);
                    }}
                    className="w-full py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#1E40AF] transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 border-t border-white/20">
            <p className="text-sm text-white/80 text-center mb-3">Quick add:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
              {products.filter(p => p.stock > 0).slice(0, 4).map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    addToCart(product);
                    setIsScanning(false);
                  }}
                  className="bg-white/20 backdrop-blur-sm p-3 rounded-xl text-left hover:bg-white/30 transition-all border border-white/30"
                >
                  <div className="text-sm font-medium text-white mb-1">{product.name}</div>
                  <div className="text-xs text-white/80">₱{product.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Product Entry Modal */}
      {showManualInput && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-green-600 p-6 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white">Enter Product ID</h3>
              <p className="text-white/80 text-sm mt-1">Type the product ID to add it to cart</p>
            </div>

            <form onSubmit={handleManualEntry} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID (1-10)
                </label>
                <input
                  type="text"
                  value={manualProductId}
                  onChange={(e) => setManualProductId(e.target.value)}
                  placeholder="Enter product ID (e.g., 1, 2, 3...)"
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#3B82F6] focus:outline-none text-lg"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">📋 Available Products:</p>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setManualProductId(p.id);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-100 rounded-lg transition-all text-sm flex justify-between items-center"
                    >
                      <span>
                        <span className="font-semibold text-[#3B82F6]">ID {p.id}:</span> {p.name}
                      </span>
                      <span className="text-xs text-gray-500">{p.stock} left</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualProductId('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-4">
            <div className="bg-[#3B82F6] p-6 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-[#1E40AF]">₱{total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#3B82F6] bg-blue-50 text-[#3B82F6] font-semibold'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'gcash'
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    📱 GCash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('utang')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'utang'
                        ? 'border-orange-600 bg-orange-50 text-orange-600 font-semibold'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    📝 Utang
                  </button>
                </div>
              </div>

              {/* Cash Payment */}
              {paymentMethod === 'cash' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cash Amount
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Enter amount received"
                      step="0.01"
                      min={total}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-[#3B82F6] focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {cashAmount && parseFloat(cashAmount) >= total && (
                    <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Change (Sukli)</span>
                        <span className="text-3xl font-bold text-green-600">
                          ₱{change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {cashAmount && parseFloat(cashAmount) < total && (
                    <div className="bg-orange-50 border-2 border-orange-300 p-4 rounded-xl">
                      <div className="text-orange-700 text-center text-sm font-medium">
                        Amount is less than total. Need ₱{(total - parseFloat(cashAmount)).toFixed(2)} more.
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* GCash Payment */}
              {paymentMethod === 'gcash' && (
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                  <div className="text-center">
                    <div className="mb-3">
                      <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-xs text-gray-500">GCash QR Code<br/>(See About page)</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      Show your GCash QR code to customer
                    </p>
                    <p className="text-xs text-gray-500">
                      Total: <span className="font-bold text-blue-600">₱{total.toFixed(2)}</span>
                    </p>
                    <div className="mt-3 bg-blue-100 p-2 rounded-lg">
                      <p className="text-xs text-blue-800">
                        ⚠️ Verify payment received before completing sale
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Utang (Credit) Payment */}
              {paymentMethod === 'utang' && (() => {
                const savedCustomers = localStorage.getItem('sari-customers');
                const customers = savedCustomers ? JSON.parse(savedCustomers) : [];
                return (
                  <div className="space-y-3">
                    <div className="bg-orange-50 border-2 border-orange-200 p-3 rounded-xl">
                      <p className="text-sm text-orange-800 font-medium">⚠️ Pay Later (Utang)</p>
                      <p className="text-xs text-orange-600 mt-1">
                        Select a customer to record this purchase as credit
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Customer
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                          setSelectedCustomerId(e.target.value);
                          const customer = customers.find((c: any) => c.id === e.target.value);
                          setSelectedCustomerName(customer?.name || '');
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-600 focus:outline-none"
                      >
                        <option value="">-- Choose a customer --</option>
                        {customers.map((customer: any) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} (₱{customer.totalUtang.toFixed(2)} existing utang)
                          </option>
                        ))}
                      </select>
                    </div>
                    {customers.length === 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                        No customers found. Please add a customer in the Utang tab first.
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setCashAmount('');
                    setPaymentMethod('cash');
                    setSelectedCustomerId('');
                    setSelectedCustomerName('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={
                    (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) ||
                    (paymentMethod === 'utang' && !selectedCustomerId)
                  }
                  className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
