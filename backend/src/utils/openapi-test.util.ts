import swaggerJsdoc from 'swagger-jsdoc';
import openApiConfig from '../config/openapi.config';

/**
 * Utility function to test OpenAPI specification generation
 * This can be used to verify that the OpenAPI spec is valid
 */
export async function validateOpenApiSpec(): Promise<boolean> {
  try {
    const specs: any = swaggerJsdoc(openApiConfig);
    
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
        
    return true;
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    return false;
  }
}

if (require.main === module) {
  validateOpenApiSpec().then(isValid => {
    if (isValid) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}