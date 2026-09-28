import { Link, Outlet } from 'react-router';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout() {
  const { user } = useAuth();
  const { cart } = useCart();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:hidden">
            <Menu className="w-6 h-6 text-brand-dark" />
          </div>
          
          <Link to="/" className="text-2xl font-serif font-bold text-brand-dark flex-shrink-0">
            Loop & Love
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="nav-link text-brand-dark uppercase text-sm tracking-wider">Home</Link>
            <Link to="/shop" className="nav-link text-brand-dark uppercase text-sm tracking-wider">Shop</Link>
            <Link to="/shop?category=Best Sellers" className="nav-link text-brand-dark uppercase text-sm tracking-wider">Best Sellers</Link>
          </nav>

          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/shop" className="text-brand-dark hover:text-brand-brown transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link to={user ? "/profile" : "/profile"} className="text-brand-dark hover:text-brand-brown transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="text-brand-dark hover:text-brand-brown transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-brown text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-brand-dark text-brand-cream py-12 mt-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Loop & Love</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Handmade crochet studio bringing warmth and love to your everyday life through beautiful, sustainable crafts.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Crochet Flowers">Flowers</Link></li>
              <li><Link to="/shop?category=Crochet Bags">Bags</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="#">Contact Us</Link></li>
              <li><Link to="#">Shipping Policy</Link></li>
              <li><Link to="#">Returns & Exchanges</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Newsletter</h4>
            <p className="text-sm opacity-80 mb-4">Subscribe for updates and exclusive offers.</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="px-3 py-2 text-brand-dark w-full rounded-l-sm focus:outline-none" />
              <button className="bg-brand-brown px-4 py-2 rounded-r-sm hover:bg-opacity-90 transition-colors">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-brand-cream/20 text-center text-sm opacity-60">
          &copy; {new Date().getFullYear()} Loop & Love. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
