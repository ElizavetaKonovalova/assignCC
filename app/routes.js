var User = require('../app/user');
var sendRequest = require('request');
var graphFB = require('fbgraph');
var json_query = require('json-query');
var twitter_api = require('twit');
var configAuth = require('../config/auth');
var toggl = require('toggl-api');
var toggl_report = require('toggl-reports');
var express = require('express');
var jsdom = require('jsdom');
var jquery = require('jquery');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {user : req.user});

		var timer_toggl = new toggl(configAuth.toggl);

		timer_toggl.getUserData('/me', function (err, results) {
            process.nextTick(function () {
                if (!req.user) {

                    User.findOne({'toggl.id': results.id}, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return user;
                        } else {
                            // if there is no user, create them
                            var newUser = new User();
                            newUser.toggl.id = results.id;
                            newUser.toggl.fullname = results.fullname;
                            newUser.toggl.default_wid = results.default_wid;
                            newUser.toggl.email = results.email;
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return newUser;
                            });
                        }
                    });

                } else {
                    var user = req.user;
                    user.toggl.id = results.id;
                    user.toggl.fullname = results.fullname;
                    user.toggl.default_wid = results.default_wid;
                    user.toggl.email = results.email;
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return user;
                    });
                }

            });
        });
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/read_news', function(req, res) {
		var user = req.user;

		graphFB.setAccessToken(user.facebook.token);
        graphFB.get('/me/events', function (err, reply) {

            if (user.twitter.token != null) {
                //Twitter news feed
                var twitt = new twitter_api({
                    consumer_key: configAuth.twitterAuth.consumerKey,
                    consumer_secret: configAuth.twitterAuth.consumerSecret,
                    access_token: user.twitter.token,
                    access_token_secret: user.twitter.token_secret
                });

                twitt.get('statuses/home_timeline', function (err, data) {
                    res.render('feed.ejs', {facebook_data: reply.data, twitter_data: data});
                });
            }
            else {
                res.render('feed.ejs', {facebook_data: reply.data, twitter_data: null});
            }
		});
    });

    //Toggl Reporting
    app.get('/reports', function (req, res) {
        var user = req.user.toggl;
        var test_toggl = new toggl_report(configAuth.toggl.apiToken, user.email);

        test_toggl.detailed({workspace_id: user.default_wid}, function (err, resus) {
            //console.log(json_query('', {data:resus.data}).value);
            res.render('reports.ejs', {report_data: json_query('', {data: resus.data}).value});

            jsdom.env({
                url: 'reports.ejs',
                src: [jquery],
                done: function (errors, window) {
                    var $ = window.$;
                    console.log("HN Links");
                    $(function () {
                        Morris.Area({
                            element: 'morris-area-chart',
                            data: json_query('', {data: resus.data}).value,
                            xkey: 'start',
                            ykeys: ['dur'],
                            labels: ['dur'],
                            pointSize: 2,
                            hideHover: 'auto',
                            resize: true
                        });
                    });
                }
            });
        });
	});

	//Local Login
	app.get('/login', function(req, res){res.render('login.ejs', { message: req.flash('loginMessage') });});
	app.post('/login',passport.authenticate('local-login',{successRedirect:'/profile',failureRedirect:'/login',
		failureFlash : true}));

	//Local Sign up
	app.get('/signup',function(req, res){res.render('signup.ejs',{message:req.flash('loginMessage')});});
	app.post('/signup', passport.authenticate('local-signup',{successRedirect:'/profile',failureRedirect:'/signup',
		failureFlash : true}));

	//Facebook Authentication
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile,email,user_actions.news,' +
	'user_actions.video,user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,rsvp_event,' +
	'user_friends,user_managed_groups,read_page_mailboxes '] }));
	app.get('/auth/facebook/callback',passport.authenticate('facebook',{successRedirect:'/profile',failureRedirect:'/'}));

	//Twitter Authentication
	app.get('/auth/twitter', passport.authenticate('twitter', {scope:'email'}));
	app.get('/auth/twitter/callback',passport.authenticate('twitter',{successRedirect:'/profile',failureRedirect:'/'}));

	//Todoist Authentication
	app.get('/auth/todoist',passport.authenticate('todoist',{scope:['data:read_write', 'data:delete'],state: 'secretstring'}));
	app.get('/auth/todoist/callback', passport.authenticate('todoist', {successRedirect:'/profile', failureRedirect:'/'}));

	//Google Authentication
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
	app.get('/auth/google/callback', passport.authenticate('google', {successRedirect : '/profile',failureRedirect : '/'}));

	//Connect Local
	app.get('/connect/local', function(req, res){res.render('connect-local.ejs',{message: req.flash('loginMessage')});});
	app.post('/connect/local',passport.authenticate('local-signup',{successRedirect:'/profile',failureRedirect : '/connect/local',
			failureFlash : true}));

	//Connect Facebook
	app.get('/connect/facebook', passport.authorize('facebook', {scope : ['public_profile,email,user_actions.news,' +
	'user_actions.video,user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,user_managed_groups,' +
	'rsvp_event,user_friends,read_page_mailboxes']}));
	app.get('/connect/facebook/callback',passport.authorize('facebook',{successRedirect:'/profile',failureRedirect : '/'}));

	//Connect Twitter
	app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
	app.get('/connect/twitter/callback',passport.authorize('twitter',{successRedirect : '/profile',
				failureRedirect : '/'}));

	//Connect Google
	app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
	app.get('/connect/google/callback',passport.authorize('google',{successRedirect : '/profile',
				failureRedirect : '/'}));

	//Connect Todoist
	app.get('/connect/todoist', passport.authorize('todoist',{scope:['data:read_write', 'data:delete'],state: 'secretstring'}));
	app.get('/connect/todoist/callback',passport.authorize('todoist',{successRedirect : '/profile',
		failureRedirect : '/'}));

	app.get('/unlink/local', function(req, res) {
		var user = req.user;
		user.local.email = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	app.get('/unlink/facebook', function(req, res) {
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	app.get('/unlink/twitter', function(req, res) {
		var user = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	app.get('/unlink/google', function(req, res) {
		var user = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	app.get('/unlink/todoist', function(req, res) {
		var user = req.user;
		user.todoist.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});
};
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}