var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var TodoistStrategy = require('passport-todoist').Strategy;
var User = require('./models/user');
var configAuth = require('./models/credentials');

module.exports = function(auth)
{
    auth.serializeUser(function(user, done) {
        done(null, user.id);
    });
    auth.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //Facebook API Strategy
    auth.use(new FacebookStrategy({
        clientID : configAuth.facebookAuth.clientID,
        clientSecret : configAuth.facebookAuth.clientSecret,
        callbackURL : configAuth.facebookAuth.callbackURL,
        scope: configAuth.facebookAuth.scope,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done){
        process.nextTick(function()
        {
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user)
                    {
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.displayName;
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        return done(null, user);
                    } else {
                        var newUser = new User();
                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.displayName;
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                var user = req.user;
                user.facebook.id    = profile.id;
                user.facebook.token = token;
                user.facebook.name  = profile.displayName;
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));

    //Twitter API Strategy
    auth.use(new TwitterStrategy({
        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;
                            user.twitter.token_secret = tokenSecret;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;
                        newUser.twitter.token_secret = tokenSecret;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;
                user.twitter.token_secret = tokenSecret;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));


    //Google API Strategy
    auth.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, token, refreshToken, profile, done) {
        process.nextTick(function() {
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = profile.emails[0].value;
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);});
                        }
                        return done(null, user);
                    } else {
                        var new_user          = new User();
                        new_user.google.id    = profile.id;
                        new_user.google.token = token;
                        new_user.google.name  = profile.displayName;
                        new_user.google.email = profile.emails[0].value;
                        new_user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, new_user);
                        });
                    }
                });

            } else {
                var user = req.user;
                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);});
                }
        });
    }));

    //Todoist API Strategy
    auth.use(new TodoistStrategy({
            clientID: configAuth.todoistAuth.clientID,
            clientSecret : configAuth.todoistAuth.clientSecret,
            callbackURL : configAuth.todoistAuth.callbackURL,
            passReqToCallback : true
        },
        function(req, token, refreshToken, profile, done) {
            process.nextTick(function() {
                if (!req.user) {
                    User.findOne({'todoist.id' : profile.id }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            if (!user.todoist.token) {
                                user.todoist.token = token;
                                user.todoist.code = profile.code;
                                user.todoist.email = profile.email;
                                user.todoist.full_name = profile.full_name;
                                user.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        } else {
                            var newUser = new User();
                            newUser.todoist.id    = profile.id;
                            newUser.todoist.token = profile.access_token;
                            newUser.todoist.code = profile.code;
                            newUser.todoist.email = profile.email;
                            newUser.todoist.full_name = profile.full_name;
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }});
                } else {
                    var user = req.user;
                    user.todoist.id    = profile.id;
                    user.todoist.token = token;
                    user.todoist.code = profile.code;
                    user.todoist.email = profile.email;
                    user.todoist.full_name = profile.full_name;

                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }));
};
