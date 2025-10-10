import swaggerJsdoc from 'swagger-jsdoc';
import openApiConfig from '../config/openapi.config';

/**
 * Utility function to test OpenAPI specification generation
 * This can be used to verify that the OpenAPI spec is valid
 */
export async function validateOpenApiSpec(): Promise<boolean> {
  try {
    const specs: any = swaggerJsdoc(openApiConfig);
    
    // Basic validation - check if required fields exist
    if (!specs.openapi) {
      console.error('OpenAPI version missing');
      return false;
    }
    
    if (!specs.info) {
      console.error('API info missing');
      return false;
    }
    
    if (!specs.paths) {
      console.error('API paths missing');
      return false;
    }
    
    console.log('OpenAPI specification generated successfully');
    console.log(`OpenAPI Version: ${specs.openapi}`);
    console.log(`API Title: ${specs.info.title}`);
    console.log(`API Version: ${specs.info.version}`);
    console.log(`Number of paths: ${Object.keys(specs.paths).length}`);
    
    return true;
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateOpenApiSpec().then(isValid => {
    if (isValid) {
      console.log('OpenAPI specification is valid');
      process.exit(0);
    } else {
      console.error('OpenAPI specification is invalid');
      process.exit(1);
    }
  });
}