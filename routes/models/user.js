var mongodb = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userDB = mongodb.Schema({

    google:
    {
        id : String,
        token : String,
        email : String,
        name : String
    },

    facebook:
    {
        id : String,
        token : String,
        name : String
    },

    twitter:
    {
        id : String,
        token : String,
        token_secret: String,
        displayName : String,
        username : String
    },

    todoist:
    {
        id : String,
        token: String,
        code: String,
        email: String,
        full_name: String
    }
});

userDB.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = mongodb.model('User', userDB);
