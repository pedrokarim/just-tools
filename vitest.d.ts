/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveClass(className: string): R;
  toHaveAttribute(attr: string, value?: string): R;
  toHaveTextContent(text: string): R;
  toBeVisible(): R;
  toBeDisabled(): R;
  toBeEnabled(): R;
  toHaveValue(value: string | string[] | number): R;
  toHaveDisplayValue(value: string | string[]): R;
  toBeChecked(): R;
  toHaveFocus(): R;
  toHaveFormValues(expectedValues: Record<string, any>): R;
  toHaveStyle(css: string | Record<string, any>): R;
  toHaveAccessibleName(name: string): R;
  toHaveAccessibleDescription(description: string): R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
