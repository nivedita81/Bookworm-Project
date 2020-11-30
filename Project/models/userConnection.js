//Creating a user connection constructor and assigning all connection information related to each user connection
var userConn = function (connection, rsvp) {
    this.connection = connection;
    this.rsvp = rsvp;
};


module.exports = userConn;