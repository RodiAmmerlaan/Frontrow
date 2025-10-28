const Joi = require('joi');

// Test the Joi validation for email with the updated schema
const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: ['test', 'com'] } }).required(),
  password: Joi.string().min(8).required()
});

// Test with the original email format
const testData1 = {
  email: 'admin@frontrow.test',
  password: 'testpassword'
};

// Test with a standard email format
const testData2 = {
  email: 'admin@frontrow.com',
  password: 'testpassword'
};

console.log('Testing with admin@frontrow.test:');
const { error: error1, value: value1 } = loginSchema.validate(testData1);

if (error1) {
  console.log('Validation failed:', error1.details);
} else {
  console.log('Validation passed:', value1);
}

console.log('\nTesting with admin@frontrow.com:');
const { error: error2, value: value2 } = loginSchema.validate(testData2);

if (error2) {
  console.log('Validation failed:', error2.details);
} else {
  console.log('Validation passed:', value2);
}