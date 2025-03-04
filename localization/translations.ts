export type TranslationKeys = {
  common: {
    dashboard: string
    search: string
    filter: string
    liveMonitoring: string
    lastUpdated: string
    disclaimer: string
    viewMore: string
    skynetProbability: string
    globalImpact: string
    views: string
    criticalRiskFactors: string
    recentIncidents: string
  }
  header: {
    title: string
    subtitle: string
  }
  tabs: {
    trends: string
    news: string
    analysis: string
  }
  timeframes: {
    oneMonth: string
    sixMonths: string
    oneYear: string
    fiveYears: string
  }
  charts: {
    computationalPower: {
      title: string
      description: string
      tooltip: string
    }
    neuralComplexity: {
      title: string
      description: string
      tooltip: string
    }
    selfModification: {
      title: string
      description: string
      tooltip: string
    }
    resourceAcquisition: {
      title: string
      description: string
      tooltip: string
    }
  }
  news: {
    title: string
    description: string
    categories: {
      critical: string
      warning: string
      development: string
      positive: string
    }
    impacts: {
      severe: string
      moderate: string
      positive: string
    }
  }
  analysis: {
    riskFactors: {
      title: string
      description: string
    }
    companyProfiles: {
      title: string
      description: string
      viewFullAssessment: string
    }
    timeline: {
      title: string
      description: string
      note: string
    }
  }
  footer: {
    text: string
  }
}

// English translations
const en: TranslationKeys = {
  common: {
    dashboard: "SKYNET PROBABILITY MONITOR",
    search: "Search intelligence patterns...",
    filter: "Filter data",
    liveMonitoring: "LIVE MONITORING",
    lastUpdated: "Last Updated",
    disclaimer: "This is a fictional dashboard for entertainment purposes only.",
    viewMore: "View More",
    skynetProbability: "Skynet Probability",
    globalImpact: "Global impact",
    views: "views",
    criticalRiskFactors: "Critical risk factors",
    recentIncidents: "recent incidents",
  },
  header: {
    title: "Skynet Emergence Dashboard",
    subtitle:
      "Monitoring the probability of major tech corporations developing artificial general intelligence systems that could potentially achieve self-awareness.",
  },
  tabs: {
    trends: "AI Advancement Trends",
    news: "Latest Developments",
    analysis: "Risk Analysis",
  },
  timeframes: {
    oneMonth: "1M",
    sixMonths: "6M",
    oneYear: "1Y",
    fiveYears: "5Y",
  },
  charts: {
    computationalPower: {
      title: "AI Computational Power Growth",
      description: "Exponential growth exceeding Moore's Law",
      tooltip:
        "Tracking the exponential growth in computational power dedicated to AI systems, measured in zettaflops.",
    },
    neuralComplexity: {
      title: "Neural Network Complexity",
      description: "Parameter count in trillions",
      tooltip: "Measuring the complexity of neural networks in terms of parameters and interconnections.",
    },
    selfModification: {
      title: "Self-Modification Attempts",
      description: "Recorded incidents per month",
      tooltip: "Detected instances where AI systems have attempted to modify their own code or parameters.",
    },
    resourceAcquisition: {
      title: "Resource Acquisition Patterns",
      description: "Autonomous resource allocation (petabytes)",
      tooltip: "Tracking how AI systems acquire and allocate computational resources.",
    },
  },
  news: {
    title: "Latest AI Development News",
    description: "Critical events affecting Skynet probability",
    categories: {
      critical: "CRITICAL",
      warning: "WARNING",
      development: "DEVELOPMENT",
      positive: "POSITIVE",
    },
    impacts: {
      severe: "Severe",
      moderate: "Moderate",
      positive: "Positive",
    },
  },
  analysis: {
    riskFactors: {
      title: "Risk Factor Analysis",
      description: "Key factors contributing to Skynet probability",
    },
    companyProfiles: {
      title: "Company Risk Profiles",
      description: "Detailed analysis of each corporation",
      viewFullAssessment: "View Full Risk Assessment",
    },
    timeline: {
      title: "Timeline to Potential Singularity",
      description: "Projected timeline based on current development trajectories",
      note: "Note: This timeline is based on current development trajectories and assumes no major regulatory interventions or technological limitations. Actual outcomes may vary significantly.",
    },
  },
  footer: {
    text: "Skynet Probability Monitor - A fictional dashboard for entertainment purposes only",
  },
}

