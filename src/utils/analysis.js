import { NIVELES } from "../data/mockData";

export const calcularResultados = (respuestas, preguntasDePrueba) => {
  let correctasGlobal = 0;
  const totalPreguntas = preguntasDePrueba.length;

  const porCompetencia = {};
  const porArea = {};

  preguntasDePrueba.forEach(p => {
    const esCorrecta = respuestas[p.id] === p.respuestaCorrecta;
    if (esCorrecta) {
      correctasGlobal++;
    }

    // Por Competencia
    if (!porCompetencia[p.competencia]) {
      porCompetencia[p.competencia] = { correctas: 0, total: 0 };
    }
    porCompetencia[p.competencia].total++;
    if (esCorrecta) porCompetencia[p.competencia].correctas++;

    // Por Área (Componente)
    if (!porArea[p.area]) {
      porArea[p.area] = { correctas: 0, total: 0 };
    }
    porArea[p.area].total++;
    if (esCorrecta) porArea[p.area].correctas++;
  });

  const compsFlattened = {};
  Object.entries(porCompetencia).forEach(([name, stats]) => {
    compsFlattened[name] = Math.round((stats.correctas / stats.total) * 100);
  });

  const componentsFlattened = {};
  Object.entries(porArea).forEach(([name, stats]) => {
    componentsFlattened[name] = Math.round((stats.correctas / stats.total) * 100);
  });

  const puntajeGlobal = Math.round((correctasGlobal / totalPreguntas) * 100);
  
  let nivel = { label: 'Bajo', bg: 'bg-rose-500/10', color: 'text-rose-500' };
  if (puntajeGlobal >= 80) nivel = { label: 'Avanzado', bg: 'bg-emerald-500/10', color: 'text-emerald-500' };
  else if (puntajeGlobal >= 60) nivel = { label: 'Satisfactorio', bg: 'bg-indigo-500/10', color: 'text-indigo-500' };
  else if (puntajeGlobal >= 40) nivel = { label: 'Mínimo', bg: 'bg-amber-500/10', color: 'text-amber-500' };

  return {
    puntajeGlobal,
    correctas: correctasGlobal,
    incorrectas: totalPreguntas - correctasGlobal,
    totalPreguntas,
    nivel,
    competencias: compsFlattened,
    componentes: componentsFlattened,
    respuestas: preguntasDePrueba.map(p => ({
      preguntaId: p.id,
      enunciado: p.enunciado,
      imagen: p.imagen,
      respuestaSeleccionada: respuestas[p.id],
      respuestaCorrecta: p.respuestaCorrecta,
      esCorrecta: respuestas[p.id] === p.respuestaCorrecta,
      competencia: p.competencia,
      componente: p.competencia === 'Interpretación y representación' ? 'Estadística' : (p.competencia === 'Formulación y ejecución' ? 'Geometría' : 'Álgebra y cálculo')
    }))
  };
};

export const generarRecomendaciones = (resultados) => {
  const recomendaciones = [];

  // Competencia con menor desempeño
  const competencias = Object.entries(resultados.porCompetencia).map(([nombre, stats]) => ({
    nombre,
    porcentaje: (stats.correctas / stats.total) * 100
  }));
  
  const minComp = Math.min(...competencias.map(c => c.porcentaje));
  const masBajasComp = competencias.filter(c => c.porcentaje === minComp);

  if (minComp < 60) {
    if (masBajasComp.length === 1) {
      recomendaciones.push(`Se recomienda fortalecer especialmente la competencia de ${masBajasComp[0].nombre}, en la cual obtuviste un desempeño menor. Practica lectura de gráficas y justificación de procedimientos.`);
    } else {
      recomendaciones.push(`Las competencias con menor porcentaje son ${masBajasComp.map(c => c.nombre).join(' y ')}. Se recomienda fortalecer estas áreas practicando validación de afirmaciones y análisis de datos.`);
    }
  }

  // Área con menor desempeño
  const areas = Object.entries(resultados.porArea).map(([nombre, stats]) => ({
    nombre,
    porcentaje: (stats.correctas / stats.total) * 100
  }));

  const minArea = Math.min(...areas.map(a => a.porcentaje));
  const masBajasArea = areas.filter(a => a.porcentaje === minArea);

  if (minArea < 60) {
    masBajasArea.forEach(a => {
      if (a.nombre === "Estadística") {
        recomendaciones.push("En el área de Estadística, practica la lectura e interpretación de tablas, porcentajes, promedios y probabilidad básica.");
      } else if (a.nombre === "Geometría") {
        recomendaciones.push("En el área de Geometría, fortalece el trabajo con figuras planas y cuerpos geométricos, perímetros y sistemas de coordenadas.");
      } else {
        recomendaciones.push("En el área de Álgebra y cálculo, practica operaciones con números racionales, ecuaciones y relaciones de cambio.");
      }
    });
  }

  return recomendaciones;
};
