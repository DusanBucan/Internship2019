const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateListInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : '';
  data.accessibility = !isEmpty(data.accessibility) ? data.accessibility : '';

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if (Validator.isEmpty(data.accessibility)) {
    errors.accessibility = 'Accessibility field is required';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};
