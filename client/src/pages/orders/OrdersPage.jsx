import React, { useState, useEffect } from 'react';
import { orderService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ShoppingCart,
  Search,
  DollarSign,
  Download,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Sparkles,
  TrendingUp,
  Tag,
  Eye
} from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAll({ search });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Orders & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time customer transactions, Stripe test payments, order bumps, and upsells
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="indigo" size="sm">
            Stripe Test Mode Active
          </Badge>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No orders found</p>
            <p className="text-xs mt-1">Orders processed through checkout funnel steps will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Item & Add-ons</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    onClick={() => setSelectedOrder(o)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {o.orderNumber || 'ORD-000000'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {o.customerName || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {o.customerEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {o.items?.[0]?.name || 'Standard Product'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {o.orderBumpPurchased && (
                          <Badge variant="amber" size="xs">
                            + Bump (${o.orderBumpPrice || 27})
                          </Badge>
                        )}
                        {o.upsellsPurchased && o.upsellsPurchased.length > 0 && (
                          <Badge variant="emerald" size="xs">
                            + Upsell (${o.upsellsPurchased[0]?.price})
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        ${(o.total || 0).toFixed(2)}
                      </span>
                      {o.discount > 0 && (
                        <span className="text-[10px] text-emerald-600 block">
                          -${o.discount} with coupon
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="emerald" size="xs">
                        COMPLETED
                      </Badge>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        {o.paymentProvider?.toUpperCase() || 'STRIPE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Recent'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt: #${selectedOrder.orderNumber}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Customer & Billing Information</h4>
              <p><strong className="text-slate-500">Name:</strong> {selectedOrder.customerName}</p>
              <p><strong className="text-slate-500">Email:</strong> {selectedOrder.customerEmail}</p>
              <p><strong className="text-slate-500">Stripe Payment Intent ID:</strong> <span className="font-mono text-indigo-600">{selectedOrder.paymentId || 'pi_test_simulated'}</span></p>
              <p><strong className="text-slate-500">Transaction Status:</strong> <span className="text-emerald-600 font-bold">Paid & Verified</span></p>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Purchased Items</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-y border-slate-100 dark:border-slate-800 py-2">
                {(selectedOrder.items || []).map((it, i) => (
                  <div key={i} className="py-1.5 flex items-center justify-between">
                    <span>{it.name} (x{it.quantity || 1})</span>
                    <span className="font-bold">${it.price?.toFixed(2)}</span>
                  </div>
                ))}
                {selectedOrder.orderBumpPurchased && (
                  <div className="py-1.5 flex items-center justify-between text-amber-600">
                    <span>⚡ Order Bump Special Offer</span>
                    <span className="font-bold">+${(selectedOrder.orderBumpPrice || 27).toFixed(2)}</span>
                  </div>
                )}
                {(selectedOrder.upsellsPurchased || []).map((up, i) => (
                  <div key={i} className="py-1.5 flex items-center justify-between text-emerald-600">
                    <span>🚀 1-Click Upsell: {up.name}</span>
                    <span className="font-bold">+${up.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                <span>Total Amount Charged:</span>
                <span className="text-emerald-600">${(selectedOrder.total || 0).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                Close Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;

