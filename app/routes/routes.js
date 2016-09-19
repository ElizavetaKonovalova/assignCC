var express = require('express');
var User = require('./models/user');
var sendRequest = require('request');
var graphFB = require('fbgraph');
var json_query = require('json-query');
var twitter_api = require('twit');
var configAuth = require('./models/credentials');

module.exports = function(app, auth) {

	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {user : req.user});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

    //Feed
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

	//Facebook Authentication
	app.get('/auth/facebook', auth.authenticate('facebook', { scope : ['public_profile,email,user_actions.news,' +
	'user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,rsvp_event,' +
	'user_friends,user_managed_groups,read_page_mailboxes '] }));
	app.get('/auth/facebook/callback',auth.authenticate('facebook',{successRedirect:'/profile',failureRedirect:'/'}));

	//Twitter Authentication
	app.get('/auth/twitter', auth.authenticate('twitter', {scope:'email'}));
	app.get('/auth/twitter/callback',auth.authenticate('twitter',{successRedirect:'/profile',failureRedirect:'/'}));

	//Todoist Authentication
	app.get('/auth/todoist',auth.authenticate('todoist',{scope:['data:read_write', 'data:delete'],state: 'secretstring'}));
	app.get('/auth/todoist/callback', auth.authenticate('todoist', {successRedirect:'/profile', failureRedirect:'/'}));

	//Google Authentication
	app.get('/auth/google', auth.authenticate('google', { scope : ['profile', 'email'] }));
	app.get('/auth/google/callback', auth.authenticate('google', {successRedirect : '/profile',failureRedirect : '/'}));

	//Connect Facebook
	app.get('/connect/facebook', auth.authorize('facebook', {scope : ['public_profile,email,user_actions.news,' +
	'user_events,user_likes,user_photos,user_posts,manage_pages,publish_pages,user_managed_groups,' +
	'rsvp_event,user_friends,read_page_mailboxes']}));
	app.get('/connect/facebook/callback',auth.authorize('facebook',{successRedirect:'/profile',failureRedirect : '/'}));

	//Connect Twitter
	app.get('/connect/twitter', auth.authorize('twitter', { scope : 'email' }));
	app.get('/connect/twitter/callback',auth.authorize('twitter',{successRedirect : '/profile',
				failureRedirect : '/'}));

	//Connect Google
	app.get('/connect/google', auth.authorize('google', { scope : ['profile', 'email'] }));
	app.get('/connect/google/callback',auth.authorize('google',{successRedirect : '/profile',
				failureRedirect : '/'}));

	//Connect Todoist
	app.get('/connect/todoist', auth.authorize('todoist',{scope:['data:read_write', 'data:delete'],state: 'secretstring'}));
	app.get('/connect/todoist/callback',auth.authorize('todoist',{successRedirect : '/profile',
		failureRedirect : '/'}));

    //Unlink Accounts
	app.get('/unlink/facebook', function(req, res) {
		var user = req.user;
		user.facebook.token = undefined;
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
	app.get('/unlink/twitter', function(req, res) {
		var user = req.user;
		user.twitter.token = undefined;
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