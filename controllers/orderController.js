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
		const errors = []
		const emailRule =
			/^\w+((-\w+)|(\.\w+)|(\+\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
		if (!name.trim() || !phone.trim() || !address.trim() || !email.trim()) {
			errors.push({ message: '*為必填，不能空白 !' })
		}
		if (isNaN(phone)) {
			errors.push({ message: '非正確號碼' })
		}
		if (email.search(emailRule) === -1) {
			errors.push({ message: '非正確 Email' })
		}
		if (errors.length) {
			return res.render('cart', {
				errors,
				name,
				address,
				phone,
				email,
			})
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
		req.flash('success_msg', '成立訂單')
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
