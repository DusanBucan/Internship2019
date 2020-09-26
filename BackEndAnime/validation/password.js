const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePasswordInput(data) {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';
  data.password3 = !isEmpty(data.password3) ? data.password3 : '';

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password = 'Password field is required';
  }
  if (Validator.isEmpty(data.password3)) {
    errors.password = 'Password field is required';
  }
  if (!Validator.equals(data.password2, data.password3)) {
    errors.password = 'New password and new password 2 must be the same';
  }

  if (data.password2.length <= 6 || data.password3.length <= 6) {
    errors.password =
      'New password and new password 2 must be longer than 5 character';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
