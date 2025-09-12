// data/formConfig.js
// Configuración de formularios y componentes UI

export const formSections = {
  basicPersonal: {
    title: 'Información Personal Básica',
    fields: ['nombre', 'apellidos', 'telefono', 'edad']
  },
  educational: {
    title: 'Información Educativa Básica',
    fields: ['matricula', 'institucion', 'carrera']
  },
  additionalPersonal: {
    title: 'Información Personal Adicional',
    fields: ['fechaNacimiento', 'genero', 'direccion']
  }
};

export const fieldPlaceholders = {
  nombre: 'Tu nombre',
  apellidos: 'Tus apellidos',
  telefono: '(123) 456-7890',
  edad: 'Tu edad',
  matricula: 'Tu número de matrícula',
  institucion: 'Seleccionar institución',
  carrera: 'Seleccionar carrera',
  fechaNacimiento: 'DD/MM/YYYY',
  genero: 'Seleccionar género',
  direccion: 'Dirección completa',
  customInstitution: 'Nombre de la institución',
  customCareer: 'Nombre de la carrera'
};

export const fieldLabels = {
  nombre: 'Nombre(s) *',
  apellidos: 'Apellidos *',
  telefono: 'Teléfono *',
  edad: 'Edad *',
  matricula: 'Matrícula *',
  institucion: 'Institución *',
  carrera: 'Carrera *',
  fechaNacimiento: 'Fecha de Nacimiento *',
  genero: 'Género *',
  direccion: 'Dirección *'
};

export const fieldTypes = {
  nombre: 'text',
  apellidos: 'text',
  telefono: 'phone',
  edad: 'numeric',
  matricula: 'text',
  institucion: 'selector',
  carrera: 'selector',
  fechaNacimiento: 'date',
  genero: 'selector',
  direccion: 'text'
};

// Configuración de modales
export const modalConfig = {
  institution: {
    title: 'Seleccionar Institución Educativa',
    height: 400
  },
  career: {
    title: 'Carreras Disponibles',
    height: 400
  },
  gender: {
    title: 'Seleccionar Género',
    height: 'auto'
  },
  date: {
    title: 'Seleccionar Fecha de Nacimiento',
    height: 'auto'
  },
  customInstitution: {
    title: 'Institución Personalizada',
    subtitle: 'Ingresa el nombre de tu institución educativa:'
  },
  customCareer: {
    title: 'Carrera Personalizada',
    subtitle: 'Ingresa el nombre de tu carrera o programa académico:'
  }
};

// Configuración de botones
export const buttonConfig = {
  save: {
    text: 'Guardar y Continuar',
    loadingText: 'Guardando información...'
  },
  skip: {
    text: 'Omitir por ahora'
  },
  cancel: {
    text: 'Cancelar'
  },
  confirm: {
    text: 'Confirmar'
  }
};

// Mensajes del sistema
export const systemMessages = {
  selectInstitutionFirst: 'Primero selecciona una institución para ver las carreras disponibles.',
  requiredFieldsNote: '* Campos obligatorios\nPuedes completar esta información más tarde desde tu perfil',
  profileSaved: 'Perfil guardado exitosamente',
  profileError: 'No se pudo guardar la información. Intenta nuevamente.'
};
