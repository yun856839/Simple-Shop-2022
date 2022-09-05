const passport = require('passport')
const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const productController = require('../controllers/productController.js')
const cartController = require('../controllers/cartController.js')
const orderController = require('../controllers/orderController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')

const authenticatedAdmin = (req, res, next) => {
	if (req.user.role === 'admin') {
		return next()
	}
	return res.redirect('/')
}

router.get('/signin', userController.signInPage)
router.post(
	'/signin',
	passport.authenticate('local', {
		failureRedirect: '/signin',
		failureFlash: true,
	}),
	userController.signIn
)
router.get('/logout', userController.logout)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/admin', authenticatedAdmin, (req, res) =>
	res.redirect('/admin/products')
)
router.get('/admin/products', authenticatedAdmin, adminController.getProducts)
router.get(
	'/admin/products/create',
	authenticatedAdmin,
	adminController.createProduct
)
router.post(
	'/admin/products',
	authenticatedAdmin,
	upload.single('image'),
	adminController.postProduct
)
router.get(
	'/admin/products/:id',
	authenticatedAdmin,
	adminController.getProduct
)
router.get(
	'/admin/products/:id/edit',
	authenticatedAdmin,
	adminController.editProduct
)
router.put(
	'/admin/products/:id',
	authenticatedAdmin,
	upload.single('image'),
	adminController.putProduct
)
router.delete(
	'/admin/products/:id',
	authenticatedAdmin,
	adminController.deleteProduct
)

router.get('/', (req, res) => res.redirect('/products'))

router.get('/products', productController.getProducts)
router.get('/products/:id', productController.getProduct)

router.get('/cart', cartController.getCart)
router.post('/cart', cartController.postCart)
router.post('/cartItem/:id/add', cartController.addCartItem)
router.post('/cartItem/:id/sub', cartController.subCartItem)
router.delete('/cartItem/:id', cartController.deleteCartItem)

router.get('/orders', orderController.getOrders)
router.post('/order', orderController.postOrder)
router.post('/order/:id/cancel', orderController.cancelOrder)

router.get('/order/:id/payment', orderController.getPayment)
router.post('/newebpay/callback', orderController.newebpayCallback)

module.exports = router
