import Logger from '../utils/logger';

export class BaseService {
  protected logger: typeof Logger;
  
  constructor() {
    this.logger = Logger;
  }
  
  /**
   * Handles common error scenarios and logs them appropriately
   * @param error - The error to handle
   * @param operation - The operation that was being performed
   * @param rethrow - Whether to rethrow the error (default: true)
   */
  protected handleError(error: any, operation: string, rethrow: boolean = true): void {
    this.logger.error(`Error in ${operation}:`, error);
    
    if (rethrow) {
      throw error;
    }
  }
}