'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert('Users', [
			{
				email: 'root@example.com',
				password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
				role: 'admin',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		])
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Users', null, { truncate: true })
	},
}
