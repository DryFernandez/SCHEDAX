// data/institutionsData.js
// Base de datos de instituciones educativas de República Dominicana

export const institutionCategories = {
  'Universidades Públicas': [
    'Universidad Autónoma de Santo Domingo (UASD)'
  ],
  'Universidades Privadas': [
    'Pontificia Universidad Católica Madre y Maestra (PUCMM)',
    'Universidad Nacional Pedro Henríquez Ureña (UNPHU)',
    'Universidad Tecnológica de Santiago (UTESA)',
    'Universidad Dominicana O&M',
    'Universidad Iberoamericana (UNIBE)',
    'Universidad APEC',
    'Universidad Católica del Cibao (UCATECI)',
    'Universidad Católica Nordestana (UCNE)',
    'Universidad Eugenio María de Hostos (UNIREMHOS)',
    'Universidad del Caribe (UNICARIBE)',
    'Universidad Católica Santo Domingo (UCSD)',
    'Universidad Experimental Félix Adam (UNEFA)',
    'Universidad Federico Henríquez y Carvajal (UFHEC)'
  ],
  'Institutos Técnicos y Especializados': [
    'Instituto Tecnológico de las Américas (ITLA)',
    'Instituto Politécnico Loyola'
  ],
  'Otras Opciones': [
    'Otra institución...'
  ]
};

