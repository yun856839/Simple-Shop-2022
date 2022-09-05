const db = require('../models')
const Product = db.Product
const Cart = db.Cart
const PAGE_LIMIT = 6
let PAGE_OFFSET = 0

let productController = {
	getProducts: async (req, res) => {
		if (req.query.page) {
			PAGE_OFFSET = (req.query.page - 1) * PAGE_LIMIT
		}
		const products = await Product.findAndCountAll({
			raw: true,
			nest: true,
			offset: PAGE_OFFSET,
			limit: PAGE_LIMIT,
		})
		// pagination
		const page = Number(req.query.page) || 1
		const pages = Math.ceil(products.count / PAGE_LIMIT)
		const totalPage = Array.from({ length: pages }).map(
			(item, index) => index + 1
		)
		const prev = page - 1 < 1 ? 1 : page - 1
		const next = page + 1 > pages ? pages : page + 1

		let cart = await Cart.findByPk(req.session.cartId, { include: 'items' })
		cart = cart || { items: [] }
		let totalPrice =
			cart.items.length > 0
				? cart.items
						.map(d => d.price * d.CartItem.quantity)
						.reduce((a, b) => a + b)
				: 0
		return res.render('products', {
			products,
			cart,
			totalPrice,
			page,
			totalPage,
			prev: prev,
			next,
		})
	},

	getProduct: async (req, res) => {
		let product = await Product.findByPk(req.params.id)
		let cart = await Cart.findByPk(req.session.cartId, { include: 'items' })
		cart = cart || { items: [] }
		let totalPrice =
			cart.items.length > 0
				? cart.items
						.map(d => d.price * d.CartItem.quantity)
						.reduce((a, b) => a + b)
				: 0
		return res.render('product', {
			product: product.toJSON(),
			cart,
			totalPrice,
		})
	},
}

module.exports = productController
