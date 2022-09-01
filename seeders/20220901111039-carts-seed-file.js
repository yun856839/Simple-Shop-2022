'use strict'

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.bulkInsert(
			'Carts',
			Array.from({ length: 3 }).map((item, index) => ({
				id: index + 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			})),
			{}
		)
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Carts', null, { truncate: true })
	},
}
