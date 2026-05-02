import { useState, useEffect } from 'react';
import { UserCircle, Plus, X, Clock, Check, History, Trash2 } from 'lucide-react';

interface UtangTransaction {
  id: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  date: Date;
  paid: number;
  balance: number;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalUtang: number;
  transactions: UtangTransaction[];
}

interface UtangProps {
  onAddUtang?: (customer: Customer, transaction: UtangTransaction) => void;
}

export function Utang({ onAddUtang }: UtangProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sari-customers');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomers(parsed.map((c: Customer) => ({
        ...c,
        transactions: c.transactions.map(t => ({ ...t, date: new Date(t.date) }))
      })));
    } else {
      // Initialize with default customer
      const defaultCustomer: Customer = {
        id: '1',
        name: 'Celestino Suliva',
        phone: '09201080083',
        totalUtang: 0,
        transactions: []
      };
      setCustomers([defaultCustomer]);
      localStorage.setItem('sari-customers', JSON.stringify([defaultCustomer]));
    }
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('sari-customers', JSON.stringify(customers));
    }
  }, [customers]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: newCustomerName,
      phone: newCustomerPhone || undefined,
      totalUtang: 0,
      transactions: []
    };

    setCustomers([...customers, newCustomer]);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setShowAddCustomer(false);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedCustomer.totalUtang) return;

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomer.id) {
        const updatedTransactions = [...c.transactions];
        let remainingPayment = amount;

        for (let i = 0; i < updatedTransactions.length; i++) {
          if (updatedTransactions[i].balance > 0 && remainingPayment > 0) {
            const payment = Math.min(remainingPayment, updatedTransactions[i].balance);
            updatedTransactions[i] = {
              ...updatedTransactions[i],
              paid: updatedTransactions[i].paid + payment,
              balance: updatedTransactions[i].balance - payment
            };
            remainingPayment -= payment;
          }
        }

        return {
          ...c,
          totalUtang: c.totalUtang - amount,
          transactions: updatedTransactions
        };
      }
      return c;
    }));

    setPaymentAmount('');
    setShowPayment(false);
    setSelectedCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updatedCustomers = customers.filter(c => c.id !== customerId);
    setCustomers(updatedCustomers);
    localStorage.setItem('sari-customers', JSON.stringify(updatedCustomers));
  };

  const totalAllUtang = customers.reduce((sum, c) => sum + c.totalUtang, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#1E40AF]">Utang Management</h2>
            <p className="text-sm text-gray-500 mt-1">Track customer credit and payments</p>
          </div>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-2xl font-bold text-[#1E40AF]">{customers.length}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
            <div className="text-2xl font-bold text-orange-600">₱{totalAllUtang.toFixed(2)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Active Accounts</div>
            <div className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.totalUtang > 0).length}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {customers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <UserCircle className="w-16 h-16 mb-4" />
            <p className="text-center">No customers yet<br />Add your first "suki" to track utang</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(customer => (
              <div key={customer.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-[#3B82F6]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{customer.name}</div>
                      {customer.phone && (
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                  <div className="text-xs text-gray-600 mb-1">Outstanding Balance</div>
                  <div className="text-xl font-bold text-orange-600">₱{customer.totalUtang.toFixed(2)}</div>
                </div>

                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {customer.transactions.filter(t => t.balance > 0).map(transaction => (
                    <div key={transaction.id} className="bg-gray-50 p-2 rounded-lg text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {new Date(transaction.date).toLocaleDateString('en-PH')}
                        </span>
                        <span className="font-semibold text-orange-600">₱{transaction.balance.toFixed(2)}</span>
                      </div>
                      <div className="text-gray-500 text-[10px] mt-1">
                        {transaction.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {customer.totalUtang > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowPayment(true);
                      }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-semibold"
                    >
                      Record Payment
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className={`${customer.totalUtang > 0 ? 'w-auto px-3' : 'flex-1'} py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all text-sm font-semibold flex items-center justify-center gap-2`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {customer.totalUtang === 0 && <span>Remove</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-[#3B82F6] p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Add New Customer</h3>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#3B82F6] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-green-600 p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Record Payment</h3>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setSelectedCustomer(null);
                  setPaymentAmount('');
                }}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Customer</div>
                <div className="font-semibold text-gray-800">{selectedCustomer.name}</div>
                <div className="text-xs text-gray-500 mt-2">Total Outstanding</div>
                <div className="text-2xl font-bold text-orange-600">₱{selectedCustomer.totalUtang.toFixed(2)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  step="0.01"
                  max={selectedCustomer.totalUtang}
                  min="0.01"
                  required
                  autoFocus
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none"
                />
              </div>

              {paymentAmount && parseFloat(paymentAmount) > 0 && (
                <div className="bg-green-50 border-2 border-green-300 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Remaining Balance</span>
                    <span className="text-xl font-bold text-green-600">
                      ₱{(selectedCustomer.totalUtang - parseFloat(paymentAmount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedCustomer(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > selectedCustomer.totalUtang}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
