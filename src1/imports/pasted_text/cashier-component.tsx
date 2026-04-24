import { useState } from 'react';
import { Search, Package, Camera, X } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CashierProps {
  products: Product[];
  onSale: (items: CartItem[], total: number) => void;
}

export function Cashier({ products, onSale }: CashierProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [cashAmount, setCashAmount] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleCompleteSale = () => {
    onSale(cart, total);
    setCart([]);
    setSearchQuery('');
    setShowPayment(false);
    setCashAmount('');
  };

  const change = cashAmount ? parseFloat(cashAmount) - total : 0;

  const handleScan = (product: Product) => {
    setScanAnimation(true);
    setTimeout(() => {
      addToCart(product);
      setScanAnimation(false);
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row h-full relative">
      {/* Products Section */}
      <div className="flex flex-col flex-1 h-full">
        <div className="bg-gradient-to-r from-[#E8746F] to-[#C44940] p-4 md:p-6 shadow-sm">
          <h2 className="mb-4 text-white">Cashier</h2>
          <div className="flex gap-2">
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
              className="px-4 py-3 bg-white text-[#7A0C0C] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden md:inline">Scan</span>
            </button>
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
                <div className="aspect-square bg-gradient-to-br from-[#E8746F]/20 to-[#D9381E]/20 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-[#D9381E]" />
                  )}
                </div>
                <div className="font-medium text-sm mb-1">{product.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[16px] text-[#7A0C0C] font-semibold">₱{product.price}</span>
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
              <div key={item.id} className="flex items-center justify-between bg-gradient-to-r from-[#E8746F]/20 to-[#D9381E]/20 p-3 rounded-xl">
                <div className="flex-1">
                  <div className="text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500">₱{item.price} × {item.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#D9381E] rounded-lg text-[#D9381E] hover:bg-[#D9381E]/10 transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#D9381E] rounded-lg text-[#D9381E] hover:bg-[#D9381E]/10 transition-all"
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
              <span className="text-[20px] text-[#7A0C0C] font-semibold">₱{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-[#7A0C0C] to-[#D9381E] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Complete Sale
            </button>
          </div>
        </div>
      )}

      {/* Cart Section - Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-96 bg-white border-l border-gray-200 shadow-lg">
        <div className="bg-gradient-to-r from-[#7A0C0C] to-[#D9381E] p-6 text-white">
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
              <div key={item.id} className="bg-gradient-to-r from-[#E8746F]/10 to-[#D9381E]/10 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">₱{item.price.toFixed(2)} each</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#7A0C0C]">₱{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#D9381E] rounded-lg text-[#D9381E] hover:bg-[#D9381E]/10 transition-all"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#D9381E] rounded-lg text-[#D9381E] hover:bg-[#D9381E]/10 transition-all"
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
                  <span className="text-2xl font-bold text-[#7A0C0C]">₱{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-[#7A0C0C] to-[#D9381E] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg"
            >
              Complete Sale
            </button>
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {isScanning && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col">
          {/* Camera View */}
          <div className="flex-1 relative overflow-hidden">
            {/* Simulated camera background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-12 h-full w-full">
                  {Array.from({ length: 96 }).map((_, i) => (
                    <div key={i} className="border border-gray-700"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-48">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white"></div>

                {/* Scanning line animation */}
                {!scanAnimation && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#D9381E] shadow-lg shadow-[#D9381E]/50 animate-scan"></div>
                )}

                {/* Barcode icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-1 opacity-30">
                    {[3, 2, 4, 2, 3, 2, 4, 3, 2, 3].map((height, i) => (
                      <div
                        key={i}
                        className="bg-white"
                        style={{ width: '4px', height: `${height * 12}px` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Scan success indicator */}
                {scanAnimation && (
                  <div className="absolute inset-0 bg-[#D9381E]/20 border-4 border-[#D9381E] rounded-lg flex items-center justify-center animate-pulse">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">✓</div>
                      <div className="text-sm">Scanned!</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-24 inset-x-0 text-center text-white px-4">
              <p className="text-lg font-medium mb-2">Point camera at barcode</p>
              <p className="text-sm text-white/70">Tap a product below to simulate scanning</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsScanning(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Quick scan product list */}
          <div className="bg-white p-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-3">Tap to scan:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {products.filter(p => p.stock > 0).slice(0, 8).map(product => (
                <button
                  key={product.id}
                  onClick={() => handleScan(product)}
                  disabled={scanAnimation}
                  className="bg-gradient-to-r from-[#E8746F]/10 to-[#D9381E]/10 p-3 rounded-xl text-left hover:from-[#E8746F]/20 hover:to-[#D9381E]/20 transition-all disabled:opacity-50 border border-gray-200"
                >
                  <div className="text-sm font-medium text-gray-800 mb-1">{product.name}</div>
                  <div className="text-xs text-[#7A0C0C] font-semibold">₱{product.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-[#7A0C0C] to-[#D9381E] p-6 rounded-t-2xl">
              <h3 className="text-xl font-semibold text-white">Complete Payment</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-[#E8746F]/20 to-[#D9381E]/20 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-[#7A0C0C]">₱{total.toFixed(2)}</span>
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
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-[#7A0C0C] focus:outline-none"
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
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl">
                  <div className="text-red-600 text-center text-sm">
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
                  className="flex-1 py-3 bg-gradient-to-r from-[#7A0C0C] to-[#D9381E] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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