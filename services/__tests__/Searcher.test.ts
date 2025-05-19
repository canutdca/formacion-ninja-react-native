import { CourseItemProps } from '@/components/CourseItem';
import { Filters } from '@/components/search/filters/FilterPanel';
import { Searcher } from '../Searcher';

describe('Searcher', () => {
  const mockCourses: CourseItemProps[] = [
    {
      id: '1',
      title: 'Introducción a la Administración Pública',
      category: 'Administración General del Estado',
      instructor: 'Juan Pérez',
      duration: '02:30',
      thumbnail: 'https://example.com/image1.jpg',
      viewCount: '1.2K',
    },
    {
      id: '2',
      title: 'Derecho Constitucional Avanzado',
      category: 'Justicia',
      instructor: 'María García',
      duration: '04:15',
      thumbnail: 'https://example.com/image2.jpg',
      viewCount: '3.5K',
    },
    {
      id: '3',
      title: 'Preparación Oposiciones Educación Básica',
      category: 'Educación',
      instructor: 'Carlos López',
      duration: '06:00',
      thumbnail: 'https://example.com/image3.jpg',
      viewCount: '2.1K',
    },
    {
      id: '4',
      title: 'Administración y Gestión Pública',
      category: 'Administración General del Estado',
      instructor: 'Ana Martínez',
      duration: '03:45',
      thumbnail: 'https://example.com/image4.jpg',
      viewCount: '2.8K',
    },
    {
      id: '5',
      title: 'Administración Local y Autonómica',
      category: 'Administración General del Estado',
      instructor: 'Pedro Sánchez',
      duration: '05:20',
      thumbnail: 'https://example.com/image5.jpg',
      viewCount: '1.9K',
    }
  ];

  let searcher: Searcher;

  beforeEach(() => {
    searcher = new Searcher(mockCourses);
  });

  describe('basic search', () => {
    it('should return all courses when there is no query or filters', () => {
      const results = searcher.search('', { categories: [], durations: [], levels: [] });
      expect(results).toHaveLength(5);
    });

    it('should find courses by exact title', () => {
      const results = searcher.search('Administración', { categories: [], durations: [], levels: [] });
      expect(results).toHaveLength(3);
      expect(results[0].title).toBe('Administración Local y Autonómica');
    });

    it('should find courses by title accent insensitive', () => {
      const results = searcher.search('preparacion', { categories: [], durations: [], levels: [] });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Preparación Oposiciones Educación Básica');
    });

    it('should find courses by category', () => {
      const results = searcher.search('Justicia', { categories: [], durations: [], levels: [] });
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Justicia');
    });

    it('should find courses by category case insensitive', () => {
      const results = searcher.search('administracion', { categories: [], durations: [], levels: [] });
      expect(results).toHaveLength(3);
      expect(results[0].category).toBe('Administración General del Estado');
    });

    it('should find courses by instructor', () => {
      const results = searcher.search('María', { categories: [], durations: [], levels: [] });
      expect(results.length).toBe(1);
      expect(results.map(r => r.instructor)).toContain('María García');
    });

    it('should find courses by instructor accent insensitive', () => {
      const results = searcher.search('maria', { categories: [], durations: [], levels: [] });
      expect(results.length).toBe(1);
      expect(results.map(r => r.instructor)).toContain('María García');
    });
  });

  describe('filters', () => {
    it('should filter by category', () => {
      const filters: Filters = {
        categories: ['administraci_n_general_del_estado'],
        durations: [],
        levels: [],
      };
      const results = searcher.search('', filters);
      expect(results).toHaveLength(3);
      expect(results[0].category).toBe('Administración General del Estado');
    });

    it('should filter by duration', () => {
      const filters: Filters = {
        categories: [],
        durations: ['short'],
        levels: [],
      };
      const results = searcher.search('', filters);
      expect(results).toHaveLength(1);
      expect(results[0].duration).toBe('02:30');
    });

    it('should filter by level', () => {
      const filters: Filters = {
        categories: [],
        durations: [],
        levels: ['beginner'],
      };
      const results = searcher.search('', filters);
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Introducción');
    });
  });

  describe('suggestions', () => {
    it('should return suggestions based on title', () => {
      const suggestions = searcher.getSuggestions('admin');
      expect(suggestions).toContain('Introducción a la Administración Pública');
      expect(suggestions).toContain('Administración y Gestión Pública');
      expect(suggestions).toContain('Administración Local y Autonómica');
    });

    it('should limit the number of suggestions', () => {
      const suggestions = searcher.getSuggestions('admin', 2);
      expect(suggestions).toHaveLength(2);
    });
  });

  describe('filter options', () => {
    it('should return all categories', () => {
      const categories = searcher.getCategories();
      expect(categories).toHaveLength(3);
      expect(categories.map(c => c.label)).toContain('Administración General del Estado');
    });

    it('should return all durations', () => {
      const durations = searcher.getDurations();
      expect(durations).toHaveLength(3);
      expect(durations.map(d => d.id)).toContain('short');
    });

    it('should return all levels', () => {
      const levels = searcher.getLevels();
      expect(levels).toHaveLength(3);
      expect(levels.map(l => l.id)).toContain('beginner');
    });
  });
});
