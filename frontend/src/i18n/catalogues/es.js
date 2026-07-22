/**
 * Latin American Spanish (es-419). Translation of en.js and nothing else:
 * the key set, the order, and the {placeholders} come from that file.
 */

export const es = {
  // ---------- shared ----------
  'common.retry': 'Intentar de nuevo',
  'common.stop': 'Detener',
  'common.copy': 'Copiar',
  'common.copied': 'Copiado',
  'common.loading': 'Cargando…',

  // ---------- masthead ----------
  'nav.home': 'Inicio',
  'nav.checks': 'Lista de verificación',
  'nav.how': 'Cómo funciona',
  'nav.faq': 'Preguntas frecuentes',
  'nav.guides': 'Leer más',
  'nav.brandAria': 'Inicio de Channel Audit',
  'nav.sectionsAria': 'Secciones',
  'nav.donate': 'Haz una donación',
  'nav.donateTitle': 'Apoya este proyecto',
  'nav.login': 'Iniciar sesión',
  'nav.signup': 'Crear cuenta',
  'nav.account': 'Cuenta',
  'nav.signOut': 'Cerrar sesión',

  'nav.language': 'Idioma',
  'nav.languageAria': 'Elige un idioma',

  // ---------- app chrome ----------
  'app.title': 'Auditoría de canales de YouTube — califica cualquier canal',
  'app.serverDown.lead': 'El servidor no está en ejecución.',
  'app.serverDown.rest':
    'Inícialo con doble clic en {file} y luego recarga esta página.',
  'app.footer':
    'El rendimiento se mide contra la mediana de vistas del propio canal, así que un video viral no hace que todo lo demás parezca un fracaso. Solo datos públicos: sin retención, CTR ni fuentes de tráfico.',
  'app.search.another': 'Auditar otro canal',
  'app.search.ariaChannel': 'Canal por auditar',
  // ---------- report: stat tiles ----------
  'stats.subscribers': 'Suscriptores',
  'stats.typical': 'Video típico',
  'stats.typicalUnit': 'vistas',
  'stats.beat': 'Superan esa marca',
  'stats.beatUnit': 'de {n}',
  'stats.best': 'Mejor video',
  'stats.bestUnit': 'la mediana',
  'stats.trackedRate': 'ritmo medido',
  'stats.roughEstimate': 'estimación aproximada',
  'stats.nearest': 'al {n} más cercano',
  'stats.live': 'En vivo',
  'stats.seeLive': 'Ver en vivo',

  // ---------- report: sidebar ----------
  'side.aria': 'Auditorías',
  'side.home': 'Inicio',
  'side.favorites': 'Mis favoritos',
  'side.recents': 'Auditorías recientes',
  'side.locked.lead': 'Inicia sesión para guardar tu historial',
  'side.locked.rest': 'Conserva cada canal que audites, en cualquier dispositivo.',
  'side.locked.cta': 'Iniciar sesión',
  'side.removeFavorite': 'Quitar {name} de favoritos',
  'side.removeFavoriteShort': 'Quitar de favoritos',
  'side.removeHistory': 'Quitar {name} del historial',
  'side.removeHistoryShort': 'Quitar del historial',

  // ---------- report: performance chart ----------
  'chart.heading': 'Cada video frente al video típico de este canal',
  'chart.sub':
    'La línea es lo normal para este canal. A la derecha es mejor que lo normal; a la izquierda, peor.',
  'chart.above': 'Por encima de lo normal',
  'chart.below': 'Por debajo de lo normal',
  'chart.tooNew': 'Demasiado reciente para juzgar',
  'chart.moreVideos': '{n} videos más',
  'chart.showTable': 'Ver como tabla',
  'chart.colVideo': 'Video',
  'chart.colViews': 'Vistas',
  'chart.colVsNormal': 'vs. lo normal',
  'chart.colAge': 'Antigüedad',

  // ---------- report: inline fixers ----------
  'fixer.about.cta': 'Escríbela por mí',
  'fixer.about.aria': 'Sección Información sugerida',
  'fixer.about.hint': 'Pégala en YouTube Studio → Personalización → Información básica.',
  'fixer.drafting': 'Redactando…',
  'fixer.chars': '{n} caracteres',
  'fixer.stillShort': '— aún por debajo de 200',
  'fixer.copy': 'Copiar',
  'fixer.copied': 'Copiado',
  'fixer.retry': 'Reintentar',

  // ---------- report: checklist ----------
  'check.label.banner': 'Banner del canal',
  'check.label.about': 'Sección Información',
  'check.label.keywords': 'Palabras clave del canal',
  'check.label.handle': 'Identificador personalizado',
  'check.label.tags': 'Etiquetas de video',
  'check.label.descriptions': 'Descripciones de video',
  'check.label.titles': 'Longitud del título',
  'check.label.captions': 'Subtítulos',
  'check.label.hd': 'Subidas en HD',
  'check.label.cadence': 'Constancia al publicar',
  'check.label.recency': 'Actualidad de las publicaciones',
  'check.label.hit_rate': 'Tasa de aciertos',
  'check.label.reach': 'Vistas por suscriptor',
  'check.label.engagement': 'Interacción',

  'check.detail.banner.set': 'Configurado',
  'check.detail.banner.none': 'No se subió ningún banner',
  'check.detail.about.chars': '{n} caracteres',
  'check.detail.about.empty': 'Vacía',
  'check.detail.keywords.set': 'Configuradas',
  'check.detail.keywords.none': 'Ninguna configurada',
  'check.detail.handle.claimed': '{handle}',
  'check.detail.handle.none': 'Sin reclamar',
  'check.detail.tags.detail': '{pct}% de {n} videos tienen 3 etiquetas o más',
  'check.detail.descriptions.detail': '{pct}% tienen 250 caracteres o más',
  'check.detail.titles.detail': '{pct}% están en el rango de 30–70 caracteres',
  'check.detail.captions.detail': '{pct}% tienen subtítulos',
  'check.detail.hd.detail': '{pct}% están en HD',
  'check.detail.cadence.daily': 'Varios videos al día, normalmente',
  'check.detail.cadence.everyDay': 'Un video nuevo cada día, normalmente',
  'check.detail.cadence.every': 'Un video nuevo cada {n} días, normalmente',
  'check.detail.cadence.unknown': 'No hay suficiente historial para juzgar',
  'check.detail.recency.today': 'Publicado hoy',
  'check.detail.recency.day': 'Última subida hace 1 día',
  'check.detail.recency.days': 'Última subida hace {n} días',
  'check.detail.recency.none': 'No se encontraron subidas',
  'check.detail.hitRate.detail': '{pct}% de los videos superan la mediana del propio canal',
  'check.detail.reach.detail': 'El video mediano llega al {pct}% de los suscriptores',
  'check.detail.reach.hidden': 'El número de suscriptores está oculto en este canal',
  'check.detail.engagement.detail': '{pct}% de likes y comentarios por vista, normalmente',
  'check.detail.engagement.hidden': 'Los likes y comentarios están ocultos en este canal',

  'check.fix.banner':
    'Agrega un banner de 2560×1440: es lo primero que ve un visitante nuevo.',
  'check.fix.about':
    'Escribe 200 caracteres o más explicando de qué trata el canal y para quién es. Este texto se puede buscar.',
  'check.fix.keywords':
    'Agrega palabras clave en YouTube Studio → Configuración → Canal → Información básica.',
  'check.fix.handle': 'Reclama un identificador para que el canal tenga una URL memorable.',
  'check.fix.tags':
    '{missing} videos necesitan etiquetas. Las etiquetas importan sobre todo para aclarar temas que YouTube podría malinterpretar.',
  'check.fix.descriptions':
    'Las descripciones cortas no le dan nada que indexar a YouTube. Apunta a 250 caracteres o más, con el tema en las dos primeras líneas.',
  'check.fix.titles':
    'Los títulos de menos de 30 caracteres desperdician espacio en las búsquedas; los de más de 70 se cortan antes del gancho.',
  'check.fix.captions':
    'Los videos con subtítulos son indexables y se pueden ver sin sonido. Los subtítulos automáticos cuentan, pero solo si no los desactivas.',
  'check.fix.hd': 'Sube en 1080p o mejor.',
  'check.fix.cadence':
    'Los huecos de más de dos semanas te cuestan el impulso algorítmico que hace que cada subida sea más fácil que la anterior.',
  'check.fix.recency':
    'Tras tres semanas de silencio, el sistema de recomendaciones deja de tratar el canal como activo. Publicar cualquier cosa lo reinicia.',
  'check.fix.hit_rate':
    'La mayoría de las subidas quedan por debajo de tu propio promedio, lo que suele significar que el catálogo se sostiene por unas pocas excepciones. Estudia qué tienen en común.',
  'check.fix.reach':
    'Los videos llegan sobre todo a quienes ya están suscritos. Los títulos y miniaturas que no dan nada por sabido llegan más lejos.',
  'check.fix.engagement':
    'Los canales sanos están por encima del 4,5%. Por debajo, el contenido se encuentra pero no conecta: pide el like en cámara y termina con una pregunta que valga la pena responder.',

  'app.search.ariaSubmit':'Auditar canal',

  // ---------- landing: hero ----------
  'landing.hero.kicker': 'Gratis · Resultados al instante · Solo datos públicos',
  'landing.hero.titleBefore': 'Descubre qué está frenando',
  'landing.hero.titleEm': 'a tu canal',
  'landing.hero.titleAfter': '',
  'landing.hero.sub':
    'Una puntuación de salud sobre 100 a partir de catorce verificaciones automáticas, cada video reciente calificado contra tu propio promedio y un análisis escrito de qué corregir primero.',
  'landing.hero.note': 'Funciona con cualquier canal público, incluidos los de tu competencia.',

  // ---------- landing: the search form ----------
  'landing.form.placeholder': 'Nombre del canal, @handle o URL',
  'landing.form.ariaChannel': 'Nombre, handle o ID del canal de YouTube',
  'landing.form.ariaDepth': 'Cuántos videos recientes analizar',
  'landing.form.videos': '{n} videos',
  'landing.form.videosLocked': '{n} videos — crear cuenta',
  'landing.form.submit': 'Auditar canal',

  // ---------- landing: what gets checked ----------
  'landing.checks.heading': 'Lista de verificación de la auditoría',
  'landing.checks.lede':
    'Tu puntuación refleja tus videos más recientes. Cada categoría califica una señal que el sistema de recomendaciones de YouTube realmente premia.',
  'landing.checks.setup.title': 'Configuración del canal',
  'landing.checks.setup.body':
    'Banner, sección Información, palabras clave y handle: los metadatos que leen primero tanto un visitante nuevo como el índice de búsqueda.',
  'landing.checks.metadata.title': 'Metadatos de los videos',
  'landing.checks.metadata.body':
    'Etiquetas, largo de la descripción, largo del título, subtítulos y calidad de subida en cada video reciente.',
  'landing.checks.cadence.title': 'Constancia al publicar',
  'landing.checks.cadence.body':
    'Con qué regularidad publicas, medida como el intervalo habitual entre subidas y no como un promedio que una pausa puede distorsionar.',
  'landing.checks.recency.title': 'Actividad reciente',
  'landing.checks.recency.body':
    'Cuánto tiempo pasó desde la última subida. Un canal puede haber publicado como reloj durante dos años y aun así haberse quedado en silencio: la constancia por sí sola nunca lo detectaría.',
  'landing.checks.hitrate.title': 'Tasa de aciertos',
  'landing.checks.hitrate.body':
    'Cuántos videos superan tu propia mediana, no un referente global que castiga a los canales pequeños por ser pequeños.',
  'landing.checks.reach.title': 'Alcance e interacción',
  'landing.checks.reach.body':
    'Vistas por suscriptor, más los me gusta y comentarios frente a las vistas. Juntos responden si los videos llegan más allá de quienes ya están suscritos.',

  // ---------- landing: how it works ----------
  'landing.how.heading': 'Cómo funciona',
  'landing.how.lede': 'Nada que instalar, y cada punto rastreable hasta una verificación con nombre.',
  'landing.how.stepsHeading': 'Tres pasos',
  'landing.how.step1.lead': 'Pega un canal.',
  'landing.how.step1.rest': 'Una URL, un @usuario o el ID del canal: los tres funcionan.',
  'landing.how.step2.lead': 'Obtén la puntuación al instante.',
  'landing.how.step2.rest':
    'La puntuación de salud, la lista de verificación y el gráfico de rendimiento se calculan con datos públicos, sin ningún modelo de por medio y sin nada que esperar.',
  'landing.how.step3.lead': 'Lee el análisis.',
  'landing.how.step3.rest':
    'Un clic convierte los números en lenguaje claro: qué está funcionando, qué títulos reescribir y qué hacer a continuación.',

  // ---------- landing: the scorecard ----------
  'landing.scorecard.heading': 'Las catorce verificaciones y cuánto vale cada una',
  'landing.scorecard.note':
    'Un cumplimiento parcial vale la mitad. Todo lo que la auditoría no puede observar —me gusta ocultos, un canal demasiado nuevo para tener un ritmo de publicación— se descuenta del total en vez de puntuar cero, así que el porcentaje siempre significa "cuánto de lo que se pudo ver estaba en orden".',
  'landing.scorecard.group.setup': 'Configuración del canal',
  'landing.scorecard.group.metadata': 'Metadatos de los videos',
  'landing.scorecard.group.habits': 'Hábitos de publicación',
  'landing.scorecard.group.performance': 'Rendimiento',

  'landing.scorecard.banner': 'Banner del canal',
  'landing.scorecard.banner.earns': 'Subido',
  'landing.scorecard.about': 'Sección Información',
  'landing.scorecard.about.earns': '{n}+ caracteres',
  'landing.scorecard.keywords': 'Palabras clave del canal',
  'landing.scorecard.keywords.earns': 'Definidas en YouTube Studio',
  'landing.scorecard.handle': 'Handle personalizado',
  'landing.scorecard.handle.earns': 'Reclamado',
  'landing.scorecard.tags': 'Etiquetas de los videos',
  'landing.scorecard.tags.earns': '{pct}% de los videos tienen 3 etiquetas o más',
  'landing.scorecard.descriptions': 'Descripciones de los videos',
  'landing.scorecard.descriptions.earns': '{pct}% llegan a {n}+ caracteres',
  'landing.scorecard.titles': 'Largo del título',
  'landing.scorecard.titles.earns': '{pct}% quedan entre 30 y 70 caracteres',
  'landing.scorecard.captions': 'Subtítulos',
  'landing.scorecard.captions.earns': '{pct}% tienen subtítulos',
  'landing.scorecard.hd': 'Subidas en HD',
  'landing.scorecard.hd.earns': '{pct}% están en 1080p o mejor',
  'landing.scorecard.cadence': 'Constancia al publicar',
  'landing.scorecard.cadence.earns': 'Un video nuevo cada {n} días o menos',
  'landing.scorecard.recency': 'Actividad reciente',
  'landing.scorecard.recency.earns': 'Algo publicado en los últimos {n} días',
  'landing.scorecard.hitRate': 'Tasa de aciertos',
  'landing.scorecard.hitRate.earns': '{pct}% de los videos superan la mediana del canal',
  'landing.scorecard.vps': 'Vistas por suscriptor',
  'landing.scorecard.vps.earns': 'El video mediano llega al {pct}% de los suscriptores',
  'landing.scorecard.engagement': 'Interacción',
  'landing.scorecard.engagement.earns': 'Me gusta y comentarios por encima del {pct}% de las vistas',

  // ---------- landing: FAQ ----------
  'landing.faq.heading': 'Preguntas',
  'landing.faq.lede': 'Qué significa la puntuación y qué no te puede decir.',
  'landing.faq.q1': '¿Puedo auditar un canal que no es mío?',
  'landing.faq.a1':
    'Sí. Todo proviene de datos públicos de YouTube, así que puedes auditar cualquier canal, incluido el de un competidor.',
  'landing.faq.q2': '¿Cómo se calcula la puntuación?',
  'landing.faq.a2':
    'Catorce verificaciones, cada una con un número fijo de puntos que suman 100. Aprobar da los puntos completos, un cumplimiento parcial da la mitad y todo lo que no podemos observar se excluye en vez de contarse en tu contra. Cada punto es rastreable hasta una verificación con nombre en tus resultados.',
  'landing.faq.q3': '¿Qué no puede ver?',
  'landing.faq.a3':
    'La retención, el CTR, las impresiones y las fuentes de tráfico viven en YouTube Studio y requieren el inicio de sesión del dueño del canal. Esta auditoría razona a partir de vistas, títulos y metadatos: sirve de verdad para detectar patrones de presentación y de temas, pero no puede decirte si un video falló porque nadie hizo clic en la miniatura o porque los espectadores se fueron pronto.',
  'landing.faq.q4': '¿En qué se diferencia de vidIQ o TubeBuddy?',
  'landing.faq.a4':
    'Esas son suites completas de gestión de canales —investigación de palabras clave, edición masiva de etiquetas, seguimiento de la competencia— y por lo general te piden instalar una extensión del navegador y conectar tu cuenta de YouTube. Esto es deliberadamente más acotado: pegas el handle de cualquier canal y obtienes una auditoría puntuada de lo que es visible públicamente, sin nada que instalar ni cuenta que conectar. Como solo lee datos públicos, puede auditar canales que no son tuyos, y ese es el intercambio en ambos sentidos: nunca te mostrará las métricas privadas de Studio que esas herramientas muestran una vez que te conectas.',
  'landing.faq.q5': '¿Existe una herramienta gratuita de auditoría de canales de YouTube?',
  'landing.faq.a5':
    'Esta lo es. Puntuar un canal no cuesta nada y no requiere cuenta: obtienes la puntuación de salud, el gráfico de rendimiento medido contra la propia mediana del canal y una muestra de la lista de verificación. Una cuenta gratuita abre el desglose completo de catorce verificaciones, análisis más profundos de hasta 100 videos y el informe escrito.',
  'landing.faq.q6': '¿Puedo usar esto para analizar el canal de un competidor?',
  'landing.faq.a6':
    'Sí, y es una de las formas más útiles de usarlo. Todas las verificaciones funcionan con datos públicos, así que auditar a un competidor se lee igual que auditarte a ti: cuáles de sus videos superaron su rendimiento habitual, cómo están construidos sus títulos y descripciones, y qué partes de su configuración quedaron sin hacer.',
  'landing.faq.q7': '¿Funciona para canales pequeños?',
  'landing.faq.a7':
    'Sí, y está pensado para ellos. Como cada verificación se puntúa contra la propia mediana del canal y no contra un referente global, un canal con 400 suscriptores se mide por si sus videos superan a su video típico, no por si supera a alguien con un millón. Aquí nada penaliza a un canal por ser pequeño, y las verificaciones de configuración y metadatos suelen ser las que más importan al principio.',
  'landing.faq.q8': '¿Por qué comparar contra mi propia mediana en vez de contra otros canales?',
  'landing.faq.a8':
    'Porque un video con 10.000 vistas es un triunfo en un canal y un desastre en otro. Puntuar contra tu propia mediana te dice cuáles de tus videos realmente rindieron por encima, y usar la mediana en vez del promedio evita que un solo éxito viral haga que todo lo demás parezca un fracaso.',

  // ---------- landing: guides ----------
  'landing.guides.heading': 'Leer más',
  'landing.guides.lede': 'Respuestas más largas sobre cómo se construye la puntuación y qué hacer con ella.',
  'landing.guides.free': 'Qué incluye la auditoría gratuita',
  'landing.guides.score': 'Cómo se calcula la puntuación sobre 100',
  'landing.guides.competitor': 'Analizar el canal de un competidor',
  'landing.guides.small': 'Por qué funciona para canales pequeños',
  'landing.guides.versus': 'Comparación con vidIQ y TubeBuddy',
  'landing.guides.checklist': 'Las catorce comprobaciones, ordenadas por prioridad',
  'landing.guides.views': 'Por qué están cayendo tus vistas',
  'landing.guides.upload': 'Con qué frecuencia deberías publicar',

  // ---------- landing: closing CTA ----------
  'landing.cta.heading': 'Convierte la puntuación en un plan',
  'landing.cta.sub':
    'La auditoría te dice qué está mal en unos segundos. Una cuenta gratuita te dice qué hacer al respecto.',
  'landing.cta.item1': 'Las catorce verificaciones, cada una con el razonamiento y la solución',
  'landing.cta.item2': 'Análisis de hasta 100 videos en lugar de {n}',
  'landing.cta.item3':
    'Un análisis escrito: qué está funcionando, qué corregir y qué hacer a continuación',
  'landing.cta.item4': 'Una sección Información reescrita, redactada para ti',
  'landing.cta.item5': 'Auditorías guardadas, para volver a analizar un canal y ver qué cambió',
  'landing.cta.fine':
    'Sin tarjeta, sin extensión, sin iniciar sesión en YouTube, y aun así funciona con cualquier canal público, incluidos los de tu competencia.',
  'landing.cta.back': 'Volver a la búsqueda',

  // ---------- results ----------
  'results.newAudit': '← Nueva auditoría',
  'results.favorite': 'Guardar en favoritos',
  'results.favorited': 'En favoritos',
  'results.saveFailed': 'No se pudo guardar esta auditoría.',
  'results.auditing': 'Auditando {channel}',
  'results.auditingSub': 'Obteniendo los últimos {n} videos y puntuándolos.',
  'results.auditFailed': 'No se pudo auditar ese canal.',
  'results.unreachable': 'No se puede conectar con el servidor. ¿Está corriendo en el puerto 8000?',
  'results.stopped': '[detenido]',
  'results.download': 'Descargar .md',
  'results.writing': 'Escribiendo…',
  'results.report.heading': '¿Quieres el análisis escrito?',
  'results.report.body':
    'Convierte los números de arriba en lenguaje claro: qué está funcionando, qué títulos reescribir y qué hacer a continuación. Escrito por {provider}.',
  'results.report.noModel': 'No hay ningún modelo configurado.',
  'results.report.write': 'Escribir el informe',
  'results.report.locked.title': 'El análisis escrito es para miembros',
  'results.report.locked.body':
    'Convierte los números de arriba en lenguaje claro: qué está funcionando, qué títulos reescribir y qué hacer a continuación. Gratis con una cuenta.',

  // ---------- score card ----------
  'score.ariaRing': 'Puntuación de salud {score} sobre 100, calificación {grade}',
  'score.lede': 'Puntuación de salud del canal, a partir de {n} verificaciones automáticas.',
  'score.passed': 'aprobadas',
  'score.needWork': 'por mejorar',
  'score.failed': 'reprobadas',
  'score.group.setup': 'Configuración del canal',
  'score.group.metadata': 'Metadatos de los videos',
  'score.group.habits': 'Hábitos y alcance',
  'score.moreChecks': '{n} verificaciones más',
  'score.status.pass': 'aprobada',
  'score.status.warn': 'advertencia',
  'score.status.fail': 'reprobada',
  'score.status.skip': 'omitida',
  'score.aboutFixer.locked': 'Crea una cuenta para escribir una',

  // ---------- log in / sign up dialog ----------
  'auth.close': 'Cerrar',
  'auth.signup.title': 'Crea una cuenta',
  'auth.signup.sub': 'Guarda tus auditorías y vuelve a ellas después.',
  'auth.login.title': 'Qué bueno verte de nuevo',
  'auth.login.sub': 'Inicia sesión para ver tus auditorías guardadas.',
  'auth.google': 'Continuar con Google',
  'auth.or': 'o',
  'auth.name': 'Nombre',
  'auth.namePlaceholder': 'Tu nombre',
  'auth.email': 'Correo',
  'auth.password': 'Contraseña',
  'auth.submit.signup': 'Crear cuenta',
  'auth.submit.login': 'Iniciar sesión',
  'auth.busy': 'Procesando…',
  'auth.haveAccount': '¿Ya tienes una cuenta?',
  'auth.noAccount': '¿No tienes una cuenta?',
  'auth.switchToLogin': 'Iniciar sesión',
  'auth.switchToSignup': 'Crear cuenta',
  'auth.checkEmail.title': 'Revisa tu correo',
  'auth.checkEmail.body': 'Enviamos un enlace de confirmación a {email}. Ábrelo para terminar de crear tu cuenta.',
  'auth.checkEmail.ok': 'Entendido',
  'auth.error.rateLimit': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'auth.error.alreadyRegistered': 'Ese correo ya tiene una cuenta. Mejor inicia sesión.',
  'auth.error.invalidCredentials': 'Ese correo y esa contraseña no coinciden con ninguna cuenta.',
  'auth.error.weakPassword': 'La contraseña debe tener al menos 6 caracteres.',
}
