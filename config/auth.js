// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '184783945260587', // your App ID
		'clientSecret' 	: '673775b9356bc58e85ceaa61e7a74de8',
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'FHGkrrrbzR4O17ktzWYLNRBi2',
		'consumerSecret' 	: 'Fe0XHA1ninrcRfaFrIhgD2UIzMKwoz7ChnxvLWmdoFUW8ssCWR',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '1015667699351-kua9728u8iacljvif1ul4hdpkihhgfcc.apps.googleusercontent.com',
		'clientSecret' 	: 'RTEsUPrmyzfUfZL8QqBhmkAp',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};