const { body } = require('express-validator');

const rateSubmissionRules = [
  body('score')
    .notEmpty()
    .withMessage('Rating score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Feedback comment is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Feedback comment must be between 5 and 1000 characters')
    .escape(),
];

const submitCodeRules = [
  body('code')
    .notEmpty()
    .withMessage('Code is required'),
  body('language')
    .notEmpty()
    .withMessage('Language is required'),
];

module.exports = {
  rateSubmissionRules,
  submitCodeRules,
};
