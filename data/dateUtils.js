// data/dateUtils.js
// Utilidades para manejo de fechas

export const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

export const formatDate = (day, month, year) => {
  const formattedDay = day.toString().padStart(2, '0');
  const formattedMonth = month.toString().padStart(2, '0');
  return `${formattedDay}/${formattedMonth}/${year}`;
};

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

export const getYearRange = (yearsBack = 80) => {
  const currentYear = getCurrentYear();
  return Array.from({ length: yearsBack }, (_, i) => currentYear - i);
};

export const formatPhoneNumber = (text) => {
  // Validar que text no sea undefined o null
  if (!text) return '';
  
  // Remover todos los caracteres que no sean números
  const cleaned = text.replace(/\D/g, '');
  
  // Aplicar formato (XXX) XXX-XXXX
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

export const parseDate = (dateString) => {
  // Parsear fecha en formato DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return {
      day: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      year: parseInt(parts[2], 10)
    };
  }
  return null;
};

export const isValidDate = (day, month, year) => {
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && 
         date.getMonth() === month - 1 && 
         date.getFullYear() === year;
};
