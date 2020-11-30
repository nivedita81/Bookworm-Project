//Creating a connection constructor and assigning all information related to each connection
var event = function (connectionID, connectionName, connectionType, userName, details, location, date, image,thehost) {
    this.connectionID = connectionID;
    this.connectionName = connectionName;
    this.connectionType = connectionType;
    this.userName = userName;
    this.details = details;
    this.location = location;
    this.date = date;
    this.image = image;
    this.thehost = thehost
};


module.exports = event;