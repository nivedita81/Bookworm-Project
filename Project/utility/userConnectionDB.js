var mongoose = require('mongoose');
var db = 'mongodb://localhost/bookworm';
var Schema = mongoose.Schema;

//Assigning schema for UserConnectionList Collection in DB
var ucdb = mongoose.model('Userconnectionlist', new Schema({
    userID: String,
    connectionID: String,
    connectionType: String,
    connectionName: String,
    rsvp: String
}));

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).
    catch(error => handleError(error));

//Checks whether the existing User ID and the requested USer ID are same
var getUserProfile = async function (userID) {
    var userconnectionlists = [];
    await ucdb.find({
        userID: userID
    }).exec().then((obj_userconns) => {
        userconnectionlists = obj_userconns;
    }).catch((err) => {
        console.log(err);
    });
    return userconnectionlists;
};

//Adding a RSVP for an event
var addRSVP = async function (connection, userID, rsvp) {
    var newConn = new ucdb({
        userID: userID,
        connectionID: connection.connectionID,
        connectionType: connection.connectionType,
        connectionName: connection.connectionName,
        rsvp: rsvp
    });
    await newConn.save(function (err) {
        if (err) return console.error(err);
    });
};

//Adding a RSVP for an event
var updateRSVP = async function (connectionID, userID, rsvp) {
    var update_flag = 0;
    await ucdb.findOneAndUpdate(
        { userID: userID, connectionID: connectionID },
        { $set: { rsvp: rsvp } }
    ).exec().then((uc_obj) => {
        if (uc_obj) {
            update_flag = 1;
        }
    }).catch((err) => {
        console.log(err);
    });

    return update_flag;
};

//Deleting an event from the user's connection
var removeConn = async function (connectionID, userID) {
    ucdb.deleteOne(
        { userID: userID, connectionID: connectionID }, function (err) {
            if (err)
                return handleError(err);
        });
};


var removeUsersConnection = async function(connectionId){
    ucdb.deleteMany({connectionID : connectionId}, function (err) {
        if (err) return handleError(err);
      });
}


module.exports.addRSVP = addRSVP;
module.exports.updateRSVP = updateRSVP;
module.exports.removeConn = removeConn;
module.exports.getUserProfile = getUserProfile;
module.exports.removeUsersConnection = removeUsersConnection;