import { useState, useCallback, ChangeEvent } from 'react';

export type ValidationRule<T> = {
  validate: (value: any, formValues: T) => boolean;
  message: string;
};

export type FieldConfig<T> = {
  value: any;
  rules?: ValidationRule<T>[];
  touched?: boolean;
  error?: string;
};

export type FormConfig<T> = {
  [K in keyof T]: FieldConfig<T>;
};

/**
 * Хук для управления формами с валидацией
 * @param initialValues Начальные значения полей формы
 * @param validateOnChange Флаг, указывающий, нужно ли валидировать при изменении значения
 * @returns Объект с состоянием формы и методами для работы с ней
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validateOnChange: boolean = false
) {
  // Создаем начальную конфигурацию формы
  const createInitialFormConfig = (): FormConfig<T> => {
    const config: any = {};
    for (const key in initialValues) {
      config[key] = {
        value: initialValues[key],
        rules: [],
        touched: false,
        error: ''
      };
    }
    return config as FormConfig<T>;
  };

  const [formConfig, setFormConfig] = useState<FormConfig<T>>(createInitialFormConfig());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Получаем текущие значения формы
  const getValues = useCallback((): T => {
    const values: any = {};
    for (const key in formConfig) {
      values[key] = formConfig[key].value;
    }
    return values as T;
  }, [formConfig]);

  // Получаем ошибки формы
  const getErrors = useCallback((): Partial<Record<keyof T, string>> => {
    const errors: Partial<Record<keyof T, string>> = {};
    for (const key in formConfig) {
      if (formConfig[key].error) {
        errors[key] = formConfig[key].error;
      }
    }
    return errors;
  }, [formConfig]);

  // Устанавливаем правила валидации для поля
  const setFieldRules = useCallback(
    <K extends keyof T>(fieldName: K, rules: ValidationRule<T>[]) => {
      setFormConfig((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          rules
        }
      }));
    },
    []
  );

  // Валидируем поле
  const validateField = useCallback(
    <K extends keyof T>(fieldName: K): boolean => {
      const field = formConfig[fieldName];
      const values = getValues();

      if (!field.rules || field.rules.length === 0) {
        return true;
      }

      for (const rule of field.rules) {
        const isValid = rule.validate(field.value, values);
        if (!isValid) {
          setFormConfig((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              error: rule.message,
              touched: true
            }
          }));
          return false;
        }
      }

      // Если все правила прошли, очищаем ошибку
      setFormConfig((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error: '',
          touched: true
        }
      }));
      return true;
    },
    [formConfig, getValues]
  );

  // Валидируем всю форму
  const validate = useCallback((): boolean => {
    let isValid = true;
    for (const fieldName in formConfig) {
      const fieldIsValid = validateField(fieldName as keyof T);
      isValid = isValid && fieldIsValid;
    }
    return isValid;
  }, [formConfig, validateField]);

  // Обработчик изменения значения поля
  const handleChange = useCallback(
    <K extends keyof T>(
      fieldName: K,
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;
      
      setFormConfig((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          touched: true
        }
      }));

      if (validateOnChange) {
        validateField(fieldName);
      }
    },
    [validateOnChange, validateField]
  );

  // Устанавливаем значение поля программно
  const setValue = useCallback(
    <K extends keyof T>(fieldName: K, value: any, shouldValidate: boolean = false) => {
      setFormConfig((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          touched: true
        }
      }));

      if (shouldValidate) {
        validateField(fieldName);
      }
    },
    [validateField]
  );

  // Сбрасываем форму к начальным значениям
  const reset = useCallback(() => {
    setFormConfig(createInitialFormConfig());
    setIsSubmitting(false);
  }, []);

  // Проверяем, есть ли в форме ошибки
  const hasErrors = useCallback((): boolean => {
    for (const key in formConfig) {
      if (formConfig[key].error) {
        return true;
      }
    }
    return false;
  }, [formConfig]);

  // Проверяем, были ли изменены значения формы
  const isDirty = useCallback((): boolean => {
    for (const key in formConfig) {
      if (formConfig[key].touched) {
        return true;
      }
    }
    return false;
  }, [formConfig]);

  return {
    values: getValues(),
    errors: getErrors(),
    isSubmitting,
    setIsSubmitting,
    handleChange,
    setValue,
    setFieldRules,
    validate,
    validateField,
    reset,
    hasErrors,
    isDirty
  };
}

export default useForm; 