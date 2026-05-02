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
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunningRef = useRef(false);

  const categories = ['All', 'Canned Foods', 'Instant Noodles', 'Snacks', 'Drinks', 'Fresh Items', 'Personal Care', 'Household Items', 'Other'];

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Category background colors (light colors with hint of white)
  const getCategoryColor = (category?: string): string => {
    const colorMap: Record<string, string> = {
      'Canned Foods': 'bg-amber-50',
      'Instant Noodles': 'bg-orange-50',
      'Snacks': 'bg-yellow-50',
      'Drinks': 'bg-blue-50',
      'Fresh Items': 'bg-green-50',
      'Personal Care': 'bg-purple-50',
      'Household Items': 'bg-pink-50',
      'Other': 'bg-gray-50'
    };
    return category ? colorMap[category] || 'bg-white' : 'bg-white';
  };

  // Auto-focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get quantity in cart for a product
  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

  // Quick add/remove from product card
  const incrementProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const decrementProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = cart.find(i => i.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  // Handle clicking on quantity to edit
  const handleQuantityClick = (productId: string, currentQuantity: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingQuantity(productId);
    setQuantityInput(currentQuantity.toString());
  };

  // Handle submitting edited quantity
  const handleQuantitySubmit = (productId: string, maxStock: number) => {
    const newQuantity = parseInt(quantityInput);
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= maxStock) {
      updateQuantity(productId, newQuantity);
    }
    setEditingQuantity(null);
    setQuantityInput('');
  };

  // Handle canceling edit
  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setQuantityInput('');
  };

  // Calculate stock percentage
  const getStockPercentage = (product: Product) => {
    const max = product.maxStock || product.stock;
    return (product.stock / max) * 100;
  };

  // Get stock color based on percentage
  const getStockColor = (percentage: number) => {
    if (percentage < 20) return 'bg-[#FF5630]'; // Red
    if (percentage < 50) return 'bg-[#FF991F]'; // Orange
    return 'bg-[#36B37E]'; // Green
  };

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
                className="px-6 py-3 bg-[#0052CC] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Check Out</span>
                <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            )}
          </div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 focus:border-[#0052CC] focus:outline-none text-lg shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsScanning(true)}
              className="px-4 py-4 bg-[#0052CC] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span className="hidden md:inline">Scan</span>
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className="px-4 py-4 bg-[#36B37E] text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
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
                className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-semibold ${
                  selectedCategory === category
                    ? 'bg-[#0052CC] text-white shadow-md'
                    : 'bg-[#F4F7FE] text-[#091E42] hover:bg-[#E3E8F0]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map(product => {
              const stockPercentage = getStockPercentage(product);
              const cartQty = getCartQuantity(product.id);
              const isLowStock = stockPercentage <= 30;

              return (
                <div
                  key={product.id}
                  className={`${getCategoryColor(product.category)} rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,82,204,0.06)] hover:shadow-[0_8px_30px_rgba(0,82,204,0.12)] transition-all border border-[rgba(0,82,204,0.1)] relative`}
                >
                  {/* Stock Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold ${
                    isLowStock ? 'bg-[#FF5630] text-white' : 'bg-[#36B37E] text-white'
                  }`}>
                    {Math.round(stockPercentage)}%
                  </div>

                  {/* Product Image */}
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full"
                  >
                    <div className="aspect-square bg-[#F4F7FE] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-12 h-12 text-[#0052CC]" />
                      )}
                    </div>
                  </button>

                  {/* Product Name */}
                  <div className="font-semibold text-sm text-[#091E42] mb-2 line-clamp-2">{product.name}</div>

                  {/* Category */}
                  {product.category && (
                    <div className="text-xs text-white bg-[#0052CC] px-2 py-1 rounded-lg inline-block mb-2">
                      {product.category}
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-2xl font-bold text-[#0052CC] mb-3">₱{product.price.toFixed(2)}</div>

                  {/* Tingi Quantity Toggle */}
                  {cartQty > 0 ? (
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={(e) => decrementProduct(product.id, e)}
                        className="w-10 h-10 flex items-center justify-center bg-[#F4F7FE] border-2 border-[#0052CC] rounded-xl text-[#0052CC] hover:bg-[#0052CC] hover:text-white transition-all font-bold text-lg"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        {editingQuantity === product.id ? (
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              value={quantityInput}
                              onChange={(e) => setQuantityInput(e.target.value)}
                              onBlur={() => handleQuantitySubmit(product.id, product.stock)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleQuantitySubmit(product.id, product.stock);
                                } else if (e.key === 'Escape') {
                                  handleQuantityCancel();
                                }
                              }}
                              autoFocus
                              min="1"
                              max={product.stock}
                              className="w-full text-center text-2xl font-bold text-[#0052CC] border-2 border-[#0052CC] rounded-lg px-2 py-1 focus:outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="text-[10px] text-gray-500">Enter/Esc</div>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => handleQuantityClick(product.id, cartQty, e)}
                            className="cursor-pointer hover:bg-white/50 rounded-lg p-1 transition-all"
                          >
                            <div className="text-2xl font-bold text-[#0052CC]">{cartQty}</div>
                            <div className="text-xs text-gray-500">tap to edit</div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => incrementProduct(product, e)}
                        disabled={cartQty >= product.stock}
                        className="w-10 h-10 flex items-center justify-center bg-[#0052CC] border-2 border-[#0052CC] rounded-xl text-white hover:bg-[#003d99] transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full py-2.5 bg-[#0052CC] text-white rounded-xl font-semibold hover:bg-[#003d99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3 text-sm"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}

                  {/* Visual Stock Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Stock</span>
                      <span className="font-semibold">{product.stock} / {product.maxStock || product.stock}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getStockColor(stockPercentage)}`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Total Bar (Mobile Only) */}
      {totalItems > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0052CC] text-white p-4 shadow-[0_-4px_20px_rgba(0,82,204,0.3)] z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium opacity-90">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</div>
                <div className="text-2xl font-bold">₱{total.toFixed(2)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <span className="font-semibold">View Cart</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal - Universal for Mobile & Desktop */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
            <div className="bg-[#0052CC] p-6 rounded-t-3xl flex justify-between items-center">
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
                <div key={item.id} className="bg-[#F4F7FE] p-4 rounded-xl border border-[rgba(0,82,204,0.1)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[#091E42]">{item.name}</div>
                      <div className="text-sm text-gray-500 mt-1">₱{item.price.toFixed(2)} each</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0052CC] text-lg">₱{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#0052CC] rounded-xl text-[#0052CC] hover:bg-[#0052CC] hover:text-white transition-all font-bold"
                    >
                      −
                    </button>
                    {editingQuantity === item.id ? (
                      <div className="flex-1">
                        <input
                          type="number"
                          value={quantityInput}
                          onChange={(e) => setQuantityInput(e.target.value)}
                          onBlur={() => handleQuantitySubmit(item.id, item.stock)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleQuantitySubmit(item.id, item.stock);
                            } else if (e.key === 'Escape') {
                              handleQuantityCancel();
                            }
                          }}
                          autoFocus
                          min="1"
                          max={item.stock}
                          className="w-full text-center text-xl font-bold text-[#0052CC] border-2 border-[#0052CC] rounded-lg px-2 py-2 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={(e) => handleQuantityClick(item.id, item.quantity, e)}
                        className="flex-1 text-center font-bold text-xl text-[#0052CC] cursor-pointer hover:bg-white rounded-lg py-2 transition-all"
                      >
                        {item.quantity}
                      </div>
                    )}
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-10 h-10 flex items-center justify-center bg-[#0052CC] border-2 border-[#0052CC] rounded-xl text-white hover:bg-[#003d99] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-[#F4F7FE] rounded-b-3xl">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#091E42]">Total</span>
                    <span className="text-3xl font-bold text-[#0052CC]">₱{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  handleCheckout();
                }}
                className="w-full py-4 bg-[#0052CC] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-lg hover:bg-[#003d99]"
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
            <div className="bg-[#0052CC] p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Complete Payment</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#F4F7FE] p-4 rounded-xl border border-[rgba(0,82,204,0.1)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="text-3xl font-bold text-[#0052CC]">₱{total.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#091E42]">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                      paymentMethod === 'cash'
                        ? 'border-[#36B37E] bg-green-50 text-[#36B37E] shadow-md'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                      paymentMethod === 'gcash'
                        ? 'border-[#0052CC] bg-blue-50 text-[#0052CC] shadow-md'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    📱 GCash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('utang')}
                    className={`p-3 rounded-xl border-2 transition-all font-semibold ${
                      paymentMethod === 'utang'
                        ? 'border-[#FF5630] bg-orange-50 text-[#FF5630] shadow-md'
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
                    <label className="block text-sm font-bold text-[#091E42]">
                      Cash Amount
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Enter amount received"
                      step="0.01"
                      min={total}
                      className="w-full px-4 py-4 text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-[#36B37E] focus:outline-none text-[#091E42]"
                      autoFocus
                    />
                  </div>

                  {cashAmount && parseFloat(cashAmount) >= total && (
                    <div className="bg-green-50 border-2 border-[#36B37E] p-4 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-bold">Change (Sukli)</span>
                        <span className="text-3xl font-bold text-[#36B37E]">
                          ₱{change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {cashAmount && parseFloat(cashAmount) < total && (
                    <div className="bg-orange-50 border-2 border-[#FF991F] p-4 rounded-xl">
                      <div className="text-[#FF991F] text-center text-sm font-bold">
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
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={
                    (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) ||
                    (paymentMethod === 'utang' && !selectedCustomerId)
                  }
                  className="flex-1 py-4 bg-[#0052CC] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold hover:bg-[#003d99] disabled:opacity-50 disabled:cursor-not-allowed"
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
