var Eve = require('../models/connection');
var mongoose = require('mongoose');
var db = 'mongodb://localhost/bookworm';
var Schema = mongoose.Schema;

//Assigning schema for ConnectionList Collection in DB
var bookwormdb = mongoose.model('Connectionlist', new Schema({
    connectionID: String,
    connectionName: String,
    connectionType: String,
    username: String,
    details: String,
    location: String,
    date: String,
    image: String,
    thehost : String
}));


mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//List of connections available
var getEve = async function () {
    var eventslist = [];

    await bookwormdb.find({}).exec().then((event) => {
        eventslist = event;
    }).catch((err) => {
        console.log(err);
    });

    return eventslist;
}

//Fetching a particular connection with connection ID as parameter
var getEvents = async function (connectionID) {
    var event_detail;
    await bookwormdb.findOne({
        connectionID: connectionID
    }).exec().then((events) => {
        event_detail = new Eve(events.connectionID, events.connectionName, events.connectionType, events.username, events.details, events.location, events.date, events.image);
    }).catch((err) => {
        console.log(err);
    });
    return event_detail;

}

//Adding a new connection to the database
var addConnection = async function (connection) {
    var newconn = new bookwormdb({
        connectionID: connection.connectionID,
        connectionName: connection.connectionName,
        connectionType: connection.connectionType,
        username: connection.userName,
        details: connection.details,
        location: connection.location,
        date: connection.date,
        image: connection.image,
        thehost: connection.thehost
    });
    await newconn.save(function (err) {
        if (err)
            return console.error(err);
    });
}



var getUserConnections = async function (userid) {
    var connections = [];
    
    await bookwormdb.find({
        thehost : userid
    }).exec().then((object) => {
        connections = object;
    }).catch((err) => {
        console.log(err);
    });

    return connections;
}


var deleteUserConnections = async function (connectionId) {
    await bookwormdb.deleteOne({ connectionID : connectionId }, function (err) {
    if (err) return handleError(err);
  });
}

module.exports.getEve = getEve;
module.exports.getEvents = getEvents;
module.exports.addConnection = addConnection;
module.exports.getUserConnections = getUserConnections;
module.exports.deleteUserConnections = deleteUserConnections;