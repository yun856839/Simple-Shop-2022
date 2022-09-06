const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
	signUpPage: (req, res) => {
		return res.render('signup')
	},

	signUp: async (req, res) => {
		const emailRule =
			/^\w+((-\w+)|(\.\w+)|(\+\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/
		const { password, passwordCheck, email } = req.body
		let userExisted = await User.findOne({ where: { email: req.body.email } })
		if (passwordCheck !== password) {
			req.flash('error_messages', '兩次密碼輸入不同！')
			return res.redirect('/signup')
		}
		if (email.search(emailRule) === -1) {
			req.flash('error_messages', '非正確 Email')
			return res.redirect('/signup')
		}
		if (userExisted) {
			req.flash('error_messages', '信箱重複！')
			return res.redirect('/signup')
		}
		await User.create({
			email,
			password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
		})
		req.flash('success_messages', '成功註冊帳號！')
		return res.redirect('/signin')
	},

	signInPage: (req, res) => {
		if (req.isAuthenticated()) {
			if (req.user.role === 'admin') {
				req.flash('error_messages', '已登入請直接使用')
				return res.redirect('/admin/products')
			}
			req.flash('error_messages', '已登入請直接使用')
			return res.redirect('/products')
		}
		return res.render('signin')
	},

	signIn: (req, res) => {
		req.flash('success_messages', '成功登入！')
		if (req.user.role === 'admin') {
			return res.redirect('/admin/products')
		}
		return res.redirect('/products')
	},

	logout: (req, res) => {
		if (!req.isAuthenticated()) {
			req.flash('error_messages', '尚未登入')
			return res.redirect('/products')
		}

		req.flash('success_messages', '登出成功！')
		req.logout(err => {
			if (err) return next(err)
		})
		res.redirect('/products')
	},
}

module.exports = userController
