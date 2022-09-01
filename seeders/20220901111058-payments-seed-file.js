'use strict'
const faker = require('faker')

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			'Payments',
			Array.from({ length: 5 }).map((item, index) => ({
				amount: faker.random.number(),
				sn: faker.random.number(),
				payment_method: Math.floor(Math.random() * 3) + 1,
				paid_at: new Date(),
				params: null,
				OrderId: Math.floor(Math.random() * 2) + 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Payments', null, { truncate: true })
	},
}
