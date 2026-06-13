const { body } = require('express-validator');

const createSnippetRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('language')
    .notEmpty()
    .withMessage('Language is required'),
  body('files')
    .isArray({ min: 1 })
    .withMessage('Snippet must have at least one file'),
  body('files.*.filename')
    .notEmpty()
    .withMessage('Filename is required'),
  body('files.*.content')
    .optional({ checkFalsy: true })
    .isString(),
];

module.exports = {
  createSnippetRules,
};
