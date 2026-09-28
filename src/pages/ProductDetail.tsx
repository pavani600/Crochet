import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Heart, ShoppingBag, Star, Check, AlertCircle } from 'lucide-react';
import { fetchProduct, fetchReviews } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([fetchProduct(id), fetchReviews(id)])
        .then(([prodData, revData]) => {
          setProduct(prodData);
          setReviews(revData);
          if (prodData.colors?.length > 0) setSelectedColor(prodData.colors[0]);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0],
        color: selectedColor
      });
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 3000);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to submit a review");
    
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, userId: user.id, userName: user.name, text: reviewText, rating })
    });
    const newRev = await res.json();
    setReviews([newRev, ...reviews]);
    setReviewText('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 text-sm text-brand-brown font-medium uppercase tracking-wider">{product.category}</div>
          <h1 className="text-4xl font-bold mb-4 font-serif">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">₹{product.price}</span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-sm font-medium text-yellow-700">
              <Star className="w-4 h-4 fill-current" />
              {reviews.length > 0 ? (reviews.reduce((a,c)=>a+c.rating,0)/reviews.length).toFixed(1) : 'New'} 
              <span className="text-gray-500 font-normal">({reviews.length} reviews)</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Color: <span className="text-gray-500">{selectedColor}</span></h3>
              <div className="flex gap-3">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 border rounded-md transition-colors ${selectedColor === c ? 'border-brand-brown bg-brand-cream/30 font-medium' : 'hover:border-gray-400'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Stock */}
          <div className="mb-8 flex items-center gap-6">
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center border rounded-md w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-500 hover:text-brand-dark">-</button>
                <input type="number" value={quantity} readOnly className="w-full text-center focus:outline-none" />
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 text-gray-500 hover:text-brand-dark">+</button>
              </div>
            </div>
            <div className="mt-8">
              {product.stock > 0 ? (
                <span className="text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> In Stock ({product.stock})</span>
              ) : (
                <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Out of Stock</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-sm font-medium transition-all ${
                product.stock === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-brand-brown text-white hover:bg-opacity-90 hover:shadow-lg'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </button>
            <button className="p-4 border border-gray-200 rounded-sm hover:border-brand-brown hover:text-brand-brown transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>
          {addedMessage && <p className="text-green-600 mt-4 font-medium animate-fade-in">Added to cart successfully!</p>}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-16">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        
        {user && (
          <form onSubmit={submitReview} className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
            <h3 className="font-bold mb-4">Write a Review</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <button type="button" key={star} onClick={() => setRating(star)}>
                  <Star className={`w-6 h-6 ${rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full p-3 border rounded-md mb-4 focus:outline-none focus:border-brand-brown"
            />
            <button type="submit" className="bg-brand-dark text-white px-6 py-2 rounded text-sm hover:bg-opacity-90">
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-6 max-w-3xl">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center font-bold text-brand-dark">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {review.userName}
                      {review.verified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span>}
                    </div>
                    <div className="flex text-yellow-500 text-sm mt-1">
                      {[1,2,3,4,5].map(star => <Star key={star} className={`w-3 h-3 ${review.rating >= star ? 'fill-current' : 'text-gray-300'}`} />)}
                    </div>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-gray-700 mt-3">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
