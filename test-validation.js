

const Joi = require('joi');

// Test the login schema directly with specific TLDs allowed
const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: ['test', 'com', 'org', 'net', 'nl'] } }).required(),
  password: Joi.string().min(8).required()
});

// Test data
const testData = {
  email: 'admin@frontrow.test',
  password: 'testpassword'
};

console.log('Testing validation with data:', testData);

const { error, value } = loginSchema.validate(testData);

if (error) {
  console.log('Validation failed:', error.details);
} else {
  console.log('Validation passed:', value);
}
