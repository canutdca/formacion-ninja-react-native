import { CourseItemProps } from '@/components/CourseItem';

// Categorías de oposiciones
const CATEGORIES = [
  'Administración General del Estado',
  'Justicia',
  'Educación',
  'Sanidad',
  'Hacienda',
  'Policía Nacional',
  'Guardia Civil',
  'Instituciones Penitenciarias',
  'Ayuntamientos y Entidades Locales',
  'Comunidades Autónomas',
];

// Nombres de instructores ficticios
const INSTRUCTORS = [
  'María García',
  'Carlos Rodríguez',
  'Laura Martínez',
  'Javier López',
  'Ana Sánchez',
  'David Fernández',
  'Elena Gómez',
  'Pablo Díaz',
  'Cristina Hernández',
  'Miguel Torres',
];

// Duración de cursos
const DURATIONS = [
  '3:45',
  '5:20',
  '2:30',
  '4:15',
  '6:10',
  '1:55',
  '7:40',
  '2:20',
  '3:05',
  '5:50',
];

// Visualizaciones
const VIEWS = [
  '1.2K',
  '3.5K',
  '987',
  '7.1K',
  '543',
  '12K',
  '2.3K',
  '5.6K',
  '890',
  '4.7K',
];

// Títulos de cursos de oposiciones
const COURSE_TITLES = [
  'Temario Completo Auxiliar Administrativo',
  'Preparación Examen Guardia Civil',
  'Psicotécnicos para Policía Nacional',
  'Casos Prácticos Enfermería SACYL',
  'Temario Maestros Educación Primaria',
  'Oposiciones Técnico de Hacienda',
  'Pruebas Físicas Bombero',
  'Temas Jurídicos Oposición Judicatura',
  'Preparación Celador SAS',
  'Temario Técnico Superior Administración',
  'Derecho Constitucional para TAI',
  'Test Guardia Civil 2024',
  'Procedimiento Administrativo Común',
  'Supuestos Prácticos Trabajo Social',
  'Derecho Penal para Instituciones Penitenciarias',
  'Idiomas para Cuerpo Diplomático',
  'Preparación Guardia Urbana Barcelona',
  'Temario Oposiciones Correos',
  'Casos Prácticos Administrativo de la Seguridad Social',
  'Pruebas Físicas Policía Local',
];

// Generar las miniaturas con Picsum para tener imágenes aleatorias
function generateThumbnail(id: string): string {
  return `https://picsum.photos/id/${id.split('_')[1]}/320/180`;
}

// Generar 100 cursos aleatorios
export const COURSES_DATA: CourseItemProps[] = Array.from({ length: 100 }, (_, index) => {
  const id = `course_${index + 1}`;
  return {
    id,
    title: COURSE_TITLES[index % COURSE_TITLES.length] + ` (Edición ${Math.floor(index / 20) + 1})`,
    category: CATEGORIES[index % CATEGORIES.length],
    instructor: INSTRUCTORS[index % INSTRUCTORS.length],
    duration: DURATIONS[index % DURATIONS.length],
    thumbnail: generateThumbnail(id),
    viewCount: VIEWS[index % VIEWS.length],
  };
});
