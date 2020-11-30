var express = require('express');
var router = express.Router();
var connDB = require('./../utility/connectionDB');
var user = require('./../models/user');
var usersList = require('./../utility/userDB');
var userConn = require('./../models/userConnection');
var userConnDB = require('./../utility/userConnectionDB');
var userProfObj = require('./../models/userProfile');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { check, validationResult } = require('express-validator');
//Password Validator
var PasswordPolicy = require('password-sheriff').PasswordPolicy;
var charsets = require('../node_modules/password-sheriff/lib/rules/contains').charsets;
var userProf;
var encryptDecrypt = require('./../utility/passwordUtility');
const { sanitizeBody } = require('express-validator');


//Store a user's profile contents in the session
router.get('/', async function (req, res) {
    var userde = await usersList.getUsers();
    var userdef = userde[0];
    if (req.session.theUser === undefined) {
        req.session.theUser = new user(userdef.userID, userdef.firstName, userdef.lastName, userdef.email, userdef.city, userdef.state, userdef.country, userdef.password);
    }
    var userConnsList = await userConnDB.getUserProfile(req.session.theUser.userID);
    var usercreatedConnsList = await connDB.getUserConnections(req.session.theUser.userID);
    userProf = new userProfObj.userProf(req.session.theUser.userID, userConnsList, usercreatedConnsList);
    req.session.theUser.userProf = userProf;
    res.render('savedConnections', { data: req.session.theUser.userProf, session: req.session.theUser });

});

var connectionID;

//Steps to follow to assign rsvp for each connection
router.get('/rsvp', async function (req, res) {
    if (Object.keys(req.query)[0] === 'connectionID') {
        connectionID = req.query.connectionID;
        await userProf.addConnection(connectionID, req.query.rsvp);
        req.session.theUser.userProf = userProf;
        res.redirect('/myConnections');
    }
});

//Steps to follow to delete for each connection
router.get('/delete', function (req, res) {
    if (req.session.theUser) {
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            userProf.removeConnection(connectionID);
            req.session.theUser.userProf = userProf;
            res.redirect('/myConnections');
        }
    }
});

//Code for deleting an event created by thhe looged in user
router.get('/user/delete', async function (req, res) {
    if (req.session.theUser) {
        if (Object.keys(req.query)[0] === 'connectionID') {
            connectionID = req.query.connectionID;
            await connDB.deleteUserConnections(connectionID);
            await userConnDB.removeUsersConnection(connectionID);
            req.session.theUser.userProf = userProf;
            res.redirect('/myConnections');
        }
    }
});

//Steps to follow to update for each connection
router.get('/update', function (req, res) {
    if (Object.keys(req.query)[0] === 'connectionID') {
        connectionID = req.query.connectionID;
        res.redirect('/connection?connectionID=' + connectionID)
    }
});

//Steps to follow when user clicks on logout for each session
router.get('/logout', function (req, res) {
    userConnsList = [];
    userProf = undefined;
    req.session.theUser = undefined;
    res.redirect('/');
    req.session.destroy();
});

//Password Validator
var containsPolicy = new PasswordPolicy({
    contains: {
        expressions: [charsets.lowerCase, charsets.upperCase, charsets.numbers]
    }, length: { minLength: 8 }
});

