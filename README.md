# Prueba Técnica: Motor de Búsqueda y Filtrado Avanzado

## Enunciado
### Objetivo

En esta prueba técnica, se te presenta una aplicación de React Native con Expo que muestra un listado de cursos de oposiciones en España. La aplicación funciona, pero necesita la implementación de un motor de búsqueda avanzado en la pestaña "Explorar". El objetivo es evaluar tus habilidades en arquitectura de software, algoritmos de búsqueda, manejo de estructuras de datos complejas y optimización de JavaScript.

### Tiempo estimado

Esta prueba está diseñada para completarse en un máximo de 5-8 horas.

### Contexto

La aplicación es una plataforma educativa que ofrece cursos para preparar oposiciones. La pantalla principal muestra un listado de aproximadamente 100 cursos disponibles, y necesitamos un sistema de búsqueda y filtrado potente para que los usuarios puedan encontrar rápidamente lo que necesitan.

### Requisitos Principales

Debes implementar un motor de búsqueda que cumpla con las siguientes características:

1. **Búsqueda por texto con indexación eficiente**
   - Implementar un sistema de indexación que permita búsquedas rápidas
   - Soportar búsqueda por título, categoría e instructor de los cursos
   - Optimizar el rendimiento para grandes conjuntos de datos (>1000 cursos)

2. **Filtros múltiples y combinados**
   - Permitir filtrar por categorías (Administración, Justicia, Educación, etc.)
   - Permitir filtrar por duración (corta, media, larga)
   - Permitir filtrar por nivel de dificultad
   - Soportar la combinación de múltiples filtros (AND/OR)

3. **Búsqueda fuzzy y corrección de errores**
   - Implementar algoritmos que toleren errores ortográficos
   - Proporcionar sugerencias de búsqueda relevantes
   - Manejar variaciones de palabras (plurales, acentos, etc.)

4. **Optimización para búsquedas frecuentes**
   - Implementar alguna estrategia de caché para búsquedas recientes
   - Optimizar el rendimiento general del motor
   - Proporcionar una experiencia de usuario fluida

5. **Diseño visual**
   - Se valorará muy positivamente las mejoras en el diseño de la interfaz de usuario
   - Implementación de animaciones y transiciones fluidas
   - Atención al detalle y usabilidad de la interfaz

### Problemas conocidos que deben resolverse

La aplicación presenta varios problemas que debes solucionar:

1. El scrolling es lento y presenta "jank" (saltos o interrupciones).
2. La carga inicial de la aplicación es demasiado lenta.
3. La memoria utilizada por la aplicación es excesiva, provocando cierres inesperados en algunos dispositivos.

### Estructura del Código

Se pide implementar la solución utilizando la pestaña "Explore" de la aplicación existente, integrando los siguientes elementos:

- **Interfaz de usuario**: Implementar campo de búsqueda, filtros y visualización de resultados
- **Motor de búsqueda**: Crear la lógica necesaria para indexar y buscar cursos
- **Gestión de estado**: Manejar el estado de búsqueda, filtros y resultados

### Tareas

1. **Analiza el código existente e identifica los problemas específicos** que causan el bajo rendimiento.
2. **Implementa soluciones** para los problemas identificados, manteniendo o mejorando la experiencia de usuario actual.
3. **Documenta tus cambios** explicando:
   - Qué problemas identificaste.
   - Qué soluciones implementaste y por qué.
   - Qué mejoras adicionales propondrías si tuvieras más tiempo.

### Criterios de Evaluación

Tu solución será evaluada en base a:

1. **Arquitectura de Software**: Diseño del sistema, separación de responsabilidades, patrones utilizados
2. **Algoritmos y Estructuras de Datos**: Eficiencia de los algoritmos, estructuras de datos apropiadas
3. **Optimización**: Rendimiento del motor de búsqueda, uso eficiente de memoria y CPU
4. **Calidad del Código**: Legibilidad, mantenibilidad, reutilización
5. **Experiencia de Usuario**: Fluidez y rapidez en la interfaz

