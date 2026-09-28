import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(cors());
app.use(express.json());

// --- Mock Database ---
let users = [
  { id: '1', name: 'Admin User', email: 'admin@loopandlove.com', password: 'password123', role: 'admin', phone: '', addresses: [] },
  { id: '2', name: 'Test Customer', email: 'customer@test.com', password: 'password123', role: 'customer', phone: '1234567890', addresses: [{ id: 'a1', text: '123 Crochet St, Yarn City' }] }
];

let products = [
  { id: 'p1', name: 'Sunflower Bouquet', description: 'Handcrafted beautiful sunflower bouquet.', price: 1500, category: 'Crochet Flowers', images: ['https://images.unsplash.com/photo-1596438459194-f215f91ebda3?w=500&q=80'], colors: ['Yellow', 'Green'], stock: 10, createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Chunky Tote Bag', description: 'Stylish and durable chunky yarn tote bag.', price: 2500, category: 'Crochet Bags', images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80'], colors: ['Beige', 'Sage'], stock: 5, createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Amigurumi Bunny', description: 'Cute soft bunny plushie.', price: 1200, category: 'Crochet Plushies', images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=500&q=80'], colors: ['White', 'Pink'], stock: 15, createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Daisy Keychain', description: 'Small lovely daisy keychain.', price: 300, category: 'Crochet Keychains', images: ['https://images.unsplash.com/photo-1596438459194-f215f91ebda3?w=500&q=80'], colors: ['White', 'Yellow'], stock: 20, createdAt: new Date().toISOString() },
];

let orders: any[] = [];
let reviews: any[] = [
  { id: 'r1', productId: 'p1', userId: '2', userName: 'Test Customer', rating: 5, text: 'Absolutely beautiful craftsmanship!', date: new Date().toISOString(), verified: true }
];

// --- API Routes ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token: `mock-token-${user.id}` });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const newUser = { id: Date.now().toString(), name, email, password, role: 'customer', phone: '', addresses: [] };
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ user: userWithoutPassword, token: `mock-token-${newUser.id}` });
});

app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = products;
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }
  res.json(filtered);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ error: 'Product not found' });
});

app.get('/api/reviews/:productId', (req, res) => {
  const productReviews = reviews.filter(r => r.productId === req.params.productId);
  res.json(productReviews);
});

app.post('/api/reviews', (req, res) => {
  const review = { id: Date.now().toString(), date: new Date().toISOString(), verified: true, ...req.body };
  reviews.push(review);
  res.json(review);
});

app.post('/api/orders', (req, res) => {
  const order = { 
    id: 'ORD' + Date.now().toString().slice(-6), 
    status: 'Placed', 
    createdAt: new Date().toISOString(), 
    ...req.body 
  };
  orders.push(order);
  res.json(order);
});

app.get('/api/orders/user/:userId', (req, res) => {
  res.json(orders.filter(o => o.userId === req.params.userId));
});

// Admin routes
app.get('/api/admin/orders', (_req, res) => {
  res.json(orders);
});
app.put('/api/admin/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});
app.post('/api/admin/products', (req, res) => {
  const product = { id: 'p' + Date.now(), createdAt: new Date().toISOString(), ...req.body };
  products.push(product);
  res.json(product);
});

// --- Vite Integration ---
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
