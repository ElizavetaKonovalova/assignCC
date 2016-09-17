var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

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

    google:
    {
        id : String,
        token : String,
        email : String,
        name : String
    },

    todoist:
    {
        id : String,
        token: String,
        code: String,
        email: String,
        full_name: String
    },

    toggl:
    {
        id: String,
        default_wid: String,
        fullname: String,
        email: String
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

module.exports = mongoose.model('User', userSchema);