### Consideraciones importantes

- No es necesario añadir funcionalidades nuevas además de las especificadas, solo optimizar el rendimiento y desarrollar el motor de búsqueda.
- Asegúrate de que tus soluciones funcionen tanto en iOS como en Android.
- La calidad del código y su mantenibilidad son tan importantes como las soluciones técnicas.
- No cambies radicalmente el aspecto visual de la aplicación a menos que sea para mejorar la experiencia del usuario.
- Se valorará más un diseño sólido y bien explicado que una implementación 100% funcional de todas las características.
- Prioriza la calidad sobre la cantidad: es mejor implementar menos características pero de forma óptima.
- Explica claramente los trade-offs considerados en tu solución.

### Entrega

Al finalizar, debes entregar:

1. El código fuente completo de la aplicación con tus soluciones.
2. Un documento breve explicando los problemas que encontraste y las soluciones implementadas.

### Para ejecutar la aplicación

```bash
# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

¡Buena suerte!

## Resolución

### Tareas realizadas:
1. Preparar vscode para poder trabajar correctamente con eslint.
2. Organizar mejor la caja de búsqueda y los filtros:
   - Añadir los iconos que no se están viendo
   - Que estén alineados horitonzalmente
   - Que el FilterPanel sea un modal y se vean fácilmente todas las opciones y las marcadas.
   - Separación de funcionalidades por componentes: SearchSuggestions, LoadingScreen, FilterChips, FilterSection
3. Búsqueda:
   - Separación de responabilidades: separar el hook y la lógica de búsqueda
   - Creación de tests para verificar que se cumplen los requisitos pedidos
   - Optimización:
      - Cambiar el token actual de `doc.title + ' ' + doc.category + ' ' + doc.instructor` por un token para cada campo
      - Llamar solo tokenize() gracias a una caché para los tokens
      - Mejorar el rendimiento de levenshteinDistance() (computacionalmente costoso (O(mn) donde m y n son las longitudes de las strings) limitando el número de comparaciones, usando un algoritmo mas eficienete e implementando una caché para las distancias ya calculadas, búsqueda de coincidencias exactas antes de fuzzy e ordenamiento por similitud
      - Para la búsqueda fuzzy, aplicar filtros primero y luego buscar en los documentos filtrados
      - Hacer la conversión a minutos se hace al indexar los cursos.
   - Separación de responsabilidades para la búsqueda:
      - Searcher.ts -> Clase que contiene la lógica de búsqueda
         - SearcherFilter.ts -> Clase que contiene la lógica de filtrado
            - FilterStrategy.ts -> Interfaz que define la lógica de filtrado
               - CategoryFilterStrategy.ts -> Filtro por categoría
               - DurationFilterStrategy.ts -> Filtro por duración
               - LevelFilterStrategy.ts -> Filtro por nivel
         - SearcherText.ts -> Clase que contiene la lógica de búsqueda por texto
            - TextTokenizer.ts -> Clase que contiene la lógica de tokenización
            - FuzzyMatcher.ts -> Clase que contiene la lógica de búsqueda fuzzy
4. Organizar mejor los resultados de la búsqueda creando los componentes ListHeader y EmptyList
5. Arreglar la generación del Thumbnail de los cursos
6. Añadir Memo y debounce en los componentes de EmptyList y SearchSuggestions para quitar el efecto de flicking
7. Se han quitado todos los setTimeouts innecesarios que provocaban un delay en la carga de los cursos

### Tareas pendientes:
- Arreglar el flicking de que genera el FlatList de cursos
- Arreglar el flicking del tema oscuro al entrar en la app
- Usar mejor los colores: actualmente en algunos sitios usa los colores en los estilos hardcodeados y en otros usa el hook useThemeColor
- Cancelar búsquedas anteriores al hacer una nueva
- Coordinar los estilos del "explorer" y de la "home" (backgroundColor)
- Tanto la "home" como "explorer" usan los mismos cursos. Quizá se podría hacer que compartiesen la misma memoria del listado total de cursos usando un Contexto de React
