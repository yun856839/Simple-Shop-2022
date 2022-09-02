const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart

let orderController = {
	getOrders: async (req, res) => {
		let orders = await Order.findAll({ include: 'items' })
		return res.render('orders', {
			orders,
		})
	},

	postOrder: async (req, res) => {
		let cart = await Cart.findByPk(req.body.cartId, { include: 'items' })
		const {
			name,
			address,
			phone,
			email,
			shipping_status,
			payment_status,
			amount,
		} = req.body
		if (!name) {
			req.flash('error_messages', "name didn't exist")
			return res.redirect('back')
		}

		let order = await Order.create({
			name,
			address,
			phone,
			email,
			shipping_status,
			payment_status,
			amount,
		})
		let results = []
		for (let i = 0; i < cart.items.length; i++) {
			await results.push(
				OrderItem.create({
					OrderId: order.id,
					ProductId: cart.items[i].id,
					price: cart.items[i].price,
					quantity: cart.items[i].CartItem.quantity,
				})
			)
		}

		await Promise.all(results)
		return res.redirect('/orders')
	},

	cancelOrder: async (req, res) => {
		const order = await Order.findByPk(req.params.id)
		await order.update({
			...req.body,
			shipping_status: '-1',
			payment_status: '-1',
		})
		return res.redirect('back')
	},
}

module.exports = orderController
