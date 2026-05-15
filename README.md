# Saber 11 Matemáticas Pro

Plataforma educativa profesional para la preparación y seguimiento de la prueba **ICFES Saber 11° - Matemáticas**.

## Tecnologías
- **React 19** con **Vite**
- **Tailwind CSS** para diseño responsivo
- **Recharts** para análisis visual de resultados
- **Lucide React** para iconografía
- **Framer Motion** para animaciones fluidas
- **LocalStorage** para persistencia de datos (versión inicial)

## Estructura de Competencias (ICFES)
1. **Interpretación y representación**: Comprensión y transformación de información en diferentes formatos.
2. **Formulación y ejecución**: Diseño y ejecución de estrategias para resolver problemas.
3. **Argumentación**: Justificación y validación de procedimientos y soluciones.

## Áreas de Contenido
- **Estadística**
- **Geometría**
- **Álgebra y cálculo**

## Usuarios de Prueba
| Rol | Email | Password |
| :--- | :--- | :--- |
| **Administrador** | `admin@saber11.edu` | `admin` |
| **Docente** | `juan@saber11.edu` | `user` |
| **Estudiante** | `andres@saber11.edu` | `user` |

## Instalación y Despliegue
1. Instalar dependencias: `npm install`
2. Ejecutar localmente: `npm run dev`
3. Construir para producción: `npm run build`
4. Desplegar en GitHub Pages:
   - Configurar `base` en `vite.config.ts` con el nombre del repo.
   - Ejecutar `npm run build` y subir la carpeta `dist`.

## Créditos
Fuente base de algunas preguntas:
*Icfes. (2026). Prueba Matemáticas, Cuadernillo de preguntas. Saber 11.º. Bogotá D. C.: Dirección de Evaluación, Icfes.*
Material usado exclusivamente con fines pedagógicos y preparatorios.
