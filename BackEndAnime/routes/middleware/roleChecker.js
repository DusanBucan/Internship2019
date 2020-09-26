exports.allowOnly = function(accessLevel, callback) {
  //unutrasnja fija
  function checkUserRole(req, res) {
    // bit operator je ovo & jer nije sa && ---> gledace po parovima

    if (!(accessLevel & req.user.role)) {
      res.sendStatus(403);
      return;
    } else {
      callback(req, res);
    }
  }

  return checkUserRole;
};
