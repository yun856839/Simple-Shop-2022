'use strict'
const faker = require('faker')

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			'Orders',
			Array.from({ length: 2 }).map((item, index) => ({
				name: faker.commerce.productName(),
				phone: faker.phone.phoneNumber(),
				address: faker.address.streetAddress(),
				email: faker.internet.email(),
				amount: faker.random.number(),
				sn: faker.random.number(),
				shipping_status: Math.floor(Math.random() * 1),
				payment_status: Math.floor(Math.random() * 1),
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Orders', null, { truncate: true })
	},
}
