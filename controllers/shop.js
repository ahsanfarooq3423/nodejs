const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

//DONE
exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title -_id')
    // .populate('userId')
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err))
};

//DONE
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(product)
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      })
    })
    .catch(err => console.log(err))
}

//DONE
exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err))
};

//DONE
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated : req.isLoggedIn
      })
    })
};

//DONE
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
}

//DONE
exports.postCartDeleteProduct = (req, res, next) => {
  req.user.removeFromCart(req.body.productId)
    .then(response => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))

}

//DONE
exports.postOrder = (req, res, next) => {
  User.findById(req.user._id)
    .select('name cart')
    .populate('cart.items.productId')
    .then(response => {
      // console.log(response.cart.items)
      const updatedProducts = response.cart.items.map(item => {
        return {
          product: { ...item.productId._doc },
          quantity: item.quantity
        }
      })
      // console.log(updatedProducts)
      const orderInstance = {
        products: updatedProducts,
        user: {
          name: response.name,
          userId: response._id
        }
      }
      const order = new Order(orderInstance)
      return order.save()
    })
    .then(response => {
      req.user.cart.items = []
      return req.user.save()
    })
    .then(response => {
      res.redirect('/orders')
    })
    .catch(err => console.log(err))
}

//DONE
exports.getOrders = (req, res, next) => {

  Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        orders: orders,
        path: '/orders',
        pageTitle: 'Orders',
        isAuthenticated: req.session.isLoggedIn
      })
    })
    .catch(err => console.log(err))
};









