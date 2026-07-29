import { body, param, query, validationResult } from 'express-validator';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

export const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

export const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidation,
];

export const resetPasswordRules = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain a capital letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  handleValidation,
];

export const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain a capital letter')
    .matches(/[0-9]/).withMessage('New password must contain a number'),
  handleValidation,
];

export const contactRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  handleValidation,
];

export const contactUpdateRules = [
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidation,
];

export const contactMessageRules = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required'),
  handleValidation,
];

export const crmReplyRules = [
  body('body').trim().isLength({ min: 1 }).withMessage('Reply body is required'),
  handleValidation,
];
