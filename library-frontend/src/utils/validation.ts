/**
 * Проверяет наличие кириллических символов в строке
 */
export const containsCyrillic = (text: string): boolean => /[а-яА-ЯёЁ]/.test(text);

/**
 * Проверяет, что строка содержит только разрешенные символы 
 * (латинские буквы, цифры и специальные символы)
 */
export const hasValidChars = (text: string): boolean =>
  /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(text);

/**
 * Валидирует данные формы смены пароля
 */
export const validatePasswordChange = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  const { currentPassword, newPassword, confirmPassword } = data;
  
  if (!currentPassword) {
    errors.currentPassword = 'Введите текущий пароль';
  }
  
  if (!newPassword) {
    errors.newPassword = 'Введите новый пароль';
  } else if (newPassword.length < 6) {
    errors.newPassword = 'Пароль должен содержать не менее 6 символов';
  } else if (containsCyrillic(newPassword)) {
    errors.newPassword = 'Пароль не должен содержать кириллические символы';
  } else if (!hasValidChars(newPassword)) {
    errors.newPassword = 'Пароль должен содержать только латинские буквы, цифры и специальные символы';
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = 'Подтвердите новый пароль';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
  }
  
  return errors;
}; 