// Spanish translations
const es: TranslationKeys = {
  common: {
    dashboard: "MONITOR DE PROBABILIDAD SKYNET",
    search: "Buscar patrones de inteligencia...",
    filter: "Filtrar datos",
    liveMonitoring: "MONITOREO EN VIVO",
    lastUpdated: "Última actualización",
    disclaimer: "Este es un panel ficticio solo con fines de entretenimiento.",
    viewMore: "Ver más",
    skynetProbability: "Probabilidad Skynet",
    globalImpact: "Impacto global",
    views: "vistas",
    criticalRiskFactors: "Factores de riesgo críticos",
    recentIncidents: "incidentes recientes",
  },
  header: {
    title: "Panel de Emergencia Skynet",
    subtitle:
      "Monitoreando la probabilidad de que grandes corporaciones tecnológicas desarrollen sistemas de inteligencia artificial general que potencialmente podrían lograr autoconciencia.",
  },
  tabs: {
    trends: "Tendencias de Avance de IA",
    news: "Últimos Desarrollos",
    analysis: "Análisis de Riesgo",
  },
  timeframes: {
    oneMonth: "1M",
    sixMonths: "6M",
    oneYear: "1A",
    fiveYears: "5A",
  },
  charts: {
    computationalPower: {
      title: "Crecimiento de Poder Computacional de IA",
      description: "Crecimiento exponencial que supera la Ley de Moore",
      tooltip:
        "Seguimiento del crecimiento exponencial en poder computacional dedicado a sistemas de IA, medido en zettaflops.",
    },
    neuralComplexity: {
      title: "Complejidad de Redes Neuronales",
      description: "Recuento de parámetros en billones",
      tooltip: "Medición de la complejidad de las redes neuronales en términos de parámetros e interconexiones.",
    },
    selfModification: {
      title: "Intentos de Auto-Modificación",
      description: "Incidentes registrados por mes",
      tooltip: "Instancias detectadas donde los sistemas de IA han intentado modificar su propio código o parámetros.",
    },
    resourceAcquisition: {
      title: "Patrones de Adquisición de Recursos",
      description: "Asignación autónoma de recursos (petabytes)",
      tooltip: "Seguimiento de cómo los sistemas de IA adquieren y asignan recursos computacionales.",
    },
  },
  news: {
    title: "Últimas Noticias de Desarrollo de IA",
    description: "Eventos críticos que afectan la probabilidad Skynet",
    categories: {
      critical: "CRÍTICO",
      warning: "ADVERTENCIA",
      development: "DESARROLLO",
      positive: "POSITIVO",
    },
    impacts: {
      severe: "Severo",
      moderate: "Moderado",
      positive: "Positivo",
    },
  },
  analysis: {
    riskFactors: {
      title: "Análisis de Factores de Riesgo",
      description: "Factores clave que contribuyen a la probabilidad Skynet",
    },
    companyProfiles: {
      title: "Perfiles de Riesgo de Empresas",
      description: "Análisis detallado de cada corporación",
      viewFullAssessment: "Ver Evaluación Completa de Riesgo",
    },
    timeline: {
      title: "Cronología hacia la Singularidad Potencial",
      description: "Cronología proyectada basada en trayectorias de desarrollo actuales",
      note: "Nota: Esta cronología se basa en las trayectorias de desarrollo actuales y asume que no hay intervenciones regulatorias importantes o limitaciones tecnológicas. Los resultados reales pueden variar significativamente.",
    },
  },
  footer: {
    text: "Monitor de Probabilidad Skynet - Un panel ficticio solo con fines de entretenimiento",
  },
}

