/**
 * Generates a unique ID for forms
 * Uses timestamp + random string for uniqueness
 */
export function generateFormId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `form_${timestamp}_${randomStr}`;
}