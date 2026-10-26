export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6;
};


export const validateUsername = (username) => {
  if (!username) return false;
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};


export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 10000000;
};


export const validateDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d) && d <= new Date();
};


export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  return true;
};


export const validatePhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};


export const validateOTP = (otp) => {
  if (!otp) return false;
  const otpRegex = /^\d{4,6}$/;
  return otpRegex.test(otp);
};


export const getValidationError = (field, value) => {
  const validators = {
    email: {
      validate: validateEmail,
      message: 'Please enter a valid email address',
    },
    password: {
      validate: validatePassword,
      message: 'Password must be at least 6 characters',
    },
    username: {
      validate: validateUsername,
      message: 'Username must be 3-30 characters (letters, numbers, underscore only)',
    },
    amount: {
      validate: validateAmount,
      message: 'Amount must be between 0 and 10,000,000',
    },
    date: {
      validate: validateDate,
      message: 'Please enter a valid date (not in future)',
    },
    required: {
      validate: validateRequired,
      message: 'This field is required',
    },
    phone: {
      validate: validatePhone,
      message: 'Please enter a valid 10-digit phone number',
    },
    otp: {
      validate: validateOTP,
      message: 'OTP must be 4-6 digits',
    },
  };

  const validator = validators[field];
  if (!validator) return null;

  return validator.validate(value) ? null : validator.message;
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];

    for (const rule of fieldRules) {
      const error = getValidationError(rule, value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