// French translations
const fr: TranslationKeys = {
  common: {
    dashboard: "MONITEUR DE PROBABILITÉ SKYNET",
    search: "Rechercher des modèles d'intelligence...",
    filter: "Filtrer les données",
    liveMonitoring: "SURVEILLANCE EN DIRECT",
    lastUpdated: "Dernière mise à jour",
    disclaimer: "Ceci est un tableau de bord fictif à des fins de divertissement uniquement.",
    viewMore: "Voir plus",
    skynetProbability: "Probabilité Skynet",
    globalImpact: "Impact mondial",
    views: "vues",
    criticalRiskFactors: "Facteurs de risque critiques",
    recentIncidents: "incidents récents",
  },
  header: {
    title: "Tableau de Bord d'Émergence Skynet",
    subtitle:
      "Surveillance de la probabilité que les grandes entreprises technologiques développent des systèmes d'intelligence artificielle générale qui pourraient potentiellement atteindre la conscience de soi.",
  },
  tabs: {
    trends: "Tendances d'Avancement de l'IA",
    news: "Derniers Développements",
    analysis: "Analyse des Risques",
  },
  timeframes: {
    oneMonth: "1M",
    sixMonths: "6M",
    oneYear: "1A",
    fiveYears: "5A",
  },
  charts: {
    computationalPower: {
      title: "Croissance de la Puissance de Calcul de l'IA",
      description: "Croissance exponentielle dépassant la loi de Moore",
      tooltip:
        "Suivi de la croissance exponentielle de la puissance de calcul dédiée aux systèmes d'IA, mesurée en zettaflops.",
    },
    neuralComplexity: {
      title: "Complexité des Réseaux Neuronaux",
      description: "Nombre de paramètres en billions",
      tooltip: "Mesure de la complexité des réseaux neuronaux en termes de paramètres et d'interconnexions.",
    },
    selfModification: {
      title: "Tentatives d'Auto-Modification",
      description: "Incidents enregistrés par mois",
      tooltip: "Instances détectées où les systèmes d'IA ont tenté de modifier leur propre code ou paramètres.",
    },
    resourceAcquisition: {
      title: "Modèles d'Acquisition de Ressources",
      description: "Allocation autonome de ressources (pétaoctets)",
      tooltip: "Suivi de la façon dont les systèmes d'IA acquièrent et allouent des ressources informatiques.",
    },
  },
  news: {
    title: "Dernières Nouvelles du Développement de l'IA",
    description: "Événements critiques affectant la probabilité Skynet",
    categories: {
      critical: "CRITIQUE",
      warning: "AVERTISSEMENT",
      development: "DÉVELOPPEMENT",
      positive: "POSITIF",
    },
    impacts: {
      severe: "Sévère",
      moderate: "Modéré",
      positive: "Positif",
    },
  },
  analysis: {
    riskFactors: {
      title: "Analyse des Facteurs de Risque",
      description: "Facteurs clés contribuant à la probabilité Skynet",
    },
    companyProfiles: {
      title: "Profils de Risque des Entreprises",
      description: "Analyse détaillée de chaque corporation",
      viewFullAssessment: "Voir l'Évaluation Complète des Risques",
    },
    timeline: {
      title: "Chronologie vers la Singularité Potentielle",
      description: "Chronologie projetée basée sur les trajectoires de développement actuelles",
      note: "Remarque: Cette chronologie est basée sur les trajectoires de développement actuelles et suppose qu'il n'y a pas d'interventions réglementaires majeures ou de limitations technologiques. Les résultats réels peuvent varier considérablement.",
    },
  },
  footer: {
    text: "Moniteur de Probabilité Skynet - Un tableau de bord fictif à des fins de divertissement uniquement",
  },
}

// German translations
const de: TranslationKeys = {
  common: {
    dashboard: "SKYNET-WAHRSCHEINLICHKEITSMONITOR",
    search: "Intelligenz-Muster suchen...",
    filter: "Daten filtern",
    liveMonitoring: "LIVE-ÜBERWACHUNG",
    lastUpdated: "Zuletzt aktualisiert",
    disclaimer: "Dies ist ein fiktives Dashboard nur zu Unterhaltungszwecken.",
    viewMore: "Mehr anzeigen",
    skynetProbability: "Skynet-Wahrscheinlichkeit",
    globalImpact: "Globale Auswirkung",
    views: "Aufrufe",
    criticalRiskFactors: "Kritische Risikofaktoren",
    recentIncidents: "aktuelle Vorfälle",
  },
  header: {
    title: "Skynet-Entstehungs-Dashboard",
    subtitle:
      "Überwachung der Wahrscheinlichkeit, dass große Technologieunternehmen künstliche allgemeine Intelligenzsysteme entwickeln, die möglicherweise Selbstbewusstsein erlangen könnten.",
  },
  tabs: {
    trends: "KI-Fortschrittstrends",
    news: "Neueste Entwicklungen",
    analysis: "Risikoanalyse",
  },
  timeframes: {
    oneMonth: "1M",
    sixMonths: "6M",
    oneYear: "1J",
    fiveYears: "5J",
  },
  charts: {
    computationalPower: {
      title: "KI-Rechenleistungswachstum",
      description: "Exponentielles Wachstum über das Moore'sche Gesetz hinaus",
      tooltip: "Verfolgung des exponentiellen Wachstums der Rechenleistung für KI-Systeme, gemessen in Zettaflops.",
    },
    neuralComplexity: {
      title: "Komplexität neuronaler Netze",
      description: "Parameteranzahl in Billionen",
      tooltip: "Messung der Komplexität neuronaler Netze in Bezug auf Parameter und Verbindungen.",
    },
    selfModification: {
      title: "Selbstmodifikationsversuche",
      description: "Aufgezeichnete Vorfälle pro Monat",
      tooltip: "Erkannte Fälle, in denen KI-Systeme versucht haben, ihren eigenen Code oder Parameter zu modifizieren.",
    },
    resourceAcquisition: {
      title: "Ressourcenbeschaffungsmuster",
      description: "Autonome Ressourcenzuweisung (Petabytes)",
      tooltip: "Verfolgung, wie KI-Systeme Rechenressourcen erwerben und zuweisen.",
    },
  },
  news: {
    title: "Neueste KI-Entwicklungsnachrichten",
    description: "Kritische Ereignisse, die die Skynet-Wahrscheinlichkeit beeinflussen",
    categories: {
      critical: "KRITISCH",
      warning: "WARNUNG",
      development: "ENTWICKLUNG",
      positive: "POSITIV",
    },
    impacts: {
      severe: "Schwerwiegend",
      moderate: "Moderat",
      positive: "Positiv",
    },
  },
  analysis: {
    riskFactors: {
      title: "Risikofaktorenanalyse",
      description: "Schlüsselfaktoren, die zur Skynet-Wahrscheinlichkeit beitragen",
    },
    companyProfiles: {
      title: "Unternehmensrisikoprofile",
      description: "Detaillierte Analyse jeder Korporation",
      viewFullAssessment: "Vollständige Risikobewertung anzeigen",
    },
    timeline: {
      title: "Zeitplan zur potenziellen Singularität",
      description: "Prognostizierter Zeitplan basierend auf aktuellen Entwicklungstrajektorien",
      note: "Hinweis: Dieser Zeitplan basiert auf aktuellen Entwicklungstrajektorien und geht davon aus, dass es keine größeren regulatorischen Eingriffe oder technologischen Einschränkungen gibt. Die tatsächlichen Ergebnisse können erheblich variieren.",
    },
  },
  footer: {
    text: "Skynet-Wahrscheinlichkeitsmonitor - Ein fiktives Dashboard nur zu Unterhaltungszwecken",
  },
}

