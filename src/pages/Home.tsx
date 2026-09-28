import { Link } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../utils/api';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts().then(data => setFeatured(data.slice(0, 4))).catch(console.error);
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-brand-cream overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1600&q=80" 
            alt="Crochet background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-brand-dark">
            Handmade with Love
          </h1>
          <p className="text-xl md:text-2xl text-brand-dark/80 mb-8 max-w-2xl mx-auto font-sans font-light">
            Discover our collection of premium, sustainable crochet pieces crafted for your everyday joy.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 bg-brand-brown text-white px-8 py-4 rounded-sm text-lg font-medium hover:bg-opacity-90 transition-all hover:-translate-y-1"
          >
            Explore Collection
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Flowers', image: 'https://images.unsplash.com/photo-1596438459194-f215f91ebda3?w=500&q=80' },
              { name: 'Bags', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80' },
              { name: 'Plushies', image: 'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=500&q=80' },
              { name: 'Accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80' }
            ].map((cat, i) => (
              <Link 
                key={i} 
                to={`/shop?category=Crochet ${cat.name}`}
                className="group block relative overflow-hidden rounded-lg hover-lift aspect-square"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xl font-bold tracking-wider">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-brand-light">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-bold">Featured Creations</h2>
            <Link to="/shop" className="text-brand-brown hover:underline font-medium">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featured.map(product => (
              <Link key={product.id} to={`/product/${product.id}`} className="group hover-lift">
                <div className="aspect-[4/5] overflow-hidden rounded-lg mb-4 bg-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-lg font-semibold text-brand-dark group-hover:text-brand-brown transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-brand-dark/70 font-medium">₹{product.price}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-brand-dark">5.0</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
