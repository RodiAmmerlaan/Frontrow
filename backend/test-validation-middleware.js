const Joi = require('joi');

// Import the validation middleware functions
const { validateRequest } = require('./dist/middleware/validation.middleware');

// Create a mock request object
const mockRequest = {
  body: {
    email: 'admin@frontrow.test',
    password: 'testpassword'
  }
};

// Create a mock response object
const mockResponse = {
  status: function(code) {
    console.log('Response status:', code);
    return this;
  },
  json: function(data) {
    console.log('Response data:', data);
    return this;
  }
};

// Create a mock next function
const mockNext = function() {
  console.log('Next function called');
};

// Create the login schema
const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: ['test', 'com', 'org', 'net', 'nl'] } }).required(),
  password: Joi.string().min(8).required()
});

// Test the validation middleware
console.log('Testing validation middleware');

const middleware = validateRequest(loginSchema, { source: 'body', sanitize: false });

try {
  middleware(mockRequest, mockResponse, mockNext);
} catch (error) {
  console.log('Middleware threw error:', error);
}