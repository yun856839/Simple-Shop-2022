module.exports = {
	ifCond: function (a, b, options) {
		if (a === b) {
			return options.fn(this)
		}
		return options.inverse(this)
	},

	ifPaid: function (a, b, options) {
		if (a > b) {
			return options.fn(this)
		} else if (a < b) {
			return options.fn(this)
		}
		return options.inverse(this)
	},
}
