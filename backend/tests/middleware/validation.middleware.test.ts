import { sanitizeData } from '../../src/middleware/validation.middleware';

describe('Validation Middleware', () => {
  describe('sanitizeData', () => {
    it('should not sanitize email fields', () => {
      const email = 'test@example.com';
      const result = sanitizeData(email, 'email');
      expect(result).toBe(email);
    });

    it('should sanitize non-email string fields', () => {
      const htmlString = '<script>alert("xss")</script>';
      const result = sanitizeData(htmlString, 'otherField');
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should sanitize nested objects but preserve email fields', () => {
      const data = {
        email: 'test@example.com',
        name: '<script>alert("xss")</script>',
        details: {
          email: 'another@example.com',
          description: '<img src="x" onerror="alert(1)">'
        }
      };

      const result = sanitizeData(data);
      
      // Email fields should remain unchanged
      expect(result.email).toBe('test@example.com');
      expect(result.details.email).toBe('another@example.com');
      
      // Non-email fields should be sanitized
      expect(result.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.details.description).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
    });

    it('should handle arrays with email and non-email fields', () => {
      const data = {
        emails: ['test1@example.com', 'test2@example.com'],
        descriptions: ['<script>alert("xss")</script>', '<img src="x" onerror="alert(1)">']
      };

      const result = sanitizeData(data);
      
      // Email fields should remain unchanged
      expect(result.emails[0]).toBe('test1@example.com');
      expect(result.emails[1]).toBe('test2@example.com');
      
      // Non-email fields should be sanitized
      expect(result.descriptions[0]).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(result.descriptions[1]).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
    });
  });
});