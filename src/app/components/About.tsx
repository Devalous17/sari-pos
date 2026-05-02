import { Store, QrCode, Smartphone, CreditCard } from 'lucide-react';

export function About() {
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 p-4 md:p-6 shadow-sm">
        <h2 className="text-[#1E40AF]">About</h2>
        <p className="text-sm text-gray-500 mt-1">Store information and digital payment details</p>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Store Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="w-7 h-7 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Sari-Sari Store POS</h3>
              <p className="text-sm text-gray-500">Point of Sale System</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="font-medium text-gray-700 mb-2">Features</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Product inventory management</li>
                <li>✓ Sales tracking and analytics</li>
                <li>✓ QR code scanning for products</li>
                <li>✓ Cash and digital payment support</li>
                <li>✓ Credit (Utang) management for regular customers</li>
                <li>✓ Offline-first with localStorage</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="font-medium text-gray-700 mb-2">Version Information</div>
              <div className="text-gray-600">
                <div>Version: 2.0</div>
                <div>Build Date: May 2026</div>
                <div>Data Version: 8</div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Payment Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Digital Payment Options</h3>
              <p className="text-sm text-gray-500">Accept cashless payments via GCash</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GCash QR Code */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">GCash Payment</h4>
              </div>

              <div className="bg-white p-4 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Your GCash QR Code</p>
                    <p className="text-xs text-gray-400 mt-1">(Upload your QR code here)</p>
                  </div>
                </div>
              </div>

              <div className="text-sm space-y-2">
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Account Name</div>
                  <div className="font-medium text-gray-800">Nathaniel Victoria</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">GCash Number</div>
                  <div className="font-medium text-gray-800">0920 108 0083</div>
                </div>
              </div>

              <div className="mt-4 bg-blue-900/10 p-3 rounded-lg">
                <p className="text-xs text-blue-900">
                  💡 <strong>Tip:</strong> Customers can scan this QR code to pay via GCash. Make sure to select "GCash" as payment method during checkout.
                </p>
              </div>
            </div>

            {/* How to Use */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3">How to Accept GCash Payment</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">1.</span>
                    <span>Ring up items in the Cashier as usual</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">2.</span>
                    <span>Click "Check Out" to view current order</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">3.</span>
                    <span>Click "Complete Sale" button</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">4.</span>
                    <span>Select "GCash" as payment method</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">5.</span>
                    <span>Show QR code to customer</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">6.</span>
                    <span>Wait for payment confirmation</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#3B82F6] min-w-[20px]">7.</span>
                    <span>Complete the transaction</span>
                  </li>
                </ol>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Benefits</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>✓ No need to handle physical cash</li>
                  <li>✓ Instant payment confirmation</li>
                  <li>✓ Accurate tracking in Analytics</li>
                  <li>✓ Safer transactions</li>
                  <li>✓ Convenient for customers</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">⚠️ Important Reminders</h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>• Always verify payment before completing sale</li>
                  <li>• Check GCash app for confirmation</li>
                  <li>• Keep your QR code secure</li>
                  <li>• Update phone number if changed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>For questions or support:</p>
            <ul className="space-y-1 ml-4">
              <li>📧 Email: nathanrave16@gmail.com</li>
              <li>📱 SMS: 0920 108 0083</li>
              <li>🕐 Business Hours: Mon-Sat, 8AM-6PM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
