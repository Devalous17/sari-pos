import { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

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

interface StorageProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
}

export function Storage({ products, onUpdate }: StorageProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    cost: '',
    image: '',
    category: '',
    maxStock: ''
  });

  const categories = [
    'All',
    'Low Stock',
    'Canned Foods',
    'Instant Noodles',
    'Snacks',
    'Drinks',
    'Fresh Items',
    'Personal Care',
    'Household Items',
    'Other'
  ];

  const isLowStock = (product: Product) => {
    const maxStock = product.maxStock || product.stock;
    const threshold = maxStock * 0.3;
    return product.stock <= threshold;
  };

  const filteredProducts = products
    .filter(p => {
      if (selectedCategory === 'Low Stock') {
        return isLowStock(p);
      }
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesCategory;
    })
    .sort((a, b) => {
      // Low stock items (30% or less of max) first
      const aLowStock = isLowStock(a);
      const bLowStock = isLowStock(b);

      if (aLowStock && !bLowStock) return -1;
      if (!aLowStock && bLowStock) return 1;

      // Within low stock items, sort by percentage remaining (lowest first)
      if (aLowStock && bLowStock) {
        const aPercent = a.stock / (a.maxStock || a.stock);
        const bPercent = b.stock / (b.maxStock || b.stock);
        return aPercent - bPercent;
      }

      // For normal stock items, maintain original order
      return 0;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stockValue = parseInt(formData.stock);
    const newProduct: Product = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: stockValue,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      image: formData.image || undefined,
      category: formData.category || undefined,
      maxStock: formData.maxStock ? parseInt(formData.maxStock) : stockValue
    };

    if (editingId) {
      onUpdate(products.map(p => p.id === editingId ? newProduct : p));
    } else {
      onUpdate([...products, newProduct]);
    }

    setFormData({ name: '', price: '', stock: '', cost: '', image: '', category: '', maxStock: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      cost: product.cost?.toString() || '',
      image: product.image || '',
      category: product.category || '',
      maxStock: product.maxStock?.toString() || product.stock.toString()
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    onUpdate(products.filter(p => p.id !== id));
  };

  const handleCancel = () => {
    setFormData({ name: '', price: '', stock: '', cost: '', image: '', category: '', maxStock: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-[#1E40AF]">Inventory</h2>
            <p className="text-sm text-gray-500 mt-1 hidden md:block">{products.length} products in stock</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 md:px-6 py-2 md:py-3 bg-[#0052CC] text-white rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Product</span>
            <span className="md:hidden">Add</span>
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
                  ? category === 'Low Stock'
                    ? 'bg-[#FF5630] text-white shadow-md'
                    : 'bg-[#0052CC] text-white shadow-md'
                  : category === 'Low Stock'
                  ? 'bg-orange-100 text-[#FF5630] hover:bg-orange-200'
                  : 'bg-[#F4F7FE] text-[#091E42] hover:bg-[#E3E8F0]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="p-4 md:p-6 bg-white border-b shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-[#1E40AF]">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <input
                type="number"
                placeholder="Current Stock Quantity"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
              />
              <input
                type="number"
                placeholder="Max Stock (Optional - defaults to current)"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <input
                type="number"
                placeholder="Price (₱)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                step="0.01"
                required
                className="px-4 py-3 bg-gray-100 rounded-xl border-0"
              />
              <input
                type="number"
                placeholder="Cost (₱)"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                step="0.01"
                className="px-4 py-3 bg-gray-100 rounded-xl border-0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0"
              >
                <option value="">Select a category</option>
                {categories.filter(cat => cat !== 'All' && cat !== 'Low Stock').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Product Image (Optional)</label>
              {formData.image && (
                <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute top-1 right-1 bg-gray-700 hover:bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl border-0 text-sm"
              />
            </div>

            <div className="flex gap-2 md:gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#0052CC] text-white rounded-xl shadow-md hover:shadow-lg transition-all font-bold hover:bg-[#003d99]"
              >
                {editingId ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-center">No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts.map(product => {
              const lowStock = isLowStock(product);
              return (
              <div
                key={product.id}
                className={`p-4 md:p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,82,204,0.06)] hover:shadow-[0_8px_30px_rgba(0,82,204,0.12)] transition-all ${
                  lowStock
                    ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-[#FF5630] shadow-lg'
                    : 'bg-white border border-[rgba(0,82,204,0.1)]'
                }`}
              >
                {lowStock && (
                  <div className="flex items-center gap-2 mb-3 bg-[#FF5630] text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                    <Package className="w-4 h-4" />
                    Low Stock Alert! ({Math.round((product.stock / (product.maxStock || product.stock)) * 100)}% remaining)
                  </div>
                )}
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#F4F7FE] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 md:w-10 md:h-10 text-[#0052CC]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold mb-1 text-[#091E42]">{product.name}</div>
                  {product.category && (
                    <div className="text-xs text-white bg-[#0052CC] px-2 py-1 rounded-lg inline-block mb-2 font-semibold">
                      {product.category}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">
                      Stock: <span className={`font-bold ${lowStock ? 'text-[#FF5630]' : 'text-[#0052CC]'}`}>{product.stock}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Price: <span className="text-[#0052CC] font-bold">₱{product.price.toFixed(2)}</span>
                    </div>
                    {product.cost && (
                      <div className="text-sm text-gray-600">
                        Cost: <span className="font-bold">₱{product.cost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 p-2 md:p-3 bg-[#F4F7FE] text-[#0052CC] rounded-xl hover:bg-[#0052CC] hover:text-white transition-all flex items-center justify-center gap-2 font-semibold border border-[#0052CC]"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm hidden md:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 p-2 md:p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm hidden md:inline">Delete</span>
                </button>
              </div>
            </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
