import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router';
import { PackageSearch, Users, ShoppingCart, DollarSign, PlusCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, customers: 0, products: 0 });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/admin/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          const revenue = data.reduce((acc:number, o:any) => acc + o.total, 0);
          setStats({ totalOrders: data.length, revenue, customers: 2, products: 4 }); // Mocked counts
        });
    }
  }, [user]);

  const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(orders.map(o => o.id === id ? updated : o));
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/profile" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-serif">Admin Dashboard</h1>
        <button className="bg-brand-dark text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-brand-brown transition-colors text-sm">
          <PlusCircle className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><ShoppingCart className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Total Orders</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold">₹{stats.revenue}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center"><Users className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Customers</p><p className="text-2xl font-bold">{stats.customers}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center"><PackageSearch className="w-6 h-6" /></div>
          <div><p className="text-sm text-gray-500">Products</p><p className="text-2xl font-bold">{stats.products}</p></div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer Address</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{order.id}</td>
                    <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm max-w-xs truncate">{order.address}</td>
                    <td className="p-4 font-bold">₹{order.total}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-sm border rounded p-1 focus:outline-none focus:border-brand-brown"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
