import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const deliveryCharge = cartTotal > 2000 ? 0 : 150;
  const totalAmount = cartTotal + deliveryCharge;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) return alert('Please fill in all details');
    if (cart.length === 0) return alert('Cart is empty');

    const orderData = {
      userId: user?.id || 'guest',
      items: cart,
      subtotal: cartTotal,
      deliveryCharge,
      total: totalAmount,
      address,
      phone,
      paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const newOrder = await res.json();
      setOrderId(newOrder.id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    }
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4 font-serif text-brand-dark">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-2">Thank you for shopping with Loop & Love.</p>
        <p className="text-gray-500 mb-8">Your Order ID is: <span className="font-bold text-brand-dark">{orderId}</span></p>
        <div className="space-x-4">
          <button onClick={() => navigate('/shop')} className="bg-brand-brown text-white px-8 py-3 rounded-sm hover:bg-opacity-90">
            Continue Shopping
          </button>
          {user && (
            <button onClick={() => navigate('/profile')} className="border border-brand-brown text-brand-brown px-8 py-3 rounded-sm hover:bg-brand-brown hover:text-white transition-colors">
              Track Order
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 font-serif">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Delivery Details</h2>
              {!user && <p className="text-sm text-gray-500 mb-4">You are checking out as a guest. <button onClick={()=>navigate('/profile')} className="text-brand-brown underline">Login</button> to save your order.</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-3 border rounded-md focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none" placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Delivery Address</label>
                  <textarea required rows={4} value={address} onChange={e=>setAddress(e.target.value)} className="w-full p-3 border rounded-md focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-none" placeholder="House No, Street, Landmark, City, State, PIN Code" />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 border-b pb-2">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod==='cod'} onChange={e=>setPaymentMethod(e.target.value)} className="text-brand-brown focus:ring-brand-brown" />
                  <span className="font-medium">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-md cursor-not-allowed opacity-60">
                  <input type="radio" name="payment" value="online" disabled className="text-brand-brown" />
                  <div>
                    <span className="font-medium block">Online Payment</span>
                    <span className="text-xs text-gray-500">Currently unavailable for maintenance</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-dark text-white py-4 rounded-sm font-bold text-lg hover:bg-brand-brown transition-colors">
              Place Order (₹{totalAmount})
            </button>
          </form>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold mb-4 font-serif">Order Items</h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} | {item.color}</p>
                    <p className="text-sm font-bold mt-1">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{deliveryCharge===0?'Free':`₹${deliveryCharge}`}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
