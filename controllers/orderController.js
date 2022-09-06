require('dotenv').config()
const db = require('../models')
const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart
const crypto = require('crypto')

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

// ----------串接金流 加解密----------
const URL = process.env.URL
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV
const PayGateWay = 'https://ccore.newebpay.com/MPG/mpg_gateway'
const ReturnURL = URL + '/newebpay/callback?from=ReturnURL'
const NotifyURL = URL + '/newebpay/callback?from=NotifyURL'
const ClientBackURL = URL + '/orders'

// 把 Object 轉成字串型
function genDataChain(TradeInfo) {
	let results = []
	for (let kv of Object.entries(TradeInfo)) {
		results.push(`${kv[0]}=${kv[1]}`)
	}
	return results.join('&')
}

// 把字串型做加密
function create_mpg_aes_encrypt(TradeInfo) {
	let encrypt = crypto.createCipheriv('aes256', HashKey, HashIV)
	let enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex')
	return enc + encrypt.final('hex')
}

// 把字串型做雜湊
function create_mpg_sha_encrypt(TradeInfo) {
	let sha = crypto.createHash('sha256')
	let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`
	return sha.update(plainText).digest('hex').toUpperCase()
}

// 解密
function create_mpg_aes_decrypt(TradeInfo) {
	let decrypt = crypto.createDecipheriv('aes256', HashKey, HashIV)
	decrypt.setAutoPadding(false)
	let text = decrypt.update(TradeInfo, 'hex', 'utf8')
	let plainText = text + decrypt.final('utf8')
	let result = plainText.replace(/[\x00-\x20]+/g, '')
	return result
}

// 取得加密結果
function getTradeInfo(Amt, Desc, email) {
	// console.log('===== getTradeInfo =====')
	// console.log(Amt, Desc, email)
	// console.log('==========')

	data = {
		MerchantID: MerchantID, // 商店代號
		RespondType: 'JSON', // 回傳格式
		TimeStamp: Date.now(), // 時間戳記
		Version: 1.5, // 串接程式版本
		MerchantOrderNo: Date.now(), // 商店訂單編號
		LoginType: 0, // 智付通會員
		OrderComment: 'OrderComment', // 商店備註
		Amt: Amt, // 訂單金額
		ItemDesc: Desc, // 產品名稱
		Email: email, // 付款人電子信箱
		ReturnURL: ReturnURL, // 支付完成返回商店網址
		NotifyURL: NotifyURL, // 支付通知網址/每期授權結果通知
		ClientBackURL: ClientBackURL, // 支付取消返回商店網址
	}

	// console.log('===== getTradeInfo: data =====')
	// console.log(data)

	mpg_aes_encrypt = create_mpg_aes_encrypt(data)
	mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

	// console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
	// console.log(mpg_aes_encrypt)
	// console.log(mpg_sha_encrypt)

	tradeInfo = {
		MerchantID: MerchantID, // 商店代號
		TradeInfo: mpg_aes_encrypt, // 加密後參數
		TradeSha: mpg_sha_encrypt,
		Version: 1.5, // 串接程式版本
		PayGateWay: PayGateWay,
		MerchantOrderNo: data.MerchantOrderNo,
	}

	// console.log('===== getTradeInfo: tradeInfo =====')
	// console.log(tradeInfo)

	return tradeInfo
}
// ----------串接金流 加解密----------

let orderController = {
	getOrders: async (req, res) => {
		if (!req.isAuthenticated()) {
			req.flash('error_messages', '需先登入才可使用')
			return res.redirect('/signin')
		}
		let orders = await Order.findAll({
			where: { UserId: req.user.id },
			include: 'items',
		})
		// console.log(orders)
		return res.render('orders', {
			orders,
		})
	},

	postOrder: async (req, res) => {
		if (!req.isAuthenticated()) {
			req.flash('error_messages', '需先登入才可使用')
			return res.redirect('/signin')
		}
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
		if (!cart) {
			req.flash('error_messages', 'Woops! Your shopping cart is empty!')
			return res.redirect('back')
		}
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
			UserId: req.user.id,
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
			subject: `${order.id}訂單成立`,
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
		await Cart.destroy({ where: { id: req.body.cartId } })
		req.flash('success_messages', '成立訂單')
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

	getPayment: async (req, res) => {
		// console.log('=========getPayment=========')
		// console.log(req.params.id)
		// console.log('=========getPayment=========')

		const order = await Order.findByPk(req.params.id, {})
		const tradeInfo = getTradeInfo(order.amount, '產品名稱', order.email)
		await order.update({
			...req.body,
			sn: tradeInfo.MerchantOrderNo,
		})

		return res.render('payment', { order: order.toJSON(), tradeInfo })
	},

	newebpayCallback: async (req, res) => {
		// console.log('=========newebpayCallback=========')
		// console.log(req.method)
		// console.log(req.query)
		// console.log(req.body)
		// console.log('=========newebpayCallback=========')

		// console.log('=================spagetewayCallback: tradeInfo=============')
		// console.log(req.body.TradeInfo)

		const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))

		// console.log('=================spagetewayCallback: tradeInfo=============')
		// console.log(data)

		let orders = await Order.findAll({
			where: { sn: data['Result']['MerchantOrderNo'] },
		})
		await orders[0].update({
			...req.body,
			payment_status: 1,
		})
		req.flash('success_messages', '付款成功')
		return res.redirect('/orders')
	},
}

module.exports = orderController
