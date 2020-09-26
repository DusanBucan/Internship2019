const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateChangePasswordInput(data) {
  let errors = {};

  data.password = !isEmpt(data.password) ? data.password : '';
  data.password2 = !isEmpt(data.password2) ? data.password2 : '';
  data.password3 = !isEmpt(data.password3) ? data.password3 : '';

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Current Password field is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = 'Password field is required';
  }

  if (!Validator.isLength(data.password2, { min: 6, max: 30 })) {
    errors.password2 = 'Password must be at least 6 characters';
  }

  if (Validator.isEmpty(data.password3)) {
    errors.password3 = 'Confirm password field is required';
  }

  if (!Validator.equals(data.password, data.password3)) {
    errors.password3 = 'Passwords must match';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
