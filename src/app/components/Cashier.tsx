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
}

interface CartItem extends Product {
  quantity: number;
}

interface CashierProps {
  products: Product[];
  onSale: (items: CartItem[], total: number, paymentAmount?: number, change?: number) => void;
}

export function Cashier({ products, onSale }: CashierProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showPayment, setShowPayment] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
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
    const payment = cashAmount ? parseFloat(cashAmount) : total;
    onSale(cart, total, payment, change >= 0 ? change : 0);
    setCart([]);
    setSearchQuery('');
    setShowPayment(false);
    setCashAmount('');
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
    <div className="flex flex-col md:flex-row h-full relative">
      {/* Products Section */}
      <div className="flex flex-col flex-1 h-full">
        <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
          <h2 className="mb-4 text-[#1E40AF]">Cashier</h2>
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

      {/* Cart Section - Mobile Bottom Sheet */}
      {cart.length > 0 && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="p-4 max-h-40 overflow-y-auto space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                <div className="flex-1">
                  <div className="text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">₱{item.price} × {item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#3B82F6] rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#3B82F6] rounded-lg text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Total</span>
              <span className="text-[20px] text-[#1E40AF] font-semibold">₱{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Complete Sale
            </button>
          </div>
        </div>
      )}

      {/* Cart Section - Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-96 bg-white border-l border-gray-200 shadow-lg">
        <div className="bg-[#3B82F6] p-6 text-white">
          <h3 className="text-xl font-semibold">Current Order</h3>
          <p className="text-sm text-white/70 mt-1">{cart.length} items</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p className="text-center">No items in cart<br />Select products to add</p>
            </div>
          ) : (
            cart.map(item => (
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
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
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
              onClick={handleCheckout}
              className="w-full py-4 bg-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
            >
              Complete Sale
            </button>
          </div>
        )}
      </div>


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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
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

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setCashAmount('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={!cashAmount || parseFloat(cashAmount) < total}
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
