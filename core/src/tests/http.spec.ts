/**
 * @jest-environment jsdom
 */

import { buildUrlParams } from '../core-plugins';

describe('buildUrlParams', () => {
  it('should handle array parameters correctly', () => {
    const params = {
      tags: ['javascript', 'typescript', 'react'],
      single: 'value',
    };

    const result = buildUrlParams(params, true);
    
    // The bug: array values will have a trailing \u0026
    // Expected: "tags=javascript\u0026tags=typescript\u0026tags=react\u0026single=value"
    // Actual: "tags=javascript\u0026tags=typescript\u0026tags=react\u0026\u0026single=value"
    
    expect(result).not.toContain('\u0026\u0026');
    expect(result).toBe('tags=javascript\u0026tags=typescript\u0026tags=react\u0026single=value');
  });

  it('should remove initial ampersand', () => {
    const params = {
      key: 'value',
    };

    const result = buildUrlParams(params, true);
    
    expect(result).toBe('key=value');
    expect(result?.[0]).not.toBe('\u0026');
  });
});
