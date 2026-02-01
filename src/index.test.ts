import { add, subtract } from './index';

describe('add', () => {
  test('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('adds negative and positive number', () => {
    expect(add(-1, 1)).toBe(0);
  });
});

describe('subtract', () => {
  test('subtracts two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });

  test('returns negative when subtracting larger from smaller', () => {
    expect(subtract(0, 5)).toBe(-5);
  });
});
