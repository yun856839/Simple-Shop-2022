const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const routes = require('./routes/index')
const session = require('express-session')
const passport = require('./config/passport')

require('dotenv').config()

const app = express()
const PORT = 3000

app.engine(
	'hbs',
	exphbs.engine({
		defaultLayout: 'main',
		extname: '.hbs',
		helpers: require('./config/handlebars-helpers'),
	})
)
app.set('view engine', 'hbs')
app.use('/upload', express.static(__dirname + '/upload'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		name: 'shop',
		cookie: { maxAge: 86400 },
		resave: false,
		saveUninitialized: true,
	})
)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use((req, res, next) => {
	res.locals.success_messages = req.flash('success_messages')
	res.locals.error_messages = req.flash('error_messages')

	next()
})

app.use(routes)

app.listen(PORT, () => {
	console.log(`App is running on http://localhost:${PORT}`)
})

module.exports = app
