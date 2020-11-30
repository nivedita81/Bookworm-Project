var User = require('../models/user');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/bookworm';
var Schema = mongoose.Schema;

//Assigning schema for UserList Collection in DB
var buserdb = mongoose.model('Userlist', new Schema({
    userID: String,
    firstName: String,
    lastName: String,
    email: String,
    city: String,
    state: String,
    country: String,
    password: Object,
}));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//Fetching the list of users
var getUsers = async function () {
    var userslist = [];
    await buserdb.find({}).exec().then((user) => {
        userslist = user;
    }).catch((err) => {
        console.log(err);
    });
    return userslist;
}

//Fetching the user using the userID
var getUser = async function (ID) {
    var userObject;

    await buserdb.findOne({
        userID: ID
    }).exec().then((user) => {
        if (user) {
            userObject = new User(user.userID, user.firstName, user.lastName, user.email, user.city, user.state, user.country, user.password);
        }
    }).catch((err) => {
        console.log(err);
    });

    return userObject;
}

//Assigning the username to the user if already exists, else creating new one
var userNameCheck = async function (Username) {
    var uObj;

    await buserdb.findOne({
        userID: Username
    }).exec().then((user) => {
        if (user) {
            uObj = new User(user.userID, user.firstName, user.lastName, user.email, user.city, user.state, user.country, user.password);
        }
    }).catch((err) => {
        console.log(err);
    });

    return uObj;
}

//Assigning the email to the user if already exists, else creating new one
var emailCheck = async function (Email) {
    var eObj;

    await buserdb.findOne({
        email: Email
    }).exec().then((user) => {
        if (user) {
            eObj = new User(user.userID, user.firstName, user.lastName, user.email, user.city, user.state, user.country, user.password);
        }
    }).catch((err) => {
        console.log(err);
    });

    return eObj;
}

//A new user is added to the database
var addNewUser = async function (user) {

    var newUser = new buserdb({
        userID: user.userID,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city,
        state: user.state,
        country: user.country,
        password: user.password
    });

    await newUser.save(function (err, addConnection) {
        if (err) return console.error(err);
    });

}

module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    userNameCheck: userNameCheck,
    emailCheck: emailCheck,
    addNewUser: addNewUser
};
