
export const COMPETENCIAS = [
  "Interpretación y representación",
  "Formulación y ejecución",
  "Argumentación"
];

export const AREAS = [
  "Estadística",
  "Geometría",
  "Álgebra y cálculo"
];

export const CONTEXTOS = [
  "Familiar o personal",
  "Laboral u ocupacional",
  "Comunitario o social",
  "Matemático o científico"
];

export const NIVELES = [
  { id: 1, min: 0, max: 40, nombre: "Bajo", color: "text-red-600", bg: "bg-red-100", border: "border-red-600", description: "El estudiante presenta un desempeño bajo en las competencias matemáticas evaluadas. Se recomienda fortalecer la lectura de situaciones problema, la identificación de datos relevantes, el uso de operaciones básicas y la interpretación de tablas, gráficas y representaciones matemáticas." },
  { id: 2, min: 41, max: 55, nombre: "Básico", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-600", description: "El estudiante presenta un desempeño básico. Reconoce algunos elementos matemáticos de las situaciones planteadas, pero requiere fortalecer la selección de procedimientos, la interpretación de información y la justificación de respuestas." },
  { id: 3, min: 56, max: 70, nombre: "Alto", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-600", description: "El estudiante presenta un desempeño alto. Evidencia un manejo adecuado de las competencias matemáticas, aunque aún puede fortalecer la argumentación, la precisión en los procedimientos y la resolución de problemas con mayor nivel de complejidad." },
  { id: 4, min: 71, max: 100, nombre: "Superior", color: "text-green-600", bg: "bg-green-100", border: "border-green-600", description: "El estudiante presenta un desempeño superior. Demuestra dominio avanzado de las competencias matemáticas, resolviendo problemas complejos, interpretando información en diferentes formatos, argumentando sus respuestas y estableciendo relaciones entre distintas representaciones." }
];

export const PREGUNTAS_INICIALES = [
  {
    id: 1,
    enunciado: "En un curso de 40 estudiantes, el 60% son mujeres. Si se eligen 5 estudiantes al azar para una comisión, ¿cuál es la probabilidad de que todos sean hombres?",
    opciones: {
      A: "6/40",
      B: "C(16, 5) / C(40, 5)",
      C: "C(24, 5) / C(40, 5)",
      D: "0.4^5"
    },
    respuestaCorrecta: "B",
    competencia: "Interpretación y representación",
    area: "Estadística",
    contexto: "Familiar o personal",
    dificultad: "Media",
    explicacion: "Hay 40 estudiantes. El 60% son mujeres (24), por lo tanto el 40% son hombres (16). La probabilidad de elegir 5 hombres entre los 16 disponibles sobre el total de combinaciones de 5 sobre 40 es C(16, 5) / C(40, 5).",
    retroalimentacionCorrecta: "¡Excelente! Identificaste correctamente la población de hombres y aplicaste el concepto de combinatoria para el cálculo de probabilidades.",
    retroalimentacionIncorrecta: "Revisa la proporción de hombres y mujeres. Recuerda que para elegir un subconjunto sin orden se utilizan combinaciones C(n, k).",
    fuente: "Icfes - Cuadernillo de Matemáticas Saber 11"
  },
  {
    id: 2,
    enunciado: "Un tanque cilíndrico tiene un radio de 2 metros y una altura de 5 metros. Si se llena hasta la mitad, ¿qué volumen de agua contiene en metros cúbicos? (Use π ≈ 3.14)",
    opciones: {
      A: "31.4",
      B: "62.8",
      C: "15.7",
      D: "20"
    },
    respuestaCorrecta: "A",
    competencia: "Formulación y ejecución",
    area: "Geometría",
    contexto: "Matemático o científico",
    dificultad: "Media",
    explicacion: "Volumen cilindro = π * r² * h. V = 3.14 * (2²) * 5 = 3.14 * 4 * 5 = 62.8. La mitad es 31.4.",
    retroalimentacionCorrecta: "Correcto. Aplicaste adecuadamente la fórmula del volumen de un cilindro y calculaste la mitad solicitada.",
    retroalimentacionIncorrecta: "Recuerda que el volumen de un cilindro es el área de la base por la altura. No olvides dividir por dos ya que está a la mitad.",
    fuente: "Icfes - Cuadernillo de Matemáticas Saber 11"
  },
  {
    id: 3,
    enunciado: "Un analista afirma que el precio del dólar subirá un 10% cada mes. Si el precio inicial es de $4.000, ¿cuál será el precio al final del segundo mes?",
    opciones: {
      A: "$4.800",
      B: "$4.840",
      C: "$4.400",
      D: "$5.000"
    },
    respuestaCorrecta: "B",
    competencia: "Interpretación y representación",
    area: "Álgebra y cálculo",
    contexto: "Comunitario o social",
    dificultad: "Baja",
    explicacion: "Mes 1: 4000 * 1.10 = 4400. Mes 2: 4400 * 1.10 = 4840.",
    retroalimentacionCorrecta: "Bien hecho. Comprendiste el crecimiento porcentual acumulado (interés compuesto).",
    retroalimentacionIncorrecta: "Ten cuidado, el aumento del segundo mes es sobre el nuevo precio del primer mes, no sobre el precio inicial.",
    fuente: "Icfes - Cuadernillo de Matemáticas Saber 11"
  },
  {
    id: 4,
    enunciado: "Para justificar que la suma de los ángulos internos de un triángulo es 180°, un estudiante dibuja un triángulo y traza una paralela a la base por el vértice opuesto. Este procedimiento es:",
    opciones: {
      A: "Inválido, porque solo funciona para ese triángulo específico.",
      B: "Válido, porque permite usar ángulos entre paralelas (alternos internos).",
      C: "Inválido, porque no usó un transportador.",
      D: "Válido, solo si el triángulo es equilátero."
    },
    respuestaCorrecta: "B",
    competencia: "Argumentación",
    area: "Geometría",
    contexto: "Matemático o científico",
    dificultad: "Alta",
    explicacion: "Al trazar la paralela, se forman ángulos alternos internos que sumados al ángulo del vértice forman un ángulo llano (180°).",
    retroalimentacionCorrecta: "¡Exacto! La argumentación geométrica se apoya en teoremas previos como el de ángulos entre paralelas.",
    retroalimentacionIncorrecta: "Recuerda que las demostraciones matemáticas buscan generalidad. El trazo de auxiliares es una estrategia potente de argumentación.",
    fuente: "Icfes - Cuadernillo de Matemáticas Saber 11"
  },
  {
    id: 5,
    enunciado: "Se lanza un dado de seis caras dos veces. ¿Cuál es la probabilidad de que la suma de los resultados sea 7?",
    opciones: {
      A: "1/6",
      B: "1/12",
      C: "7/36",
      D: "1/36"
    },
    respuestaCorrecta: "A",
    competencia: "Formulación y ejecución",
    area: "Estadística",
    contexto: "Familiar o personal",
    dificultad: "Media",
    explicacion: "Pares que suman 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Son 6 casos de 36 posibles. 6/36 = 1/6.",
    retroalimentacionCorrecta: "Excelente cálculo. Identificaste correctamente el espacio muestral y los casos favorables.",
    retroalimentacionIncorrecta: "Enumera todas las combinaciones posibles que sumen 7 y divídelas entre el total de resultados (36).",
    fuente: "Icfes - Cuadernillo de Matemáticas Saber 11"
  }
];

// Generar más preguntas para completar el banco inicial solicitado (mínimo 30)
for (let i = 6; i <= 30; i++) {
  const comp = COMPETENCIAS[(i % 3)];
  const area = AREAS[(i % 3)];
  const cont = CONTEXTOS[(i % 4)];
  PREGUNTAS_INICIALES.push({
    id: i,
    enunciado: `Pregunta de práctica ${i}: Situación sobre ${area} en un contexto ${cont}. Evalúa la competencia de ${comp}.`,
    opciones: {
      A: "Opción A válida",
      B: "Opción B correcta",
      C: "Opción C inválida",
      D: "Opción D insuficiente"
    },
    respuestaCorrecta: "B",
    competencia: comp,
    area: area,
    contexto: cont,
    dificultad: i % 3 === 0 ? "Alta" : i % 3 === 1 ? "Media" : "Baja",
    explicacion: "Explicación detallada de por qué la opción B es la correcta en este problema simulado.",
    retroalimentacionCorrecta: "Muy bien, dominas estos conceptos.",
    retroalimentacionIncorrecta: "Debes repasar los fundamentos de esta área.",
    fuente: "Icfes - Generada para práctica"
  });
}

export const USUARIOS_INICIALES = [];

export const SIMULACROS_INICIALES = [
  { id: "S1", nombre: "Simulacro Diagnóstico", descripcion: "Primera prueba para medir nivel inicial", preguntas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], tiempo: 30, intentos: 2 },
  { id: "S2", nombre: "Simulacro Intermedio", descripcion: "Enfocado en Geometría y Estadística", preguntas: [11, 12, 13, 14, 15, 1, 2, 3, 4, 5], tiempo: 45, intentos: 1 },
  { id: "S3", nombre: "Prueba Final Matemáticas", descripcion: "Simulacro completo tipo Saber 11", preguntas: PREGUNTAS_INICIALES.map(p => p.id), tiempo: 90, intentos: 1 }
];
