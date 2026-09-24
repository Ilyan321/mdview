import { describe, it, expect } from 'vitest';

describe('Testing Infrastructure Setup', () => {
  it('initializes vitest with jsdom environment correctly', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
    expect(1 + 1).toBe(2);
  });
});
