const { body } = require('express-validator');

const updateProfileRules = [
  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('linkedInUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('LinkedIn URL must be a valid URL'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of strings'),
  body('cgpa')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be a decimal value between 0 and 10'),
  body('experience')
    .optional()
    .trim()
    .escape(),
  body('projects')
    .optional()
    .trim()
    .escape(),
];

module.exports = {
  updateProfileRules,
};
