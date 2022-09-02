require('dotenv').config()
const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart

// ----------Mail 設定----------
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
	// 寄信的帳密
	service: 'gmail',
	host: 'smtp.gmail.com',
	secureConnection: false, // SSL方式,防止竊取訊息
	auth: {
		type: 'OAuth2',
		user: process.env.GMAIL_ACCOUNT,
		clientId: process.env.CLINENTID,
		clientSecret: process.env.CLINENTSECRET,
		refreshToken: process.env.REFRESHTOKEN,
		accessToken: process.env.ACCESSTOKEN,
	},
})
// ----------Mail 設定----------

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

		// ----------Mail 設定----------
		const mailOptions = {
			from: process.env.GMAIL_ACCOUNT,
			to: email,
			subject: `訂單編號${order.id}成立`,
			text: `${order.id} 訂單成立，總額為 ${amount}`,
		}
		await transporter.sendMail(mailOptions, function (err, info) {
			if (err) {
				console.log(err)
			} else {
				console.log('Email sent: ' + info.response)
			}
		})
		// ----------Mail 設定----------

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
