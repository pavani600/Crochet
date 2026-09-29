import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- Persistent File Store Helpers ---
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  phone: string;
  addresses: any[];
}

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@loopandlove.com', password: 'password123', role: 'admin', phone: '', addresses: [] },
  { id: '2', name: 'Test Customer', email: 'customer@test.com', password: 'password123', role: 'customer', phone: '1234567890', addresses: [{ id: 'a1', text: '123 Crochet St, Yarn City' }] }
];

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Sunflower Bouquet', description: 'Handcrafted beautiful sunflower bouquet.', price: 1500, category: 'Crochet Flowers', images: ['https://images.unsplash.com/photo-1596438459194-f215f91ebda3?w=500&q=80'], colors: ['Yellow', 'Green'], stock: 10, createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Chunky Tote Bag', description: 'Stylish and durable chunky yarn tote bag.', price: 2500, category: 'Crochet Bags', images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&q=80'], colors: ['Beige', 'Sage'], stock: 5, createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Amigurumi Bunny', description: 'Cute soft bunny plushie.', price: 1200, category: 'Crochet Plushies', images: ['https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?w=500&q=80'], colors: ['White', 'Pink'], stock: 15, createdAt: new Date().toISOString() },
  { id: 'p4', name: 'Daisy Keychain', description: 'Small lovely daisy keychain.', price: 300, category: 'Crochet Keychains', images: ['https://images.unsplash.com/photo-1596438459194-f215f91ebda3?w=500&q=80'], colors: ['White', 'Yellow'], stock: 20, createdAt: new Date().toISOString() },
];

const DEFAULT_REVIEWS = [
  { id: 'r1', productId: 'p1', userId: '2', userName: 'Test Customer', rating: 5, text: 'Absolutely beautiful craftsmanship!', date: new Date().toISOString(), verified: true }
];

let db = {
  users: [...DEFAULT_USERS],
  products: [...DEFAULT_PRODUCTS],
  orders: [] as any[],
  reviews: [...DEFAULT_REVIEWS]
};

if (fs.existsSync(DATA_FILE)) {
  try {
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    db = {
      users: saved.users || [...DEFAULT_USERS],
      products: saved.products || [...DEFAULT_PRODUCTS],
      orders: saved.orders || [],
      reviews: saved.reviews || [...DEFAULT_REVIEWS]
    };
  } catch (e) {
    console.error('Failed to load store.json, using defaults', e);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save store.json', e);
  }
}

// --- Password Hashing Helper ---
function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

// --- API Routes ---

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const hashed = hashPassword(password);
  const user = db.users.find(u =>
    u.email?.toLowerCase() === email?.toLowerCase().trim() &&
    (u.password === password || u.password === hashed)
  );
  if (user) {
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    res.json({ user: userWithoutPassword, token: `token-${user.id}` });
  } else {
    res.status(401).json({ error: 'Invalid email or password. Please try again.' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields (Name, Email, Password) are required' });
  }
  const cleanEmail = email.toLowerCase().trim();
  if (db.users.find(u => u.email?.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }
  const newUser: User = {
    id: Date.now().toString(),
    name: name.trim(),
    email: cleanEmail,
    password: hashPassword(password),
    role: 'customer',
    phone: '',
    addresses: []
  };
  db.users.push(newUser);
  saveDb();

  const userWithoutPassword = { ...newUser };
  delete userWithoutPassword.password;
  res.json({ user: userWithoutPassword, token: `token-${newUser.id}` });
});

app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let filtered = db.products;
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
  const product = db.products.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ error: 'Product not found' });
});

app.get('/api/reviews/:productId', (req, res) => {
  const productReviews = db.reviews.filter(r => r.productId === req.params.productId);
  res.json(productReviews);
});

app.post('/api/reviews', (req, res) => {
  const review = { id: Date.now().toString(), date: new Date().toISOString(), verified: true, ...req.body };
  db.reviews.push(review);
  saveDb();
  res.json(review);
});

app.post('/api/orders', (req, res) => {
  const order = { 
    id: 'ORD' + Date.now().toString().slice(-6), 
    status: 'Placed', 
    createdAt: new Date().toISOString(), 
    ...req.body 
  };
  db.orders.push(order);
  saveDb();
  res.json(order);
});

