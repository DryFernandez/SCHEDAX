// data/validationRules.js
// Reglas de validación para formularios

export const requiredFields = [
  'nombre', 
  'apellidos', 
  'telefono', 
  'edad', 
  'genero'
];

export const fieldValidations = {
  telefono: {
    maxLength: 14,
    pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
    errorMessage: 'Formato de teléfono inválido. Use: (123) 456-7890'
  },
  edad: {
    min: 16,
    max: 100,
    pattern: /^\d+$/,
    errorMessage: 'La edad debe ser un número entre 16 y 100'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Formato de email inválido'
  },
  fechaNacimiento: {
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
    errorMessage: 'Formato de fecha inválido. Use: DD/MM/YYYY'
  }
};

export const genderOptions = [
  'Masculino',
  'Femenino', 
  'Otro'
];

// Función para validar un campo específico
export const validateField = (fieldName, value) => {
  const validation = fieldValidations[fieldName];
  if (!validation) return { isValid: true };

  // Verificar si es requerido
  if (requiredFields.includes(fieldName) && (!value || value.trim() === '')) {
    return {
      isValid: false,
      error: `${fieldName} es requerido`
    };
  }

  // Verificar patrón
  if (validation.pattern && value && !validation.pattern.test(value)) {
    return {
      isValid: false,
      error: validation.errorMessage
    };
  }

  // Verificar longitud mínima y máxima
  if (validation.min && value && value.length < validation.min) {
    return {
      isValid: false,
      error: `${fieldName} debe tener al menos ${validation.min} caracteres`
    };
  }

  if (validation.max && value && value.length > validation.max) {
    return {
      isValid: false,
      error: `${fieldName} debe tener máximo ${validation.max} caracteres`
    };
  }

  return { isValid: true };
};

// Función para validar todos los campos requeridos
export const validateRequiredFields = (data) => {
  // Validar que data existe y es un objeto
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      missingFields: requiredFields
    };
  }

  const missingFields = [];
  
  requiredFields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
};
