var express  = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

require('./config/passport')(passport);
app.configure(function() {
	app.use(express.logger('dev'));
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(favicon(path.join(__dirname, 'dist/images', 'click.ico')));
	app.set('views', path.join(__dirname, 'views'));
	//app.set('view engine', 'ejs');
	app.engine('js', require('ejs').renderFile);
	app.use(express.session({ secret: 'secretsession' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

	//Customized theme elements from the Bootstrp marketspace
	app.use('/vendorcss', express.static(__dirname + '/vendor/bootstrap/css'));
	app.use('/vendorjs', express.static(__dirname + '/vendor/bootstrap/js'));
	app.use('/vendormentis', express.static(__dirname + '/vendor/metisMenu'));
	app.use('/vendormorrisjs', express.static(__dirname + '/vendor/morrisjs'));
	app.use('/vendorfont', express.static(__dirname + '/vendor/font-awesome'));
	app.use('/vendorjq', express.static(__dirname + '/vendor/jquery/'));
	app.use('/vendordist', express.static(__dirname + '/dist'));
	app.use('/vendordata', express.static(__dirname + '/data'));
	app.use('/vendorraph', express.static(__dirname + '/vendor/raphael'));
	app.use('/pubjs', express.static(__dirname + '/public/javascripts'));
});

require('./app/routes.js')(app, passport);

app.listen(port);
