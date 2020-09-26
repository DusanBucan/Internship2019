const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCommentInput(data) {
  let errors = {};

  data.content = !isEmpty(data.content) ? data.content : '';

  if (Validator.isEmpty(data.content)) {
    errors.content = 'Please feel free to leave your comments';
  }

  return {
    errors: errors,
    isValid: isEmpty(errors)
  };
};