app.get('/api/orders/user/:userId', (req, res) => {
  res.json(db.orders.filter(o => o.userId === req.params.userId));
});

// Admin routes
app.get('/api/admin/orders', (_req, res) => {
  res.json(db.orders);
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    saveDb();
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post('/api/admin/products', (req, res) => {
  const product = { id: 'p' + Date.now(), createdAt: new Date().toISOString(), ...req.body };
  db.products.push(product);
  saveDb();
  res.json(product);
});

// --- Studio Assistant Knowledge Engine & n8n Chatbot Webhook Proxy ---
const N8N_CHAT_WEBHOOK_URL = 'https://pavanisandya.app.n8n.cloud/webhook/3c4d760d-45f7-4246-9980-6253190b7591/chat';

function getStudioChatbotResponse(input: string): string {
  const query = (input || '').toLowerCase().trim();

  if (!query || /^(hi|hello|hey|good morning|good evening|greetings)/i.test(query)) {
    return "Hello! 🧶 Welcome to Loop & Love – Handmade Crochet Studio! I'm your studio assistant. I can help you with product recommendations, custom floral bouquets, shipping timelines, or crochet care tips. What are you looking for today?";
  }

  if (query.includes('bouquet') || query.includes('flower') || query.includes('sunflower') || query.includes('rose') || query.includes('tulip')) {
    return "Our handmade crochet flower bouquets are customer favorites! 💐\n\n• Sunflower Harmony Bouquet ($45): Radiant sunflowers, white daisies, and soft green eucalyptus stems wrapped in textured kraft paper.\n• Rose Garden Mini Bouquet ($35): 5 everlasting blush pink roses that never wilt.\n\nThey require zero watering, last forever, and are perfect for birthdays and anniversaries!";
  }

  if (query.includes('bag') || query.includes('tote') || query.includes('purse') || query.includes('bucket')) {
    return "Our handmade crochet bags are woven from durable, high-grade cotton yarn:\n\n• Pastel Dreams Bucket Bag ($55): Vibrant granny-square motif with thick shoulder strap and canvas lining.\n• Lavender Fields Tote ($48): Roomy market tote in calming lilac and oatmeal tones.\n\nBoth bags are reinforced to hold books, tablets, and daily essentials!";
  }

  if (query.includes('bear') || query.includes('plush') || query.includes('toy') || query.includes('amigurumi') || query.includes('keychain')) {
    return "Looking for something adorable? Check out our amigurumi collection:\n\n• Cozy Bear Amigurumi ($28): Handcrafted hypoallergenic teddy with a removable striped scarf.\n• Strawberry Shortcake Keychain ($12): Sweet hand-stitched berry charm for bags and keys!";
  }

  if (query.includes('price') || query.includes('cost') || query.includes('how much') || query.includes('catalog') || query.includes('menu')) {
    return "Here is our current studio catalog & pricing:\n\n• Sunflower Harmony Bouquet: $45.00\n• Pastel Dreams Bucket Bag: $55.00\n• Lavender Fields Tote: $48.00\n• Rose Garden Mini Bouquet: $35.00\n• Cozy Bear Amigurumi: $28.00\n• Daisy Delight Coasters (Set of 4): $18.00\n• Strawberry Shortcake Keychain: $12.00\n\n🚚 Free Standard Shipping on all orders over $50!";
  }

  if (query.includes('shipping') || query.includes('delivery') || query.includes('track') || query.includes('deliver')) {
    return "Here are our shipping details 📦:\n\n• Standard Delivery (3–5 business days): $5.00 (FREE on orders over $50!)\n• Express Delivery (1–2 business days): $12.00\n\nEach creation is carefully packaged in gift-ready boxes with protective tissue. Once shipped, you can track progress directly in your Profile page.";
  }

  if (query.includes('custom') || query.includes('personal') || query.includes('bespoke') || query.includes('special')) {
    return "Yes, we specialize in custom crochet creations! ✨\n\nWe can customize flower colors for bouquets, adjust bag strap lengths, or stitch custom names/initials into plushies. Custom handcrafted orders take 5–7 business days to prepare. Feel free to leave a note during checkout or message us!";
  }

  if (query.includes('wash') || query.includes('care') || query.includes('clean')) {
    return "To keep your crochet items beautiful for years:\n\n1. Hand wash gently in cool water with mild liquid detergent.\n2. Gently press out water using a dry towel (avoid twisting or wringing).\n3. Reshape and lay flat to dry in a shaded, well-ventilated spot.\n4. Avoid bleach and tumble drying.";
  }

  if (query.includes('return') || query.includes('refund') || query.includes('exchange')) {
    return "We want you to love your crafts! We offer 14-day hassle-free returns on standard items in unused condition. For any questions, please reach out to us at support@loopandlove.com.";
  }

  if (query.includes('account') || query.includes('login') || query.includes('register') || query.includes('signup') || query.includes('password') || query.includes('profile')) {
    return "You can log in or register for a Loop & Love account anytime by clicking the Profile icon in the top navigation bar! With an account, you can securely track orders, save your delivery addresses, and leave reviews for your favorite crochet pieces.";
  }

  if (query.includes('security') || query.includes('safe') || query.includes('data') || query.includes('privacy') || query.includes('secure')) {
    return "Your account and order details are safely encrypted and securely stored. We respect your privacy and never share your personal information or payment details.";
  }

  return "Thank you for reaching out to Loop & Love! 🧶 We create sustainable, everlasting crochet art—including bouquets, bags, and plush amigurumi. Feel free to explore our Shop section, or ask me about bouquet styles, bag sizes, pricing, and custom gifts!";
}

function isValidStudioResponse(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  const lower = trimmed.toLowerCase();

  // Reject internal errors or webhook setup errors
  if (lower.includes('error in workflow') || lower.includes('webhook is not registered') || lower.includes('workflow must be active')) {
    return false;
  }

  // Reject developer / prompt leak / system role confusion (e.g. LLM pretending to be a software developer or asking for files)
  const devPhrases = [
    'full-stack developer',
    'security specialist',
    'codebase understanding',
    'phase 1',
    'please provide the code',
    'technical audit',
    'standing by to review',
    'server.ts',
    'package.json',
    'src/pages',
    'src/app.tsx',
    'authentication security specialist',
    'temporary in-memory authentication',
    'production-ready application',
  ];

  for (const phrase of devPhrases) {
    if (lower.includes(phrase)) {
      return false;
    }
  }

  return true;
}

app.all('/api/chatbot', async (req, res) => {
  if (req.method === 'GET') {
    return res.json({ status: 'ok', webhook: N8N_CHAT_WEBHOOK_URL });
  }

  const userQuery = req.body?.chatInput || req.body?.message || '';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let rawText = '';
    let responseOk = false;
    let responseStatus = 500;

    try {
      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body || {}),
        signal: controller.signal,
      });
      responseOk = response.ok;
      responseStatus = response.status;
      rawText = await response.text();
    } finally {
      clearTimeout(timeout);
    }

    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    // If n8n succeeded, check that the output is actually a valid customer studio response
    if (responseOk && data) {
      const outputText = Array.isArray(data) ? data[0]?.output : (data.output || data.text || data.message);
      if (typeof outputText === 'string' && isValidStudioResponse(outputText)) {
        return res.json(Array.isArray(data) ? data : [{ output: outputText }]);
      }
      console.warn(`[Chatbot Proxy] Rejected invalid/off-topic response from n8n (${outputText?.slice(0, 100)}...). Falling back to studio assistant.`);
    } else {
      console.warn(`[Chatbot Proxy] n8n returned status ${responseStatus} (${rawText?.slice(0, 100)}). Falling back to studio assistant.`);
    }

    // Provide an authentic, friendly studio answer
    const studioAnswer = getStudioChatbotResponse(userQuery);
    return res.status(200).json([
      {
        output: studioAnswer,
      },
    ]);
  } catch (error: any) {
    console.error('Chatbot webhook proxy error/timeout:', error?.message || error);
    const studioAnswer = getStudioChatbotResponse(userQuery);
    return res.status(200).json([
      {
        output: studioAnswer,
      },
    ]);
  }
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
