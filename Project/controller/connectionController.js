var express = require('express');
var router = express.Router();
var connectionDB = require('./../utility/connectionDB');
var connect = require('./../models/connection');
const uniqid = require('uniqid');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

//Assigning routes and rendering pages for each
router.get('/', function (req, res) {
    res.render('index', { session: req.session.theUser });
});

router.get('/index', function (req, res) {
    res.render('index', { session: req.session.theUser });
});

router.get('/about', function (req, res) {
    res.render('about', { session: req.session.theUser });
});

router.get('/contact', function (req, res) {
    res.render('contact', { session: req.session.theUser });
});

router.get('/login', function (req, res) {
    res.render('login', { session: req.session.theUser, error: null });
});

router.get('/signup', function (req, res) {
    res.render('signup', { session: req.session.theUser, error: null });
});

router.get('/connections', async function (req, res) {
    res.render('connections', { conn: await connectionDB.getEve(), session: req.session.theUser });
});

router.get('/newConnection', function (req, res) {
    res.render('newConnection', { session: req.session.theUser, error: null });
});

router.get('/savedConnections', function (req, res) {
    res.render('savedConnections', { session: req.session.theUser });
});

//When a new connection is created, it is validated and added to the database
router.post('/addNewConnection', urlencodedParser, sanitizeBody('notifyOnReply').toBoolean(),
    check('eventName').custom(val => /^[a-zA-Z ]+$/.test(val)).withMessage('Event Name should be alphabets and can contain spaces'),
    check('username').custom(val => /^[a-zA-Z ]+$/.test(val)).withMessage('Username should be alphabets and can contain spaces'),
    check('details').custom(val => /^[a-zA-Z ]+$/.test(val)).withMessage('Details should be alphabets and can contain spaces'),
    check('location').custom(val => /^[a-zA-Z0-9 ,-]+$/.test(val)).withMessage('Location should be alphanumeric and can contain spaces')
    , async function (req, res) {
        var errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('newConnection', { session: req.session.theUser, error: errors.array() });
        } else {
            eventObj = new connect(uniqid('book'), req.body.eventName, req.body.eventType, req.body.username, req.body.details, req.body.location, req.body.date, "new.jpg",req.session.theUser.userID);
            await connectionDB.addConnection(eventObj);
            res.redirect('connections');
        }
    });

//When routing to connection page, checking the length of the query, if none, it's redirected to connections page
router.get('/connection', async function (req, res) {
    if (Object.keys(req.query).length === 0) {
        res.render('connections', { conn: await connectionDB.getEve(), session: req.session.theUser });
    }
    else if (Object.keys(req.query).length === 1) {
        idCheck(req, res);  //If query has a parameter, we are validating it by calling this function
    }
});


var checkConnId = function (connId) {
    var alphaNumeric = /^[0-9a-zA-Z]+$/;    //Validating whether Connection ID is alphanumeric
    if (connId.match(alphaNumeric)) {
        return true;
    }
    else {
        console.log('not valid');
        return false;
    }
}

//Checking for the parameter Connection ID and routing it to the respective page
var idCheck = async function (req, res) {
    var obj_conn;
    if (Object.keys(req.query)[0] === 'connectionID') { //checking whether the parameter is "ConnectionID"
        var connID = req.query.connectionID;
        if (checkConnId(connID)) {
            obj_conn = await connectionDB.getEvents(connID);
            if (obj_conn) {
                res.render('connection', { obj_conn_key: obj_conn, session: req.session.theUser });
            } else {
                res.render('connections', { conn: await connectionDB.getEve(), session: req.session.theUser });
            }
        } else {
            res.render('connections', { conn: await connectionDB.getEve(), session: req.session.theUser });
        }
    } else {
        res.redirect('/connections');
    }
}


module.exports.router = router;