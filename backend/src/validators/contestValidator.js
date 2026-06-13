const { body } = require('express-validator');

const createContestRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Contest title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters')
    .escape(),
  body('description')
    .optional()
    .trim(),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after the start time');
      }
      return true;
    }),
  body('problems')
    .isArray({ min: 1 })
    .withMessage('Contest must contain at least 1 problem')
    .custom((value) => {
      if (value.some(id => !/^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All problems must be valid MongoDB IDs');
      }
      return true;
    }),
];

module.exports = {
  createContestRules,
};
