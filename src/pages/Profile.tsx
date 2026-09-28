import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export default function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      fetch(`/api/orders/user/${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user);
        if (data.user.role === 'admin') {
          navigate('/admin');
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Authentication failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light py-12 px-4 animate-fade-in">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-500">Access your orders, wishlist, and more.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 border rounded-md focus:border-brand-brown outline-none" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded-md focus:border-brand-brown outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded-md focus:border-brand-brown outline-none" />
            </div>
            <button type="submit" className="w-full bg-brand-dark text-white py-3 rounded-md font-medium hover:bg-brand-brown transition-colors">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="text-brand-brown hover:underline">
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
          {isLogin && (
            <div className="mt-8 p-4 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
              <p><strong>Demo Admin:</strong> admin@loopandlove.com / password123</p>
              <p><strong>Demo Customer:</strong> customer@test.com / password123</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-dark">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-center mb-1">{user.name}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">{user.email}</p>
            
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-brand-cream/30 text-brand-brown rounded-md font-medium">
                <Package className="w-5 h-5" /> My Orders
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md">
                <UserIcon className="w-5 h-5" /> Profile Settings
              </button>
              {user.role === 'admin' && (
                <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-md">
                  <ShieldCheck className="w-5 h-5" /> Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md mt-4">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 font-serif border-b pb-4">Order History</h2>
            
            {loadingOrders ? (
              <div className="py-12 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                You haven't placed any orders yet. <Link to="/shop" className="text-brand-brown underline">Start shopping</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex flex-wrap justify-between items-center mb-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Order ID</span>
                        <p className="font-bold">{order.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Date</span>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                        <p className="font-bold text-brand-dark">₹{order.total}</p>
                      </div>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-500 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-4">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            <span className="text-sm font-medium">{item.quantity}x {item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
