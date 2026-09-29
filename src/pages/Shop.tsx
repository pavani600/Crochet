import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Filter, Star } from 'lucide-react';
import { fetchProducts } from '../utils/api';

const CATEGORIES = [
  'All',
  'Crochet Flowers',
  'Crochet Bouquets',
  'Crochet Keychains',
  'Crochet Bags',
  'Crochet Plushies',
  'Crochet Dolls',
  'Crochet Accessories',
  'Customized Gifts'
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  const currentCategory = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    setLoading(true);
    let query = '';
    if (currentCategory !== 'All') query += `category=${encodeURIComponent(currentCategory)}&`;
    if (searchTerm) query += `search=${encodeURIComponent(searchTerm)}`;
    
    fetchProducts(query)
      .then(data => {
        const sorted = [...data];
        if (sort === 'price-low') sorted.sort((a, b) => a.price - b.price);
        if (sort === 'price-high') sorted.sort((a, b) => b.price - a.price);
        // newest is default, assume id represents order or use createdAt
        setProducts(sorted);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, searchTerm, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      searchParams.set('search', searchTerm);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header & Search */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl font-bold text-center mb-8">Our Collection</h1>
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown bg-white shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-brown text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2 border-b pb-2">
              <Filter className="w-4 h-4" /> Categories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      if (cat === 'All') searchParams.delete('category');
                      else searchParams.set('category', cat);
                      setSearchParams(searchParams);
                    }}
                    className={`text-sm hover:text-brand-brown transition-colors ${currentCategory === cat ? 'font-bold text-brand-brown' : 'text-gray-600'}`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 border-b pb-2">Sort By</h3>
            <select 
              value={sort}
              onChange={(e) => {
                searchParams.set('sort', e.target.value);
                setSearchParams(searchParams);
              }}
              className="w-full p-2 border rounded text-sm focus:outline-none focus:border-brand-brown"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg">
              <p className="text-xl text-gray-500 mb-4">No products found matching your criteria.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="text-brand-brown hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="group hover-lift bg-white p-3 rounded-xl shadow-sm border border-gray-50">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100 relative">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-brand-dark group-hover:text-brand-brown transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 truncate">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">₹{product.price}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-brand-dark">4.8</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