// Mapeo completo de carreras por institución
export const careersByInstitution = {
  'Universidad Autónoma de Santo Domingo (UASD)': [
    'Derecho', 
    'Educación (Lengua Española)', 
    'Educación (Matemática)', 
    'Educación (Historia y Geografía)', 
    'Educación (Biología y Química)', 
    'Educación (Física)', 
    'Educación (Filosofía)', 
    'Educación (Inicial)',
    'Medicina', 
    'Odontología', 
    'Bioanálisis', 
    'Enfermería', 
    'Farmacia', 
    'Psicología',
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Ingeniería Eléctrica', 
    'Ingeniería Química', 
    'Ingeniería de Sistemas', 
    'Ingeniería Mecánica', 
    'Arquitectura', 
    'Agronomía', 
    'Veterinaria',
    'Física', 
    'Química', 
    'Biología', 
    'Matemática', 
    'Estadística',
    'Sociología', 
    'Ciencias Políticas', 
    'Comunicación Social', 
    'Economía', 
    'Contabilidad', 
    'Administración de Empresas'
  ],
  'Pontificia Universidad Católica Madre y Maestra (PUCMM)': [
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Ingeniería Eléctrica', 
    'Ingeniería Telemática', 
    'Ingeniería de Sistemas',
    'Arquitectura', 
    'Derecho', 
    'Psicología', 
    'Educación', 
    'Administración de Empresas', 
    'Mercadeo', 
    'Negocios Internacionales', 
    'Comunicación Social', 
    'Medicina', 
    'Odontología', 
    'Enfermería', 
    'Nutrición'
  ],
  'Universidad Nacional Pedro Henríquez Ureña (UNPHU)': [
    'Arquitectura', 
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Ingeniería Eléctrica', 
    'Ingeniería Química', 
    'Ingeniería de Sistemas', 
    'Medicina', 
    'Odontología', 
    'Farmacia', 
    'Bioanálisis', 
    'Educación', 
    'Psicología', 
    'Veterinaria', 
    'Producción Animal', 
    'Administración de Empresas', 
    'Mercadeo', 
    'Turismo', 
    'Contabilidad', 
    'Derecho'
  ],
  'Universidad Tecnológica de Santiago (UTESA)': [
    'Medicina', 
    'Odontología', 
    'Bioanálisis', 
    'Enfermería', 
    'Psicología', 
    'Educación', 
    'Contabilidad', 
    'Administración de Empresas', 
    'Mercadeo', 
    'Derecho', 
    'Arquitectura', 
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Ingeniería de Sistemas', 
    'Ingeniería Eléctrica', 
    'Ingeniería Mecánica', 
    'Comunicación Social'
  ],
  'Universidad Dominicana O&M': [
    'Administración de Empresas', 
    'Contabilidad', 
    'Mercadeo', 
    'Derecho', 
    'Educación', 
    'Psicología', 
    'Turismo y Hotelería', 
    'Ingeniería de Sistemas', 
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Ingeniería Eléctrica', 
    'Comunicación Social'
  ],
  'Universidad Iberoamericana (UNIBE)': [
    'Medicina', 
    'Odontología', 
    'Psicología', 
    'Bioanálisis', 
    'Derecho', 
    'Negocios Internacionales', 
    'Mercadeo', 
    'Administración de Empresas', 
    'Arquitectura', 
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Hotelería y Turismo', 
    'Diseño de Interiores', 
    'Comunicación Publicitaria'
  ],
  'Universidad APEC': [
    'Administración de Empresas', 
    'Contabilidad', 
    'Finanzas', 
    'Mercadeo', 
    'Negocios Internacionales', 
    'Ingeniería de Sistemas', 
    'Ingeniería Industrial', 
    'Ingeniería Civil', 
    'Arquitectura', 
    'Derecho', 
    'Diseño Gráfico', 
    'Psicología', 
    'Comunicación Social', 
    'Educación', 
    'Turismo'
  ],
  'Universidad Católica del Cibao (UCATECI)': [
    'Educación', 
    'Administración de Empresas', 
    'Contabilidad', 
    'Derecho', 
    'Ingeniería Civil', 
    'Ingeniería de Sistemas', 
    'Psicología', 
    'Enfermería', 
    'Agronomía', 
    'Hotelería y Turismo'
  ],
  'Universidad Católica Nordestana (UCNE)': [
    'Medicina', 
    'Derecho', 
    'Psicología', 
    'Contabilidad', 
    'Administración de Empresas', 
    'Educación', 
    'Bioanálisis', 
    'Ingeniería Civil', 
    'Ingeniería Industrial', 
    'Arquitectura', 
    'Comunicación Social'
  ],
  'Universidad Eugenio María de Hostos (UNIREMHOS)': [
    'Medicina', 
    'Derecho', 
    'Contabilidad', 
    'Administración de Empresas', 
    'Psicología', 
    'Educación', 
    'Ingeniería de Sistemas', 
    'Turismo y Hotelería'
  ],
  'Universidad del Caribe (UNICARIBE)': [
    'Derecho', 
    'Administración de Empresas', 
    'Contabilidad', 
    'Mercadeo', 
    'Educación', 
    'Psicología', 
    'Ingeniería Industrial', 
    'Ingeniería de Sistemas', 
    'Hotelería y Turismo'
  ],
  'Universidad Católica Santo Domingo (UCSD)': [
    'Derecho', 
    'Educación', 
    'Psicología', 
    'Administración de Empresas', 
    'Contabilidad', 
    'Mercadeo', 
    'Ingeniería de Sistemas', 
    'Arquitectura', 
    'Comunicación Social', 
    'Hotelería y Turismo'
  ],
  'Universidad Experimental Félix Adam (UNEFA)': [
    'Derecho', 
    'Administración de Empresas', 
    'Contabilidad', 
    'Mercadeo', 
    'Educación', 
    'Psicología', 
    'Ingeniería Industrial', 
    'Ingeniería de Sistemas', 
    'Hotelería y Turismo'
  ],
  'Universidad Federico Henríquez y Carvajal (UFHEC)': [
    'Medicina', 
    'Odontología', 
    'Derecho', 
    'Administración de Empresas', 
    'Contabilidad', 
    'Educación', 
    'Psicología', 
    'Bioanálisis', 
    'Ingeniería Civil', 
    'Ingeniería de Sistemas', 
    'Ingeniería Industrial', 
    'Enfermería'
  ],
  'Instituto Tecnológico de las Américas (ITLA)': [
    'Tecnólogo en Desarrollo de Software', 
    'Tecnólogo en Redes de Información', 
    'Tecnólogo en Seguridad Informática',
    'Tecnólogo en Multimedia', 
    'Tecnólogo en Sonido', 
    'Tecnólogo en Mecatrónica', 
    'Tecnólogo en Diseño Industrial',
    'Tecnólogo en Manufactura Automatizada', 
    'Tecnólogo en Telecomunicaciones', 
    'Tecnólogo en Inteligencia Artificial',
    'Tecnólogo en Analítica de Datos', 
    'Tecnólogo en Energías Renovables'
  ],
  'Instituto Politécnico Loyola': [
    'Ingeniería Industrial', 
    'Ingeniería Eléctrica', 
    'Ingeniería en Redes y Telecomunicaciones', 
    'Ingeniería en Mecatrónica', 
    'Administración Empresarial', 
    'Educación Técnico-Profesional',
    'Técnico en Electrónica', 
    'Técnico en Mecánica Industrial', 
    'Técnico en Informática'
  ]
};

// Función helper para obtener todas las instituciones como array plano
export const getAllInstitutions = () => {
  return Object.values(institutionCategories).flat();
};

// Función helper para obtener el tipo de institución
export const getInstitutionType = (institution) => {
  for (const [category, institutions] of Object.entries(institutionCategories)) {
    if (institutions.includes(institution)) {
      return category;
    }
  }
  return 'Desconocido';
};

// Función helper para verificar si una institución tiene carreras predefinidas
export const hasPreDefinedCareers = (institution) => {
  return careersByInstitution.hasOwnProperty(institution);
};
