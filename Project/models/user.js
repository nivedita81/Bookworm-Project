//Creating a user constructor and assigning all information related to each user
var user = function (userID, firstName, lastName, email, city, state, country, password) {
    this.userID = userID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.city = city;
    this.state = state;
    this.country = country;
    this.password = password;
};


module.exports = user;