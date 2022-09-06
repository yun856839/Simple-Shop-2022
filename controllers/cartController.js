const db = require('../models')
const Cart = db.Cart
const CartItem = db.CartItem
const PAGE_LIMIT = 10
const PAGE_OFFSET = 0

let cartController = {
	getCart: async (req, res) => {
		// console.log(req.session)
		let cart = await Cart.findByPk(req.session.cartId, { include: 'items' })
		cart = cart || { items: [] }
		let totalPrice =
			cart.items.length > 0
				? cart.items
						.map(d => d.price * d.CartItem.quantity)
						.reduce((a, b) => a + b)
				: 0
		return res.render('cart', {
			cart: cart.dataValues,
			totalPrice,
		})
	},

	postCart: async (req, res) => {
		const cart = await Cart.findOrCreate({
			where: {
				id: req.session.cartId || 0,
			},
		})
		const cartItem = await CartItem.findOrCreate({
			where: {
				CartId: cart[0].dataValues.id,
				ProductId: req.body.productId,
			},
			default: {
				CartId: cart[0].dataValues.id,
				ProductId: req.body.productId,
			},
		})
		await cartItem[0].update({
			quantity: (cartItem[0].quantity || 0) + 1,
		})
		req.session.cartId = cart[0].dataValues.id
		req.session.save()
		return res.redirect('back')
	},

	addCartItem: async (req, res) => {
		let cartItem = await CartItem.findByPk(req.params.id)
		await cartItem.update({
			quantity: cartItem.quantity + 1,
		})
		return res.redirect('back')
	},

	subCartItem: async (req, res) => {
		let cartItem = await CartItem.findByPk(req.params.id)
		await cartItem.update({
			quantity: cartItem.quantity - 1 >= 1 ? cartItem.quantity - 1 : 1,
		})
		return res.redirect('back')
	},

	deleteCartItem: async (req, res) => {
		let cartItem = await CartItem.findByPk(req.params.id)
		await cartItem.destroy()
		return res.redirect('back')
	},
}

module.exports = cartController
