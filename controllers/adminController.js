const db = require('../models')
const Product = db.Product
const fs = require('fs')
const imgur = require('imgur')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
imgur.setClientId(IMGUR_CLIENT_ID)
imgur.setAPIUrl('https://api.imgur.com/3/')

let adminController = {
	getProducts: async (req, res) => {
		let products = await Product.findAll({ raw: true, nest: true })
		return res.render('admin/products', { products })
	},

	getProduct: async (req, res) => {
		let product = await Product.findByPk(req.params.id)
		return res.render('admin/product', { product: product.toJSON() })
	},

	createProduct: async (req, res) => {
		return res.render('admin/create')
	},

	postProduct: async (req, res) => {
		if (!req.body.name) {
			req.flash('error_messages', "name didn't exist")
			return res.redirect('back')
		}
		const { file } = req
		if (file) {
			let img = await imgur.uploadFile(file.path)
			await Product.create({
				name: req.body.name,
				price: req.body.price,
				description: req.body.description,
				image: file ? img.link : null,
			})
		} else {
			await Product.create({
				name: req.body.name,
				price: req.body.price,
				description: req.body.description,
				image: null,
			})
		}
		req.flash('success_messages', 'Product was successfully created')
		return res.redirect('/admin/products')
	},

	editProduct: async (req, res) => {
		let product = await Product.findByPk(req.params.id)
		return res.render('admin/create', { product: product.toJSON() })
	},

	putProduct: async (req, res) => {
		if (!req.body.name) {
			req.flash('error_messages', "name didn't exist")
			return res.redirect('back')
		}
		const { file } = req
		let product = await Product.findByPk(req.params.id)
		if (file) {
			let img = await imgur.uploadFile(file.path)
			await product.update({
				name: req.body.name,
				price: req.body.price,
				description: req.body.description,
				image: file ? img.link : product.image,
			})
		} else {
			await product.update({
				name: req.body.name,
				price: req.body.price,
				description: req.body.description,
				image: product.image,
			})
		}
		req.flash('success_messages', 'Product was successfully to update')
		return res.redirect('/admin/products')
	},

	deleteProduct: (req, res) => {
		return Product.findByPk(req.params.id).then(product => {
			product.destroy().then(product => {
				res.redirect('/admin/products')
			})
		})
	},
}

module.exports = adminController