//Signup Page actions and form validation
router.post('/usersignup', urlencodedParser, sanitizeBody('notifyOnReply').toBoolean(),
    check('userID').custom(value => {
        if (value) {
            return /^[a-zA-Z0-9]*$/.test(value)
        }
        else {
            return Promise.reject("Please enter a User ID");
        }
    }).withMessage("User ID should only be alphabets and numbers"),
    check('userID').custom(async (value, { req }) => {
        if (value) {
            var user = await usersList.getUser(value);
            if (user) {
                return Promise.reject('User ID cannot be taken, already in use');
            } else {
                return true;
            }
        } else {
            return true;
        }
    }),

    check('firstname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('First Name should not be empty');
        }
    }).withMessage('First Name should can contain only alphabets and spaces'),

    check('lastname').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('Last Name should not be empty');
        }
    }).withMessage('Last Name should contain only alphabets and spaces'),

    check('email').isEmail().withMessage('Please enter a valid Email address'),
    check('email').custom(async (value, { req }) => {
        if (value) {
            var user = await usersList.emailCheck(value);   //checks whether this email address exists or not
            if (user) {
                return Promise.reject('Email address already exists');
            } else {
                return true;
            }
        } else {
            return true;
        }
    }),
    check('city').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('City should not be empty');
        }
    }).withMessage('City should contain only alphabets'),

    check('state').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('State should not be empty');
        }
    }).withMessage('State should contain only alphabets'),

    check('country').custom(value => {
        if (value) {
            return /^[a-zA-Z ]*$/.test(value)
        } else {
            return Promise.reject('Country should not be empty');
        }
    }).withMessage('Country should contain only alphabets'),
    check("password").custom(pwdvalue => {
        var validatepwd = containsPolicy.check(pwdvalue);   //Validating Password using the password package
        if (pwdvalue === " ") {
            return Promise.reject("Please enter a password");
        } else if (validatepwd === false) {
            return Promise.reject("Password does not meet expectations: 1.An Uppercase 2.A Lowercase 3.A number 4.Password should be minimum 8 characters");
        } else {
            return true;
        }
    }),
    check('confpassword').custom((value, { req }) => {
        if (value) {
            if (value != req.body.password) {
                return Promise.reject('Passwords do not match');
            } else {
                return true;
            }
        } else {
            return Promise.reject('Confirm your password please!');
        }
    }),
    async function (req, res) {
        var errors = await validationResult(req);
        if (!errors.isEmpty()) {    //If form has errors, it renders the same page with error messages
            res.render('signup', { session: req.session.theUser, error: errors.array() });
        } else {
            var password = await encryptDecrypt.encrypt(req.body.password); //Encrypts the password we enter in the form
            var newUser = new user(req.body.userID, req.body.firstname, req.body.lastname, req.body.email, req.body.city, req.body.state, req.body.country, password);
            await usersList.addNewUser(newUser);   //The new user from Sign up Form is created
            res.render('login', { session: req.session.theUser, error: errors.array() });
        }
    });


//Login Page actions and form validation
router.post('/userlogin', urlencodedParser, sanitizeBody('notifyOnReply').toBoolean(),
    check('username').custom(value => {      //Username Validation
        if (value) {
            return /^[a-zA-Z0-9]*$/.test(value)
        }
        else {
            return Promise.reject("Please enter a Username");
        }
    }).withMessage("Enter a valid Username"),
    check("password").custom(pwdvalue => {   //Password Validation
        var validatepwd = containsPolicy.check(pwdvalue);
        if (pwdvalue === " ") {
            return Promise.reject("Please enter a password");
        } else if (validatepwd === false) {
            return Promise.reject("Password does not meet expectations: 1.An Uppercase 2.A Lowercase 3.A number 4.Password should be minimum 8 characters");
        } else {
            return true;
        }
    }),
    async function (req, res) {
        var errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', { session: req.session.theUser, error: errors.array() });
        } else {
            if (req.session.theUser) {
                res.redirect('/myConnections'); //If login in successful, redirects to that user's list of connections
            } else {
                var checkuser = await usersList.userNameCheck(req.body.username);
                if (checkuser) {
                    var pcheck = await encryptDecrypt.decrypt(checkuser.password); //Decrypts the password encrypted in Signup Form

                    if (pcheck === req.body.password) {
                        req.session.theUser = new user(checkuser.userID, checkuser.firstName, checkuser.lastName, checkuser.email, checkuser.city, checkuser.state, checkuser.country, checkuser.password);
                        res.redirect('/myConnections');   //If login in successful, redirects to that user's list of connections
                    } else {
                        res.render('login', {
                            session: req.session.theUser, error: [{
                                'msg': 'Username or Password is incorrect',
                            }]
                        });
                    }
                } else {
                    res.render('login', {
                        session: req.session.theUser, error: [{
                            'msg': 'Username or Password is incorrect'
                        }]
                    });
                }
            }
        }
    });

module.exports = router;