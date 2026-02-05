require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');

const connectDB = require('./config/database');

const app = express();


// ================= DATABASE CONNECT =================
const startServer = async () => {
  try {

    await connectDB();


    // ================= MIDDLEWARE =================
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      }
    }));

    app.use(methodOverride('_method'));
    app.use(express.static(path.join(__dirname, 'public')));


    // ================= VIEW ENGINE =================
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));


    // ================= GLOBAL TEMPLATE VARIABLES =================
    app.use((req, res, next) => {
      res.locals.user = req.session.user || null;
      res.locals.cart = req.session.cart || { items: [], total: 0 };
      res.locals.success = req.session.success;
      res.locals.error = req.session.error;

      delete req.session.success;
      delete req.session.error;

      next();
    });


    // ================= API ROUTES =================
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/cart', require('./routes/cart'));
    app.use('/api/orders', require('./routes/order'));
    app.use('/api/admin', require('./routes/admin'));


    // ================= HOME PAGE =================
    app.get('/', async (req, res) => {

      try {
        const Product = require('./models/Product');

        const products = await Product.find({ stock: { $gt: 0 } })
          .sort({ createdAt: -1 })
          .limit(8);

        res.render('index', { products });

      } catch {
        res.render('index', { products: [] });
      }

    });


    // ================= PRODUCTS PAGE =================
    app.get('/products', async (req, res) => {

      try {

        const Product = require('./models/Product');
        const { search, category, sort } = req.query;

        let query = { stock: { $gt: 0 } };

        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }

        if (category) {
          query.category = category;
        }

        let sortOption = { createdAt: -1 };

        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'name') sortOption = { name: 1 };

        const products = await Product.find(query).sort(sortOption);
        const categories = await Product.distinct('category');

        res.render('products/list', {
          products,
          categories,
          search,
          category,
          sort
        });

      } catch {
        req.session.error = "Error loading products";
        res.redirect('/');
      }

    });


    // ================= PRODUCT DETAIL =================
    app.get('/products/:id', async (req, res) => {

      try {

        const Product = require('./models/Product');
        const product = await Product.findById(req.params.id);

        if (!product) return res.redirect('/products');

        res.render('products/detail', { product });

      } catch {
        res.redirect('/products');
      }

    });


    // ================= AUTH ROUTES =================
    app.get('/login', (req, res) => {
      if (req.session.user) return res.redirect('/');
      res.render('auth/login');
    });

    app.get('/register', (req, res) => {
      if (req.session.user) return res.redirect('/');
      res.render('auth/register');
    });

    app.get('/logout', (req, res) => {
      req.session.destroy(() => res.redirect('/'));
    });


    // ================= ADMIN DASHBOARD =================
    app.get('/admin/dashboard', async (req, res) => {

      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
      }

      const Product = require('./models/Product');
      const Order = require('./models/Order');
      const User = require('./models/User');

      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalUsers = await User.countDocuments();

      const totalRevenue = await Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email');

      res.render('admin/dashboard', {
        stats: {
          products: totalProducts,
          orders: totalOrders,
          users: totalUsers,
          revenue: totalRevenue[0]?.total || 0
        },
        recentOrders
      });

    });


    // ================= ADMIN PRODUCTS =================
    app.get('/admin/products', async (req, res) => {

      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
      }

      const Product = require('./models/Product');
      const products = await Product.find().sort({ createdAt: -1 });

      res.render('admin/products', { products });

    });


    // ================= ADD PRODUCT PAGE =================
    app.get('/admin/products/new', (req, res) => {

      if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/');
      }

      res.render('admin/addProduct');

    });


    // ================= ERROR HANDLING =================
    app.use((req, res) => {
      res.status(404).render('404');
    });

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).render('500');
    });


    // ================= START SERVER =================
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Visit: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.log("❌ Server Start Failed:", error.message);
  }
};

startServer();
