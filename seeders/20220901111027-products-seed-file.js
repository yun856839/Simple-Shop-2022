'use strict'
const faker = require('faker')

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			'Products',
			Array.from({ length: 10 }).map((item, index) => ({
				id: index + 1,
				name: faker.commerce.productName(),
				description:
					faker.commerce.product() + '/' + faker.commerce.productName(),
				price: faker.commerce.price(),
				image: `https://loremflickr.com/320/240/restaurant,food/?lock=${
					Math.random() * 100
				}`,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Products', null, { truncate: true })
	},
}
