export interface BlogPost {
  title: string;
  date: string;
  description: string;
  tags: string[];
  content: string;
  slug?: string; // Will be generated from title
}

export const blogPosts: BlogPost[] = [
  {
    title: "Enclaves hipercodificados de la tecnocracia transnacional",
    date: "2021-10-01",
    description:
      "Enclaves is a collection of short stories and essays exploring the intersection of technology, society, and the human condition.",
    tags: ["enclaves", "technology", "society", "human condition"],
    content: `
  # Enclaves hipercodificados de la tecnocracia transnacional
  
  En la intersección entre la tecnología avanzada y las estructuras de poder global, emergen espacios que podríamos denominar "enclaves hipercodificados" - zonas donde la realidad está mediada por capas superpuestas de código, algoritmos y sistemas de control que operan más allá del entendimiento común.
  
  ## La nueva geografía del poder
  
  Estos enclaves no son simplemente físicos, aunque a menudo tienen manifestaciones materiales en forma de campus corporativos, centros de datos o zonas económicas especiales. Son, ante todo, construcciones socio-técnicas que redefinen la geografía del poder global.
  
  La tecnocracia transnacional opera a través de estos enclaves, estableciendo jurisdicciones paralelas donde las reglas tradicionales del Estado-nación se diluyen frente a protocolos técnicos y acuerdos corporativos. El código se convierte en ley, pero una ley ilegible para la mayoría.
  
  ## Hipercodificación como estrategia
  
  La hipercodificación no es accidental sino estratégica. La complejidad técnica sirve como barrera de entrada y como mecanismo de exclusión. Solo aquellos con el capital cultural, educativo y económico necesario pueden participar plenamente en estos espacios.
  
  Mientras tanto, para la mayoría, estos sistemas aparecen como "cajas negras" - infraestructuras que median nuestra realidad cotidiana pero cuyos mecanismos internos permanecen opacos e inescrutables.
  
  ## Resistencias y alternativas
  
  Frente a esta realidad, emergen movimientos que buscan descodificar estos espacios, hacerlos legibles y democráticos. Desde iniciativas de código abierto hasta movimientos por la soberanía tecnológica, estas resistencias proponen formas alternativas de construir y habitar los espacios tecnológicos.
  
  La pregunta central es si podemos imaginar y construir enclaves tecnológicos que, en lugar de reforzar jerarquías existentes, sirvan como laboratorios para nuevas formas de organización social más equitativas y sostenibles.
      `,
  },
  {
    title:
      "IA y Autopoiesis Neocibernética: Disrupción Tecnogenómica y Neofeudalismo Informático en la Periferia Latinoamericana",
    date: "2021-10-01",
    description:
      "Un análisis crítico de la intersección entre la inteligencia artificial, la teoría de sistemas y la geopolítica en el contexto de la periferia latinoamericana.",
    tags: ["IA", "autopoiesis", "neofeudalismo", "Latinoamérica", "ciberpunk"],
    content: `
  # IA y Autopoiesis Neocibernética: Disrupción Tecnogenómica y Neofeudalismo Informático en la Periferia Latinoamericana
  
  ## Introducción: La colonialidad algorítmica
  
  En el contexto de una modernidad tardía caracterizada por la aceleración tecnológica, América Latina enfrenta una nueva fase de subordinación geopolítica mediada por sistemas algorítmicos y arquitecturas digitales diseñadas en los centros de poder global. Esta dinámica, que podríamos denominar "colonialidad algorítmica", reconfigura las relaciones centro-periferia a través de infraestructuras digitales que reproducen y amplifican asimetrías históricas.
  
  ## Autopoiesis neocibernética y extractivismo de datos
  
  La inteligencia artificial contemporánea, particularmente en su vertiente de aprendizaje profundo, opera bajo principios que podríamos caracterizar como una forma de autopoiesis neocibernética - sistemas que se auto-organizan y auto-reproducen a partir de la extracción masiva de datos. En el contexto latinoamericano, esta dinámica adquiere características particulares:
  
  1. **Extractivismo de datos**: Similar al extractivismo de recursos naturales, las poblaciones latinoamericanas se convierten en proveedoras de datos que alimentan sistemas de IA desarrollados y controlados desde el Norte global.
  
  2. **Asimetría epistémica**: Los modelos conceptuales y paradigmas que informan el desarrollo de estos sistemas raramente incorporan epistemologías y cosmovisiones latinoamericanas.
  
  3. **Dependencia tecnológica**: La región consume tecnologías de IA como productos terminados, sin participar significativamente en su diseño o en la definición de sus propósitos y valores.
  
  ## Disrupción tecnogenómica y reconfiguración biopolítica
  
  La convergencia entre IA, biotecnología y genómica (lo que podríamos llamar "tecnogenómica") está reconfigurando los mecanismos de control biopolítico. En América Latina, esta dinámica se manifiesta en:
  
  - Sistemas de vigilancia biométrica implementados sin marcos regulatorios adecuados
  - Experimentación biotecnológica con menor escrutinio ético que en el Norte global
  - Digitalización de la biodiversidad y del conocimiento tradicional asociado, generando nuevas formas de biopiratería algorítmica
  
  ## Neofeudalismo informático y fragmentación territorial
  
  El resultado de estas dinámicas es la emergencia de lo que podríamos caracterizar como un "neofeudalismo informático" - un régimen donde el acceso a recursos digitales y capacidades tecnológicas está estratificado según líneas que reproducen y amplifican desigualdades históricas. Este régimen se manifiesta territorialmente en:
  
  - Enclaves hiperconectados que funcionan como nodos en redes globales
  - Zonas de exclusión digital donde la precariedad tecnológica se suma a otras formas de marginación
  - Espacios híbridos donde tecnologías avanzadas coexisten con infraestructuras obsoletas
  
  ## Conclusión: Hacia una soberanía tecnológica latinoamericana
  
  Frente a este panorama, es urgente articular proyectos de soberanía tecnológica que permitan a América Latina participar en la definición de los futuros tecnológicos desde sus propias necesidades, valores y epistemologías. Esto implica:
  
  1. Desarrollar capacidades endógenas en IA y tecnologías convergentes
  2. Articular marcos regulatorios que protejan derechos digitales y biopolíticos
  3. Recuperar y actualizar tradiciones de pensamiento latinoamericano (como la teoría de la dependencia o la filosofía de la liberación) para abordar críticamente la cuestión tecnológica
  4. Construir alianzas Sur-Sur para desarrollar alternativas tecnológicas a los modelos dominantes
  
  La pregunta por la tecnología en América Latina no es meramente técnica sino profundamente política: ¿cómo construir futuros tecnológicos que no reproduzcan subordinaciones históricas sino que contribuyan a la emancipación social y epistémica de la región?
      `,
  },
  {
    title: "Los apuntes perdidos de Juan Franco de la Jara: el bosque como conspiración",
    date: "2021-09-01",
    description:
      "Un manuscrito inconcluso hallado en la Universidad de Talca revela una teoría radical sobre el monocultivo de pinos en la Araucanía: no es solo una estrategia económica, sino una guerra material contra las comunidades mapuches.",
    tags: [
      "bosque",
      "pino",
      "mapuche",
      "incendios",
      "territorio",
      "colonialismo",
      "capitalismo",
      "ecología",
      "memoria",
    ],
    content: `
  # Los apuntes perdidos de Juan Franco de la Jara: el bosque como conspiración
  
  ## Prólogo: El hallazgo
  
  En 2019, durante la renovación de la biblioteca de la Facultad de Ciencias Forestales de la Universidad de Talca, se encontró un manuscrito inconcluso en una caja de archivos olvidada. El texto, firmado por Juan Franco de la Jara, profesor de ecología política que desapareció misteriosamente en 1998, desarrolla una teoría radical sobre la expansión del monocultivo forestal en el sur de Chile.
  
  Lo que sigue es una transcripción parcial de estos apuntes, cuya publicación ha sido controvertida en círculos académicos y políticos.
  
  ## I. La guerra botánica
  
  *12 de marzo de 1998*
  
  La expansión del pino radiata y el eucalipto en territorio mapuche no puede entenderse únicamente como una estrategia económica. Es, ante todo, una forma de guerra material, una intervención deliberada en el ecosistema diseñada para transformar irreversiblemente el territorio y hacer imposible la vida mapuche tal como ha existido durante siglos.
  
  El monocultivo forestal opera como un agente de transformación territorial con múltiples dimensiones:
  
  1. **Dimensión hídrica**: Los pinos y eucaliptos consumen cantidades extraordinarias de agua, desecando napas subterráneas y cursos de agua superficiales. Esto hace inviable la agricultura tradicional mapuche y fuerza el desplazamiento de comunidades enteras.
  
  2. **Dimensión química**: La acidificación del suelo producida por estas especies altera irreversiblemente la composición química de la tierra, impidiendo el crecimiento de especies nativas y cultivos tradicionales.
  
  3. **Dimensión cultural**: El bosque nativo es un espacio cargado de significado cultural y espiritual para el pueblo mapuche. Su reemplazo por plantaciones monoespecíficas representa una forma de epistemicidio - la destrucción de formas de conocimiento y relación con el territorio.
  
  ## II. La arquitectura del desastre
  
  *17 de marzo de 1998*
  
  Los incendios forestales que periódicamente devastan la región no son simplemente accidentes o consecuencias no intencionadas. Son parte integral del diseño del sistema forestal:
  
  - Las plantaciones están diseñadas para ser altamente inflamables, con árboles plantados en alta densidad y sin cortafuegos adecuados
  - La legislación forestal ha creado incentivos perversos que hacen más rentable la pérdida por incendio que la cosecha sostenible
  - Los sistemas de prevención y combate de incendios están sistemáticamente subfinanciados
  
  Esta arquitectura del desastre no es accidental sino funcional a un proceso de acumulación por desposesión que opera a través de ciclos de destrucción y reconstrucción del paisaje forestal.
  
  ## III. La conspiración del silencio
  
  *23 de marzo de 1998*
  
  Lo más perturbador de esta situación es la conspiración de silencio que la rodea. La academia forestal, los medios de comunicación y la clase política han construido un relato que naturaliza esta transformación territorial como "progreso" o "desarrollo", invisibilizando sus dimensiones políticas y sus consecuencias para las comunidades.
  
  Mi investigación sobre los vínculos entre grupos económicos forestales, centros de investigación y agencias estatales ha revelado redes de influencia que...
  
  [El manuscrito se interrumpe aquí. Las páginas siguientes fueron arrancadas o perdidas. Juan Franco de la Jara fue visto por última vez saliendo de su oficina el 24 de marzo de 1998. Su desaparición nunca fue esclarecida.]
      `,
  },
];
