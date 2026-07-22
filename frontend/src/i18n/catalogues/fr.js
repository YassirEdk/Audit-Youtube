/**
 * French (fr-FR) translation of en.js.
 *
 * Same key set, same order. Placeholders like {n}, {pct}, {channel} are
 * substituted at runtime and must survive untouched.
 */

export const fr = {
  // ---------- shared ----------
  'common.retry': 'Réessayer',
  'common.stop': 'Arrêter',
  'common.copy': 'Copier',
  'common.copied': 'Copié',
  'common.loading': 'Chargement…',

  // ---------- masthead ----------
  'nav.home': 'Accueil',
  'nav.checks': 'Checklist',
  'nav.how': 'Fonctionnement',
  'nav.faq': 'FAQ',
  'nav.guides': 'En savoir plus',
  'nav.brandAria': "Accueil Channel Audit",
  'nav.sectionsAria': 'Sections',
  'nav.donate': 'Faire un don',
  'nav.donateTitle': 'Soutenir ce projet',
  'nav.login': 'Se connecter',
  'nav.signup': "S'inscrire",
  'nav.account': 'Compte',
  'nav.signOut': 'Se déconnecter',

  'nav.language': 'Langue',
  'nav.languageAria': 'Choisir une langue',

  // ---------- app chrome ----------
  'app.title': 'Audit de chaîne YouTube — évaluez n\'importe quelle chaîne',
  'app.serverDown.lead': "Le serveur n'est pas démarré.",
  'app.serverDown.rest':
    'Lancez-le en double-cliquant sur {file}, puis rechargez cette page.',
  'app.footer':
    "Les performances sont évaluées par rapport à la médiane des vues de chaque chaîne, pour qu'une seule vidéo virale ne fasse pas passer tout le reste pour un échec. Données publiques uniquement — ni rétention, ni CTR, ni sources de trafic.",
  'app.search.another': 'Auditer une autre chaîne',
  'app.search.ariaChannel': 'Chaîne à auditer',
  // ---------- report: stat tiles ----------
  'stats.subscribers': 'Abonnés',
  'stats.typical': 'Vidéo type',
  'stats.typicalUnit': 'vues',
  'stats.beat': 'Dépassent ce seuil',
  'stats.beatUnit': 'sur {n}',
  'stats.best': 'Meilleure vidéo',
  'stats.bestUnit': 'la médiane',
  'stats.trackedRate': 'rythme mesuré',
  'stats.roughEstimate': 'estimation approximative',
  'stats.nearest': 'au {n} près',
  'stats.live': 'En direct',
  'stats.seeLive': 'Voir en direct',

  // ---------- report: sidebar ----------
  'side.aria': 'Audits',
  'side.home': 'Accueil',
  'side.favorites': 'Mes favoris',
  'side.recents': 'Audits récents',
  'side.locked.lead': 'Connectez-vous pour enregistrer votre historique',
  'side.locked.rest': 'Gardez chaque chaîne auditée, sur tous vos appareils.',
  'side.locked.cta': 'Se connecter',
  'side.removeFavorite': 'Retirer {name} des favoris',
  'side.removeFavoriteShort': 'Retirer des favoris',
  'side.removeHistory': 'Retirer {name} de l\'historique',
  'side.removeHistoryShort': 'Retirer de l\'historique',

  // ---------- report: performance chart ----------
  'chart.heading': 'Chaque vidéo face à la vidéo type de cette chaîne',
  'chart.sub':
    'La ligne représente la normale de cette chaîne. À droite, mieux que la normale ; à gauche, moins bien.',
  'chart.above': 'Au-dessus de la normale',
  'chart.below': 'En dessous de la normale',
  'chart.tooNew': 'Trop récente pour juger',
  'chart.moreVideos': '{n} vidéos de plus',
  'chart.showTable': 'Afficher en tableau',
  'chart.colVideo': 'Vidéo',
  'chart.colViews': 'Vues',
  'chart.colVsNormal': 'vs normale',
  'chart.colAge': 'Ancienneté',

  // ---------- report: inline fixers ----------
  'fixer.about.cta': 'Rédigez-la pour moi',
  'fixer.about.aria': 'Section À propos suggérée',
  'fixer.about.hint': 'Collez dans YouTube Studio → Personnalisation → Informations de base.',
  'fixer.drafting': 'Rédaction…',
  'fixer.chars': '{n} caractères',
  'fixer.stillShort': '— toujours sous 200',
  'fixer.copy': 'Copier',
  'fixer.copied': 'Copié',
  'fixer.retry': 'Réessayer',

  // ---------- report: checklist ----------
  'check.label.banner': 'Bannière de la chaîne',
  'check.label.about': 'Section À propos',
  'check.label.keywords': 'Mots-clés de la chaîne',
  'check.label.handle': 'Identifiant personnalisé',
  'check.label.tags': 'Tags des vidéos',
  'check.label.descriptions': 'Descriptions des vidéos',
  'check.label.titles': 'Longueur des titres',
  'check.label.captions': 'Sous-titres',
  'check.label.hd': 'Envois en HD',
  'check.label.cadence': 'Régularité de publication',
  'check.label.recency': 'Fraîcheur des publications',
  'check.label.hit_rate': 'Taux de réussite',
  'check.label.reach': 'Vues par abonné',
  'check.label.engagement': 'Engagement',

  'check.detail.banner.set': 'Définie',
  'check.detail.banner.none': 'Aucune bannière envoyée',
  'check.detail.about.chars': '{n} caractères',
  'check.detail.about.empty': 'Vide',
  'check.detail.keywords.set': 'Définis',
  'check.detail.keywords.none': 'Aucun défini',
  'check.detail.handle.claimed': '{handle}',
  'check.detail.handle.none': 'Non réservé',
  'check.detail.tags.detail': '{pct}% des {n} vidéos ont 3 tags ou plus',
  'check.detail.descriptions.detail': '{pct}% font 250 caractères ou plus',
  'check.detail.titles.detail': '{pct}% tiennent dans la plage 30–70 caractères',
  'check.detail.captions.detail': '{pct}% ont des sous-titres',
  'check.detail.hd.detail': '{pct}% sont en HD',
  'check.detail.cadence.daily': 'Plusieurs vidéos par jour, en général',
  'check.detail.cadence.everyDay': 'Une nouvelle vidéo chaque jour, en général',
  'check.detail.cadence.every': 'Une nouvelle vidéo tous les {n} jours, en général',
  'check.detail.cadence.unknown': 'Historique de publication insuffisant pour juger',
  'check.detail.recency.today': 'Publiée aujourd\'hui',
  'check.detail.recency.day': 'Dernier envoi il y a 1 jour',
  'check.detail.recency.days': 'Dernier envoi il y a {n} jours',
  'check.detail.recency.none': 'Aucun envoi trouvé',
  'check.detail.hitRate.detail': '{pct}% des vidéos dépassent la médiane de la chaîne',
  'check.detail.reach.detail': 'La vidéo médiane touche {pct}% du nombre d\'abonnés',
  'check.detail.reach.hidden': 'Le nombre d\'abonnés est masqué sur cette chaîne',
  'check.detail.engagement.detail': '{pct}% de likes et commentaires par vue, en général',
  'check.detail.engagement.hidden': 'Les likes et commentaires sont masqués sur cette chaîne',

  'check.fix.banner':
    'Ajoutez une bannière 2560×1440 — c\'est la première chose que voit un nouveau visiteur.',
  'check.fix.about':
    'Écrivez 200 caractères ou plus expliquant le sujet de la chaîne et à qui elle s\'adresse. Ce texte est indexé.',
  'check.fix.keywords':
    'Ajoutez des mots-clés dans YouTube Studio → Paramètres → Chaîne → Informations de base.',
  'check.fix.handle': 'Réservez un identifiant pour donner à la chaîne une URL mémorisable.',
  'check.fix.tags':
    '{missing} vidéos ont besoin de tags. Les tags servent surtout à lever l\'ambiguïté sur des sujets que YouTube pourrait mal interpréter.',
  'check.fix.descriptions':
    'Les descriptions courtes ne donnent rien à indexer à YouTube. Visez 250 caractères ou plus, avec le sujet énoncé dans les deux premières lignes.',
  'check.fix.titles':
    'Sous 30 caractères, un titre gaspille de la place dans les résultats ; au-delà de 70, il est tronqué avant l\'accroche.',
  'check.fix.captions':
    'Les vidéos sous-titrées sont indexables et regardables sans le son. Les sous-titres automatiques comptent, à condition de ne pas les désactiver.',
  'check.fix.hd': 'Publiez en 1080p ou mieux.',
  'check.fix.cadence':
    'Au-delà de deux semaines d\'écart, vous perdez l\'élan algorithmique qui rend chaque publication plus facile que la précédente.',
  'check.fix.recency':
    'Après trois semaines de silence, le système de recommandation cesse de considérer la chaîne comme active. Publier quoi que ce soit le relance.',
  'check.fix.hit_rate':
    'La plupart des vidéos passent sous votre propre moyenne, ce qui signifie généralement que le catalogue repose sur quelques exceptions. Étudiez ce qu\'elles ont en commun.',
  'check.fix.reach':
    'Les vidéos touchent surtout des personnes déjà abonnées. Des titres et miniatures qui ne supposent aucune connaissance préalable vont plus loin.',
  'check.fix.engagement':
    'Les chaînes en bonne santé dépassent 4,5%. En dessous, le contenu est trouvé mais ne touche pas — demandez le like à la caméra et terminez sur une question qui mérite une réponse.',

  'app.search.ariaSubmit':'Auditer la chaîne',

  // ---------- landing: hero ----------
  'landing.hero.kicker': 'Gratuit · Résultats immédiats · Données publiques uniquement',
  'landing.hero.titleBefore': 'Découvrez ce qui freine',
  'landing.hero.titleEm': 'votre chaîne',
  'landing.hero.titleAfter': '',
  'landing.hero.sub':
    "Un score de santé sur 100 issu de quatorze vérifications automatiques, chaque vidéo récente notée par rapport à votre propre moyenne, et une analyse écrite de ce qu'il faut corriger en premier.",
  'landing.hero.note': 'Fonctionne sur toute chaîne publique — y compris celles de vos concurrents.',

  // ---------- landing: the search form ----------
  'landing.form.placeholder': 'Nom de la chaîne, @handle ou URL',
  'landing.form.ariaChannel': "Nom, identifiant ou ID de la chaîne YouTube",
  'landing.form.ariaDepth': 'Nombre de vidéos récentes à analyser',
  'landing.form.videos': '{n} vidéos',
  'landing.form.videosLocked': '{n} vidéos — inscription requise',
  'landing.form.submit': 'Auditer la chaîne',

  // ---------- landing: what gets checked ----------
  'landing.checks.heading': 'Checklist de l\'audit de chaîne',
  'landing.checks.lede':
    "Votre score reflète vos vidéos les plus récentes. Chaque catégorie note un signal que le système de recommandation de YouTube récompense réellement.",
  'landing.checks.setup.title': 'Configuration de la chaîne',
  'landing.checks.setup.body':
    "Bannière, section À propos, mots-clés et identifiant — les métadonnées que lisent en premier un nouveau visiteur comme l'index de recherche.",
  'landing.checks.metadata.title': 'Métadonnées des vidéos',
  'landing.checks.metadata.body':
    'Tags, longueur des descriptions, longueur des titres, sous-titres et qualité de mise en ligne sur toutes les vidéos récentes.',
  'landing.checks.cadence.title': 'Régularité de publication',
  'landing.checks.cadence.body':
    "La régularité de vos publications, mesurée par l'écart habituel entre deux mises en ligne plutôt que par une moyenne qu'une seule pause peut fausser.",
  'landing.checks.recency.title': 'Fraîcheur des publications',
  'landing.checks.recency.body':
    "Le temps écoulé depuis la dernière mise en ligne. Une chaîne peut avoir publié comme une horloge pendant deux ans et s'être tue depuis — la régularité seule ne le verrait jamais.",
  'landing.checks.hitrate.title': 'Taux de réussite',
  'landing.checks.hitrate.body':
    "Combien de vidéos dépassent votre propre médiane — et non un référentiel global qui pénalise les petites chaînes parce qu'elles sont petites.",
  'landing.checks.reach.title': 'Portée et engagement',
  'landing.checks.reach.body':
    "Vues par abonné, plus les likes et commentaires rapportés aux vues. Ensemble, ils indiquent si les vidéos dépassent le public déjà abonné.",

  // ---------- landing: how it works ----------
  'landing.how.heading': 'Fonctionnement',
  'landing.how.lede': 'Rien à installer, et chaque point rattaché à une vérification nommée.',
  'landing.how.stepsHeading': 'Trois étapes',
  'landing.how.step1.lead': 'Collez une chaîne.',
  'landing.how.step1.rest': "Une URL, un @identifiant ou un ID de chaîne brut — les trois fonctionnent.",
  'landing.how.step2.lead': 'Obtenez le score immédiatement.',
  'landing.how.step2.rest':
    "Le score de santé, la checklist et le graphique de performance sont calculés à partir de données publiques, sans aucun modèle et sans rien à attendre.",
  'landing.how.step3.lead': "Lisez l'analyse.",
  'landing.how.step3.rest':
    "Un clic transforme les chiffres en langage clair : ce qui fonctionne, quels titres réécrire et quoi produire ensuite.",

  // ---------- landing: the scorecard ----------
  'landing.scorecard.heading': 'Les quatorze vérifications, et ce que vaut chacune',
  'landing.scorecard.note':
    "Une réussite partielle rapporte la moitié. Tout ce que l'audit ne peut pas observer — likes masqués, chaîne trop récente pour avoir un rythme de publication — est retiré du total plutôt que noté zéro, si bien que le pourcentage signifie toujours « quelle part de ce qui était visible était en ordre ».",
  'landing.scorecard.group.setup': 'Configuration de la chaîne',
  'landing.scorecard.group.metadata': 'Métadonnées des vidéos',
  'landing.scorecard.group.habits': 'Habitudes de publication',
  'landing.scorecard.group.performance': 'Performance',

  'landing.scorecard.banner': 'Bannière de chaîne',
  'landing.scorecard.banner.earns': 'Mise en ligne',
  'landing.scorecard.about': 'Section À propos',
  'landing.scorecard.about.earns': '{n}+ caractères',
  'landing.scorecard.keywords': 'Mots-clés de la chaîne',
  'landing.scorecard.keywords.earns': 'Définis dans YouTube Studio',
  'landing.scorecard.handle': 'Identifiant personnalisé',
  'landing.scorecard.handle.earns': 'Réservé',
  'landing.scorecard.tags': 'Tags des vidéos',
  'landing.scorecard.tags.earns': '{pct}% des vidéos portent 3 tags ou plus',
  'landing.scorecard.descriptions': 'Descriptions des vidéos',
  'landing.scorecard.descriptions.earns': '{pct}% atteignent {n}+ caractères',
  'landing.scorecard.titles': 'Longueur des titres',
  'landing.scorecard.titles.earns': '{pct}% font entre 30 et 70 caractères',
  'landing.scorecard.captions': 'Sous-titres',
  'landing.scorecard.captions.earns': '{pct}% sont sous-titrées',
  'landing.scorecard.hd': 'Mises en ligne HD',
  'landing.scorecard.hd.earns': '{pct}% sont en 1080p ou mieux',
  'landing.scorecard.cadence': 'Régularité de publication',
  'landing.scorecard.cadence.earns': 'Une nouvelle vidéo tous les {n} jours ou moins',
  'landing.scorecard.recency': 'Fraîcheur des publications',
  'landing.scorecard.recency.earns': 'Une publication au cours des {n} derniers jours',
  'landing.scorecard.hitRate': 'Taux de réussite',
  'landing.scorecard.hitRate.earns': '{pct}% des vidéos dépassent la médiane de la chaîne',
  'landing.scorecard.vps': 'Vues par abonné',
  'landing.scorecard.vps.earns': 'La vidéo médiane touche {pct}% des abonnés',
  'landing.scorecard.engagement': 'Engagement',
  'landing.scorecard.engagement.earns': 'Likes et commentaires au-dessus de {pct}% des vues',

  // ---------- landing: FAQ ----------
  'landing.faq.heading': 'Questions',
  'landing.faq.lede': "Ce que le score signifie, et ce qu'il ne peut pas vous dire.",
  'landing.faq.q1': "Puis-je auditer une chaîne qui ne m'appartient pas ?",
  'landing.faq.a1':
    "Oui. Tout provient de données YouTube publiques, vous pouvez donc auditer n'importe quelle chaîne — y compris celle d'un concurrent.",
  'landing.faq.q2': 'Comment le score est-il calculé ?',
  'landing.faq.a2':
    "Quatorze vérifications, chacune valant un nombre fixe de points dont la somme fait 100. Une réussite rapporte tous les points, une réussite partielle la moitié, et tout ce que nous ne pouvons pas observer est exclu plutôt que retenu contre vous. Chaque point est rattaché à une vérification nommée dans vos résultats.",
  'landing.faq.q3': "Que ne peut-il pas voir ?",
  'landing.faq.a3':
    "La rétention, le taux de clic, les impressions et les sources de trafic se trouvent dans YouTube Studio et nécessitent la connexion du propriétaire de la chaîne. Cet audit raisonne à partir des vues, des titres et des métadonnées — vraiment utile pour repérer des tendances de packaging et de sujets, mais il ne peut pas vous dire si une vidéo a échoué parce que la miniature n'a pas été cliquée ou parce que les spectateurs sont partis tôt.",
  'landing.faq.q4': 'En quoi est-ce différent de vidIQ ou TubeBuddy ?',
  'landing.faq.a4':
    "Ce sont des suites complètes de gestion de chaîne — recherche de mots-clés, édition groupée des tags, suivi des concurrents — et elles demandent généralement d'installer une extension de navigateur et de connecter votre compte YouTube. Ceci est délibérément plus étroit : collez l'identifiant d'une chaîne et obtenez un audit noté de ce qui est publiquement visible, sans rien à installer ni compte à connecter. Comme l'outil ne lit que des données publiques, il peut auditer des chaînes qui ne vous appartiennent pas, ce qui est le compromis dans les deux sens : il ne vous montrera jamais les métriques privées de Studio que ces outils affichent une fois connectés.",
  'landing.faq.q5': "Existe-t-il un outil gratuit d'audit de chaîne YouTube ?",
  'landing.faq.a5':
    "En voici un. Évaluer une chaîne ne coûte rien et ne demande aucun compte — vous obtenez le score de santé, le graphique de performance mesuré par rapport à la médiane de la chaîne, et un échantillon de la checklist. Un compte gratuit ouvre l'analyse complète des quatorze vérifications, des scans plus profonds allant jusqu'à 100 vidéos, et le rapport écrit.",
  'landing.faq.q6': "Puis-je m'en servir pour analyser la chaîne d'un concurrent ?",
  'landing.faq.a6':
    "Oui, et c'est l'un de ses usages les plus utiles. Chaque vérification part de données publiques, si bien qu'un audit de concurrent se lit exactement comme le vôtre : lesquelles de leurs vidéos dépassent leur performance habituelle, comment leurs titres et descriptions sont construits, et quelles parties de leur configuration sont restées inachevées.",
  'landing.faq.q7': 'Est-ce que cela fonctionne pour les petites chaînes ?',
  'landing.faq.a7':
    "Oui, et c'est fait pour elles. Comme chaque vérification est notée par rapport à la médiane de la chaîne elle-même plutôt qu'à un référentiel global, une chaîne de 400 abonnés est évaluée sur la capacité de ses vidéos à dépasser sa propre vidéo type — pas à dépasser quelqu'un qui compte un million d'abonnés. Rien ici ne pénalise une chaîne parce qu'elle est petite, et les vérifications de configuration et de métadonnées sont celles qui comptent le plus au début.",
  'landing.faq.q8': 'Pourquoi comparer à ma propre médiane plutôt qu\'à d\'autres chaînes ?',
  'landing.faq.a8':
    "Parce qu'une vidéo à 10 000 vues est un triomphe sur une chaîne et un désastre sur une autre. Comparer à votre propre médiane vous dit lesquelles de vos vidéos ont réellement surperformé, et utiliser la médiane plutôt que la moyenne empêche un seul succès viral de faire passer tout le reste pour un échec.",

  // ---------- landing: guides ----------
  'landing.guides.heading': 'En savoir plus',
  'landing.guides.lede': 'Des réponses plus longues sur la construction du score et sur ce qu\'il faut en faire.',
  'landing.guides.free': 'Ce que comprend l\'audit gratuit',
  'landing.guides.score': 'Comment le score sur 100 est calculé',
  'landing.guides.competitor': 'Analyser la chaîne d\'un concurrent',
  'landing.guides.small': 'Pourquoi cela fonctionne pour les petites chaînes',
  'landing.guides.versus': 'Comparaison avec vidIQ et TubeBuddy',
  'landing.guides.checklist': 'Les quatorze contrôles, classés par ordre de priorité',
  'landing.guides.views': 'Pourquoi vos vues baissent',
  'landing.guides.upload': 'À quelle fréquence publier',

  // ---------- landing: closing CTA ----------
  'landing.cta.heading': 'Transformez le score en plan d\'action',
  'landing.cta.sub':
    "L'audit vous dit ce qui ne va pas en quelques secondes. Un compte gratuit vous dit quoi y faire.",
  'landing.cta.item1': 'Les quatorze vérifications, chacune avec son raisonnement et son correctif',
  'landing.cta.item2': "Des scans jusqu'à 100 vidéos au lieu de {n}",
  'landing.cta.item3':
    'Une analyse écrite : ce qui fonctionne, ce qu\'il faut corriger, quoi produire ensuite',
  'landing.cta.item4': 'Une section À propos réécrite, rédigée pour vous',
  'landing.cta.item5': 'Des audits enregistrés, pour relancer une chaîne et voir ce qui a bougé',
  'landing.cta.fine':
    "Pas de carte bancaire, pas d'extension, pas de connexion YouTube — et cela fonctionne toujours sur toute chaîne publique, y compris celles de vos concurrents.",
  'landing.cta.back': 'Retour à la recherche',

  // ---------- results ----------
  'results.newAudit': '← Nouvel audit',
  'results.favorite': 'Ajouter aux favoris',
  'results.favorited': 'Dans les favoris',
  'results.saveFailed': "Impossible d'enregistrer cet audit.",
  'results.auditing': 'Audit de {channel}',
  'results.auditingSub': 'Récupération des {n} dernières vidéos et notation en cours.',
  'results.auditFailed': "Impossible d'auditer cette chaîne.",
  'results.unreachable': 'Serveur injoignable. Tourne-t-il sur le port 8000 ?',
  'results.stopped': '[arrêté]',
  'results.download': 'Télécharger le .md',
  'results.writing': 'Rédaction…',
  'results.report.heading': "Vous voulez l'analyse écrite ?",
  'results.report.body':
    "Transforme les chiffres ci-dessus en langage clair — ce qui fonctionne, quels titres réécrire et quoi produire ensuite. Rédigé par {provider}.",
  'results.report.noModel': 'Aucun modèle configuré.',
  'results.report.write': "Rédiger le rapport",
  'results.report.locked.title': "L'analyse écrite est réservée aux membres",
  'results.report.locked.body':
    "Transforme les chiffres ci-dessus en langage clair — ce qui fonctionne, quels titres réécrire et quoi produire ensuite. Gratuit avec un compte.",

  // ---------- score card ----------
  'score.ariaRing': 'Score de santé {score} sur 100, note {grade}',
  'score.lede': 'Score de santé de la chaîne, issu de {n} vérifications automatiques.',
  'score.passed': 'réussies',
  'score.needWork': 'à améliorer',
  'score.failed': 'échouées',
  'score.group.setup': 'Configuration de la chaîne',
  'score.group.metadata': 'Métadonnées des vidéos',
  'score.group.habits': 'Habitudes et portée',
  'score.moreChecks': '{n} autres vérifications',
  'score.status.pass': 'réussi',
  'score.status.warn': 'avertissement',
  'score.status.fail': 'échec',
  'score.status.skip': 'ignoré',
  'score.aboutFixer.locked': "Inscrivez-vous pour en rédiger une",

  // ---------- log in / sign up dialog ----------
  'auth.close': 'Fermer',
  'auth.signup.title': 'Créer un compte',
  'auth.signup.sub': 'Enregistrez vos audits et retrouvez-les plus tard.',
  'auth.login.title': 'Bon retour',
  'auth.login.sub': 'Connectez-vous pour voir vos audits enregistrés.',
  'auth.google': 'Continuer avec Google',
  'auth.or': 'ou',
  'auth.name': 'Nom',
  'auth.namePlaceholder': 'Votre nom',
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.submit.signup': "S'inscrire",
  'auth.submit.login': 'Se connecter',
  'auth.busy': 'En cours…',
  'auth.haveAccount': 'Vous avez déjà un compte ?',
  'auth.noAccount': "Vous n'avez pas de compte ?",
  'auth.switchToLogin': 'Se connecter',
  'auth.switchToSignup': "S'inscrire",
  'auth.checkEmail.title': 'Vérifiez vos e-mails',
  'auth.checkEmail.body': 'Nous avons envoyé un lien de confirmation à {email}. Ouvrez-le pour terminer la création de votre compte.',
  'auth.checkEmail.ok': "J'ai compris",
  'auth.error.rateLimit': 'Trop de tentatives. Attendez quelques minutes avant de réessayer.',
  'auth.error.alreadyRegistered': 'Cette adresse a déjà un compte. Connectez-vous plutôt.',
  'auth.error.invalidCredentials': 'Cette adresse et ce mot de passe ne correspondent à aucun compte.',
  'auth.error.weakPassword': 'Le mot de passe doit contenir au moins 6 caractères.',
}
