export type PasswordChecks = {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return {
    hasMinLength,
    hasUppercase,
    hasNumber,
    isValid: hasMinLength && hasUppercase && hasNumber,
  };
}
