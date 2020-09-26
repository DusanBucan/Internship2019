const userRoles = {
  guest: 1, // ...001
  user: 2, // ...010
  admin: 4 // ...100
};

userRoles.accessLevels = {
  guest: userRoles.guest | userRoles.user | userRoles.admin, // ...111 - Can be accessed by everyone
  user: userRoles.user | userRoles.admin, // ...110 - Can be accessed by users and admins
  admin: userRoles.admin // ...100 - Can be accessed by admins
};

module.exports = userRoles;
