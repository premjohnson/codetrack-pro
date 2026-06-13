const { body } = require('express-validator');

const createTaskRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('difficulty')
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('technology')
    .trim()
    .notEmpty()
    .withMessage('Technology is required')
    .escape(),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ID'),
  body('testCases')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one test case is required if test cases are provided'),
  body('testCases.*.input')
    .notEmpty()
    .withMessage('Test case input is required'),
  body('testCases.*.output')
    .notEmpty()
    .withMessage('Test case output is required'),
  body('testCases.*.isHidden')
    .optional()
    .isBoolean()
    .withMessage('isHidden must be a boolean value'),
  body('codeTemplates')
    .optional()
    .isArray()
    .withMessage('Code templates must be an array'),
  body('codeTemplates.*.language')
    .notEmpty()
    .withMessage('Template language is required'),
  body('codeTemplates.*.templateCode')
    .notEmpty()
    .withMessage('Template code is required'),
];

const updateTaskRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),
  body('description')
    .optional()
    .trim(),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('technology')
    .optional()
    .trim()
    .escape(),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ID'),
];

module.exports = {
  createTaskRules,
  updateTaskRules,
};