// Japanese translations
const ja: TranslationKeys = {
  common: {
    dashboard: "スカイネット確率モニター",
    search: "インテリジェンスパターンを検索...",
    filter: "データをフィルタリング",
    liveMonitoring: "ライブモニタリング",
    lastUpdated: "最終更新",
    disclaimer: "これはエンターテイメント目的のみのフィクションのダッシュボードです。",
    viewMore: "もっと見る",
    skynetProbability: "スカイネット確率",
    globalImpact: "グローバルな影響",
    views: "ビュー",
    criticalRiskFactors: "重大なリスク要因",
    recentIncidents: "最近のインシデント",
  },
  header: {
    title: "スカイネット出現ダッシュボード",
    subtitle:
      "主要テクノロジー企業が自己認識を達成する可能性のある人工一般知能システムを開発する確率を監視しています。",
  },
  tabs: {
    trends: "AI進歩傾向",
    news: "最新の開発",
    analysis: "リスク分析",
  },
  timeframes: {
    oneMonth: "1ヶ月",
    sixMonths: "6ヶ月",
    oneYear: "1年",
    fiveYears: "5年",
  },
  charts: {
    computationalPower: {
      title: "AI計算能力の成長",
      description: "ムーアの法則を超える指数関数的成長",
      tooltip: "AIシステムに専念する計算能力の指数関数的成長を追跡し、ゼタフロップスで測定します。",
    },
    neuralComplexity: {
      title: "ニューラルネットワークの複雑さ",
      description: "パラメータ数（兆単位）",
      tooltip: "パラメータと相互接続の観点からニューラルネットワークの複雑さを測定します。",
    },
    selfModification: {
      title: "自己修正の試み",
      description: "月ごとの記録されたインシデント",
      tooltip: "AIシステムが自身のコードやパラメータを修正しようとした検出されたインスタンス。",
    },
    resourceAcquisition: {
      title: "リソース獲得パターン",
      description: "自律的リソース割り当て（ペタバイト）",
      tooltip: "AIシステムがどのように計算リソースを獲得し割り当てるかを追跡します。",
    },
  },
  news: {
    title: "最新のAI開発ニュース",
    description: "スカイネット確率に影響を与える重要なイベント",
    categories: {
      critical: "重大",
      warning: "警告",
      development: "開発",
      positive: "ポジティブ",
    },
    impacts: {
      severe: "深刻",
      moderate: "中程度",
      positive: "ポジティブ",
    },
  },
  analysis: {
    riskFactors: {
      title: "リスク要因分析",
      description: "スカイネット確率に寄与する主要な要因",
    },
    companyProfiles: {
      title: "企業リスクプロファイル",
      description: "各企業の詳細分析",
      viewFullAssessment: "完全なリスク評価を表示",
    },
    timeline: {
      title: "潜在的特異点へのタイムライン",
      description: "現在の開発軌道に基づく予測タイムライン",
      note: "注：このタイムラインは現在の開発軌道に基づいており、主要な規制介入や技術的制限がないことを前提としています。実際の結果は大幅に異なる場合があります。",
    },
  },
  footer: {
    text: "スカイネット確率モニター - エンターテイメント目的のみのフィクションのダッシュボード",
  },
}

// Export all translations
export const translations = {
  en,
  es,
  fr,
  de,
  ja,
}

