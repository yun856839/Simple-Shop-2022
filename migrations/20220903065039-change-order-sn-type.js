'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('Orders', 'sn', {
			type: Sequelize.STRING(1024),
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('Orders', 'sn', {
			type: Sequelize.INTEGER,
		})
	},
}
