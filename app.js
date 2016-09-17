var express  = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var configDB = require('./routes/models/database.js');
mongoose.connect(configDB.url);
require('./routes/authentication')(passport);

app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());

	app.use(favicon(path.join(__dirname, 'public/images', 'click.ico')));
	app.set('views', path.join(__dirname, 'views'));
	app.engine('js', require('ejs').renderFile);

	app.use(express.session({ secret: 'secretsession' }));
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(flash());

	app.use('/public', express.static(__dirname + '/public'));
	app.use('/publicboot', express.static(__dirname + '/public/bootstrap'));
	app.use('/publicfont', express.static(__dirname + '/public/font-awesome'));
});

require('./routes/routes.js')(app, passport);

app.listen(port);
