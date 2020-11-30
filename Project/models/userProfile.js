var connDB = require('./../utility/connectionDB');
var userConn = require('./userConnection');
var user = require('./user');
var userConnDB = require('./../utility/userConnectionDB');
var userProf = function (userID, userConns, userCreatedList) {
    this.userID = userID;
    this.userConnsList = userConns;
    this.userCreatedList = userCreatedList;

    //Code when a new connection is added 
    this.addConnection = async function (Connection, rsvp) {
        var flag = 0;
        var connObj;
        if (this.userConnsList == undefined || this.userConnsList.length == 0) {
            connObj = await connDB.getEvents(Connection);
            await userConnDB.addRSVP(connObj, this.userID, rsvp);
        }
        else {
            connObj = await connDB.getEvents(Connection);
            flag = await this.updateConnection(new userConn(connObj, rsvp));
            if (flag === 0) {
                await userConnDB.addRSVP(connObj, this.userID, rsvp);
            };
        }
    };

    //Code when a connection is deleted
    this.removeConnection = async function (connectionID) {
        await userConnDB.removeConn(connectionID, this.userID);
    };

    //Code when a connection is updated
    this.updateConnection = async function (userConn) {
        var flag = 0;
        flag = await userConnDB.updateRSVP(userConn.connection.connectionID, this.userID, userConn.rsvp);
        return flag;
    };

    //List of Connections
    this.getConnections = async function () {
        this.userConnsList = await userConnDB.getUserProfile(this.userID);
        return this.userConnsList;
    };

    this.emptyProfile = function () {
        this.userConnsList = [];
    };

};

module.exports.userProf = userProf;