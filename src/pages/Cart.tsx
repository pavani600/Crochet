import { Link, useNavigate } from 'react-router';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const deliveryCharge = cartTotal > 2000 ? 0 : 150;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-cream rounded-full mb-6">
          <ShoppingBag className="w-10 h-10 text-brand-brown" />
        </div>
        <h1 className="text-3xl font-bold mb-4 font-serif">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any beautiful handmade items to your cart yet.</p>
        <Link to="/shop" className="inline-block bg-brand-brown text-white px-8 py-3 rounded-sm hover:bg-opacity-90 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 font-serif">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-6 items-center">
                  <div className="col-span-1 sm:col-span-6 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">Color: {item.color}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm flex items-center gap-1 mt-2 hover:underline"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center border rounded-md bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-50">-</button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-50">+</button>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-right text-gray-600 hidden sm:block">
                    ₹{item.price}
                  </div>
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-bold text-lg">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-brand-cream/30 p-8 rounded-xl border border-brand-cream">
            <h2 className="text-xl font-bold mb-6 font-serif">Order Summary</h2>
            <div className="space-y-4 mb-6 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">₹{cartTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-medium">{deliveryCharge === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryCharge}`}</span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-brand-brown">Add items worth ₹{2000 - cartTotal} more for free delivery!</p>
              )}
            </div>
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg">Total Amount</span>
                <span className="text-2xl font-bold text-brand-dark">₹{cartTotal + deliveryCharge}</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-dark text-white py-4 rounded-sm font-medium hover:bg-brand-brown transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
