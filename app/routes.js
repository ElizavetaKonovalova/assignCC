var User = require('../app/user');
var sendRequest = require('request');
var graphFB = require('fbgraph');
var json_query = require('json-query');
var twitter_api = require('twit');
var configAuth = require('../config/auth');
var toggl = require('toggl-api');
var toggl_report = require('toggl-reports');
var google = require('googleapis');
var google_plus = google.plus('v1');
var express = require('express');
var co = require('co');
var jsdom = require('jsdom');
var moment = require('moment');

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

        graphFB.get('/me/likes', function (err, reply) {

            var facebook_data;
            var liked_pages;

            if(reply.data != null)
            {
                liked_pages = json_query('id', {data: reply.data}).value;
                for(i = 0; i < liked_pages.length; i++)
                {
                    graphFB.get(liked_pages[i] + '/feed', function (error, data_received) {
                        facebook_data = data_received.data;
                    });
                }
            }
            else
            {
                graphFB.get('/me/feed', function (err, null_likes) {
                    facebook_data = null_likes.data;
                });
            }

            if (user.twitter.token != null) {
                var twitt = new twitter_api({
                    consumer_key: configAuth.twitterAuth.consumerKey,
                    consumer_secret: configAuth.twitterAuth.consumerSecret,
                    access_token: user.twitter.token,
                    access_token_secret: user.twitter.token_secret
                });

                twitt.get('statuses/home_timeline', {count:50}, function (err, data) {
                    sendRequest('https://newsapi.org/v1/articles?source=techcrunch&apiKey=ec1a9e6ec5084a32afd0ffb5d2362b40',
                        function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                tech_news = JSON.parse(body);
                                res.render('feed.ejs', {facebook_data: facebook_data, twitter_data: data,
                                    twitter_urls: json_query('entities.urls.url', {data: data}).value,
                                    techcrunch: json_query('articles', {data: tech_news}).value});
                            }
                            else {
                                res.render('feed.ejs', {facebook_data: facebook_data, twitter_data: data,
                                    twitter_urls: json_query('entities.urls.url', {data: data}).value,
                                    techcrunch: null});
                            }
                        });
                });
            }
            else {
                res.render('feed.ejs', {facebook_data: facebook_data, twitter_data: null});
            }
        });

    });

    //Reporting
    app.get('/reports', function (req, res) {
        //res.render('reports.ejs');

        var user = req.user.toggl;
        var test_toggl = new toggl_report(configAuth.toggl.apiToken, user.email);

        test_toggl.detailed({workspace_id: user.default_wid}, function (err, resus) {
        	report_data = json_query('', {data: resus.data}).value;
            var start_datetime = json_query('start', {data:report_data}).value;
            var end_time = json_query('end', {data:report_data}).value;
            //console.log(end_time);
            res.render('reports.ejs', {start:start_datetime, end: end_time, moment:moment});
        });
	});

	//Facebook Authentication
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile,email,user_actions.news,' +
	'user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,rsvp_event,' +
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

	//Connect Facebook
	app.get('/connect/facebook', passport.authorize('facebook', {scope : ['public_profile,email,user_actions.news,' +
	'user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,user_managed_groups,' +
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