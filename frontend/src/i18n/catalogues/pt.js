/**
 * Brazilian Portuguese (pt-BR) catalogue. Translated from en.js, which defines
 * the key set. Keys and {placeholders} are never translated.
 */

export const pt = {
  // ---------- shared ----------
  'common.retry': 'Tentar de novo',
  'common.stop': 'Parar',
  'common.copy': 'Copiar',
  'common.copied': 'Copiado',
  'common.loading': 'Carregando…',

  // ---------- masthead ----------
  'nav.home': 'Início',
  'nav.checks': 'Checklist',
  'nav.how': 'Como funciona',
  'nav.faq': 'Perguntas frequentes',
  'nav.guides': 'Leia mais',
  'nav.brandAria': 'Página inicial do Channel Audit',
  'nav.sectionsAria': 'Seções',
  'nav.donate': 'Faça uma doação',
  'nav.donateTitle': 'Apoie este projeto',
  'nav.login': 'Entrar',
  'nav.signup': 'Criar conta',
  'nav.account': 'Conta',
  'nav.signOut': 'Sair',

  // The switcher. `language` labels the control for screen readers; the
  // options themselves are never translated — see LOCALES.label.
  'nav.language': 'Idioma',
  'nav.languageAria': 'Escolha um idioma',

  // ---------- app chrome ----------
  'app.title': 'Auditoria de canal do YouTube — avalie qualquer canal',
  'app.serverDown.lead': 'O servidor não está rodando.',
  'app.serverDown.rest':
    'Inicie clicando duas vezes em {file} e depois recarregue esta página.',
  'app.footer':
    'O desempenho é avaliado com base na mediana de visualizações do próprio canal, então um vídeo viral não faz todo o resto parecer fracasso. Apenas dados públicos — sem retenção, CTR ou fontes de tráfego.',
  'app.search.another': 'Auditar outro canal',
  'app.search.ariaChannel': 'Canal a auditar',
  // ---------- report: stat tiles ----------
  'stats.subscribers': 'Inscritos',
  'stats.typical': 'Vídeo típico',
  'stats.typicalUnit': 'visualizações',
  'stats.beat': 'Superam essa marca',
  'stats.beatUnit': 'de {n}',
  'stats.best': 'Melhor vídeo',
  'stats.bestUnit': 'a mediana',
  'stats.trackedRate': 'ritmo medido',
  'stats.roughEstimate': 'estimativa aproximada',
  'stats.nearest': 'para {n} mais próximo',
  'stats.live': 'Ao vivo',
  'stats.seeLive': 'Ver ao vivo',

  // ---------- report: sidebar ----------
  'side.aria': 'Auditorias',
  'side.home': 'Início',
  'side.favorites': 'Meus favoritos',
  'side.recents': 'Auditorias recentes',
  'side.locked.lead': 'Entre para salvar seu histórico',
  'side.locked.rest': 'Guarde cada canal que auditar, em qualquer dispositivo.',
  'side.locked.cta': 'Entrar',
  'side.removeFavorite': 'Remover {name} dos favoritos',
  'side.removeFavoriteShort': 'Remover dos favoritos',
  'side.removeHistory': 'Remover {name} do histórico',
  'side.removeHistoryShort': 'Remover do histórico',

  // ---------- report: performance chart ----------
  'chart.heading': 'Cada vídeo em relação ao vídeo típico deste canal',
  'chart.sub':
    'A linha é o normal para este canal. À direita é melhor que o normal; à esquerda, pior.',
  'chart.above': 'Acima do normal',
  'chart.below': 'Abaixo do normal',
  'chart.tooNew': 'Recente demais para julgar',
  'chart.moreVideos': '{n} vídeos a mais',
  'chart.showTable': 'Ver como tabela',
  'chart.colVideo': 'Vídeo',
  'chart.colViews': 'Visualizações',
  'chart.colVsNormal': 'vs. normal',
  'chart.colAge': 'Idade',

  // ---------- report: inline fixers ----------
  'fixer.about.cta': 'Escreva para mim',
  'fixer.about.aria': 'Seção Sobre sugerida',
  'fixer.about.hint': 'Cole no YouTube Studio → Personalização → Informações básicas.',
  'fixer.drafting': 'Redigindo…',
  'fixer.chars': '{n} caracteres',
  'fixer.stillShort': '— ainda abaixo de 200',
  'fixer.copy': 'Copiar',
  'fixer.copied': 'Copiado',
  'fixer.retry': 'Tentar novamente',

  // ---------- report: checklist ----------
  'check.label.banner': 'Banner do canal',
  'check.label.about': 'Seção Sobre',
  'check.label.keywords': 'Palavras-chave do canal',
  'check.label.handle': 'Identificador personalizado',
  'check.label.tags': 'Tags dos vídeos',
  'check.label.descriptions': 'Descrições dos vídeos',
  'check.label.titles': 'Tamanho do título',
  'check.label.captions': 'Legendas',
  'check.label.hd': 'Envios em HD',
  'check.label.cadence': 'Constância de publicação',
  'check.label.recency': 'Atualidade das publicações',
  'check.label.hit_rate': 'Taxa de acertos',
  'check.label.reach': 'Visualizações por inscrito',
  'check.label.engagement': 'Engajamento',

  'check.detail.banner.set': 'Configurado',
  'check.detail.banner.none': 'Nenhum banner enviado',
  'check.detail.about.chars': '{n} caracteres',
  'check.detail.about.empty': 'Vazia',
  'check.detail.keywords.set': 'Configuradas',
  'check.detail.keywords.none': 'Nenhuma configurada',
  'check.detail.handle.claimed': '{handle}',
  'check.detail.handle.none': 'Não reivindicado',
  'check.detail.tags.detail': '{pct}% de {n} vídeos têm 3 tags ou mais',
  'check.detail.descriptions.detail': '{pct}% têm 250 caracteres ou mais',
  'check.detail.titles.detail': '{pct}% ficam na faixa de 30–70 caracteres',
  'check.detail.captions.detail': '{pct}% têm legendas',
  'check.detail.hd.detail': '{pct}% estão em HD',
  'check.detail.cadence.daily': 'Vários vídeos por dia, normalmente',
  'check.detail.cadence.everyDay': 'Um vídeo novo todo dia, normalmente',
  'check.detail.cadence.every': 'Um vídeo novo a cada {n} dias, normalmente',
  'check.detail.cadence.unknown': 'Histórico de publicação insuficiente para julgar',
  'check.detail.recency.today': 'Publicado hoje',
  'check.detail.recency.day': 'Último envio há 1 dia',
  'check.detail.recency.days': 'Último envio há {n} dias',
  'check.detail.recency.none': 'Nenhum envio encontrado',
  'check.detail.hitRate.detail': '{pct}% dos vídeos superam a mediana do próprio canal',
  'check.detail.reach.detail': 'O vídeo mediano alcança {pct}% do número de inscritos',
  'check.detail.reach.hidden': 'O número de inscritos está oculto neste canal',
  'check.detail.engagement.detail': '{pct}% de curtidas e comentários por visualização, normalmente',
  'check.detail.engagement.hidden': 'As curtidas e comentários estão ocultos neste canal',

  'check.fix.banner':
    'Adicione um banner de 2560×1440 — é a primeira coisa que um visitante novo vê.',
  'check.fix.about':
    'Escreva 200 caracteres ou mais explicando do que trata o canal e para quem ele é. Esse texto é pesquisável.',
  'check.fix.keywords':
    'Adicione palavras-chave no YouTube Studio → Configurações → Canal → Informações básicas.',
  'check.fix.handle': 'Reivindique um identificador para o canal ter uma URL memorável.',
  'check.fix.tags':
    '{missing} vídeos precisam de tags. As tags importam principalmente para esclarecer temas que o YouTube pode interpretar errado.',
  'check.fix.descriptions':
    'Descrições curtas não dão nada para o YouTube indexar. Busque 250 caracteres ou mais, com o tema declarado nas duas primeiras linhas.',
  'check.fix.titles':
    'Títulos com menos de 30 caracteres desperdiçam espaço na busca; acima de 70 são cortados antes do gancho.',
  'check.fix.captions':
    'Vídeos legendados são indexáveis e assistíveis sem som. As legendas automáticas contam, mas só se você não as desativar.',
  'check.fix.hd': 'Publique em 1080p ou melhor.',
  'check.fix.cadence':
    'Intervalos maiores que duas semanas custam o impulso algorítmico que torna cada envio mais fácil que o anterior.',
  'check.fix.recency':
    'Depois de três semanas de silêncio, o sistema de recomendação para de tratar o canal como ativo. Publicar qualquer coisa reinicia isso.',
  'check.fix.hit_rate':
    'A maioria dos envios fica abaixo da sua própria média, o que costuma significar que o catálogo é sustentado por poucas exceções. Estude o que elas têm em comum.',
  'check.fix.reach':
    'Os vídeos alcançam principalmente quem já é inscrito. Títulos e miniaturas que não pressupõem conhecimento prévio vão mais longe.',
  'check.fix.engagement':
    'Canais saudáveis ficam acima de 4,5%. Abaixo disso, o conteúdo é encontrado mas não conecta — peça a curtida na câmera e termine com uma pergunta que valha a resposta.',

  'app.search.ariaSubmit':'Auditar canal',

  // ---------- landing: hero ----------
  'landing.hero.kicker': 'Grátis · Resultado na hora · Apenas dados públicos',
  // Split because the design italicises the middle.
  'landing.hero.titleBefore': 'Descubra o que está segurando',
  'landing.hero.titleEm': 'o seu canal',
  'landing.hero.titleAfter': '',
  'landing.hero.sub':
    'Uma nota de saúde de 0 a 100 a partir de quatorze verificações automáticas, cada vídeo recente avaliado contra a sua própria média e uma análise escrita do que corrigir primeiro.',
  'landing.hero.note': 'Funciona em qualquer canal público — inclusive nos dos seus concorrentes.',

  // ---------- landing: the search form ----------
  'landing.form.placeholder': 'Nome do canal, @handle ou URL',
  'landing.form.ariaChannel': 'Nome, arroba ou ID do canal do YouTube',
  'landing.form.ariaDepth': 'Quantos vídeos recentes analisar',
  'landing.form.videos': '{n} vídeos',
  'landing.form.videosLocked': '{n} vídeos — criar conta',
  'landing.form.submit': 'Auditar canal',

  // ---------- landing: what gets checked ----------
  'landing.checks.heading': 'Checklist da auditoria de canal',
  'landing.checks.lede':
    'A sua nota reflete os seus vídeos mais recentes. Cada categoria avalia um sinal que o sistema de recomendação do YouTube realmente recompensa.',
  'landing.checks.setup.title': 'Configuração do canal',
  'landing.checks.setup.body':
    'Banner, seção Sobre, palavras-chave e arroba — os metadados que um novo visitante e o índice de busca leem primeiro.',
  'landing.checks.metadata.title': 'Metadados dos vídeos',
  'landing.checks.metadata.body':
    'Tags, tamanho da descrição, tamanho do título, legendas e qualidade de upload em todos os vídeos recentes.',
  'landing.checks.cadence.title': 'Constância de publicação',
  'landing.checks.cadence.body':
    'Com que regularidade você publica, medida pelo intervalo típico entre uploads em vez de uma média que uma única pausa consegue distorcer.',
  'landing.checks.recency.title': 'Publicação recente',
  'landing.checks.recency.body':
    'Há quanto tempo foi o último upload. Um canal pode ter publicado como um relógio por dois anos e mesmo assim ter parado — só a constância nunca perceberia isso.',
  'landing.checks.hitrate.title': 'Taxa de acerto',
  'landing.checks.hitrate.body':
    'Quantos vídeos superam a sua própria mediana — não um referencial global que pune canais pequenos por serem pequenos.',
  'landing.checks.reach.title': 'Alcance e engajamento',
  'landing.checks.reach.body':
    'Visualizações por inscrito, além de curtidas e comentários em relação às visualizações. Juntos, eles respondem se os vídeos chegam além de quem já é inscrito.',

  // ---------- landing: how it works ----------
  'landing.how.heading': 'Como funciona',
  'landing.how.lede': 'Nada para instalar, e cada ponto rastreável até uma verificação com nome.',
  'landing.how.stepsHeading': 'Três passos',
  'landing.how.step1.lead': 'Cole um canal.',
  'landing.how.step1.rest': 'Uma URL, uma @arroba ou o ID bruto do canal — os três funcionam.',
  'landing.how.step2.lead': 'Receba a nota na hora.',
  'landing.how.step2.rest':
    'A nota de saúde, o checklist e o gráfico de desempenho são calculados a partir de dados públicos, sem nenhum modelo envolvido e sem nada para esperar.',
  'landing.how.step3.lead': 'Leia a análise.',
  'landing.how.step3.rest':
    'Um clique transforma os números em texto claro: o que está funcionando, quais títulos reescrever e o que produzir em seguida.',

  // ---------- landing: the scorecard ----------
  'landing.scorecard.heading': 'As quatorze verificações e quanto vale cada uma',
  'landing.scorecard.note':
    'Um acerto parcial vale metade. Tudo o que a auditoria não consegue observar — curtidas ocultas, um canal novo demais para ter um ritmo de publicação — sai do total em vez de zerar, então a porcentagem sempre significa "quanto do que deu para ver estava em ordem".',
  'landing.scorecard.group.setup': 'Configuração do canal',
  'landing.scorecard.group.metadata': 'Metadados dos vídeos',
  'landing.scorecard.group.habits': 'Hábitos de publicação',
  'landing.scorecard.group.performance': 'Desempenho',

  // The "what earns the points" column.
  'landing.scorecard.banner': 'Banner do canal',
  'landing.scorecard.banner.earns': 'Enviado',
  'landing.scorecard.about': 'Seção Sobre',
  'landing.scorecard.about.earns': '{n}+ caracteres',
  'landing.scorecard.keywords': 'Palavras-chave do canal',
  'landing.scorecard.keywords.earns': 'Definidas no YouTube Studio',
  'landing.scorecard.handle': 'Arroba personalizada',
  'landing.scorecard.handle.earns': 'Registrada',
  'landing.scorecard.tags': 'Tags dos vídeos',
  'landing.scorecard.tags.earns': '{pct}% dos vídeos têm 3+ tags',
  'landing.scorecard.descriptions': 'Descrições dos vídeos',
  'landing.scorecard.descriptions.earns': '{pct}% chegam a {n}+ caracteres',
  'landing.scorecard.titles': 'Tamanho do título',
  'landing.scorecard.titles.earns': '{pct}% ficam entre 30 e 70 caracteres',
  'landing.scorecard.captions': 'Legendas',
  'landing.scorecard.captions.earns': '{pct}% têm legendas',
  'landing.scorecard.hd': 'Uploads em HD',
  'landing.scorecard.hd.earns': '{pct}% estão em 1080p ou melhor',
  'landing.scorecard.cadence': 'Constância de publicação',
  'landing.scorecard.cadence.earns': 'Um vídeo novo a cada {n} dias ou menos',
  'landing.scorecard.recency': 'Publicação recente',
  'landing.scorecard.recency.earns': 'Algo publicado nos últimos {n} dias',
  'landing.scorecard.hitRate': 'Taxa de acerto',
  'landing.scorecard.hitRate.earns': '{pct}% dos vídeos superam a mediana do canal',
  'landing.scorecard.vps': 'Visualizações por inscrito',
  'landing.scorecard.vps.earns': 'O vídeo mediano alcança {pct}% dos inscritos',
  'landing.scorecard.engagement': 'Engajamento',
  'landing.scorecard.engagement.earns': 'Curtidas e comentários acima de {pct}% das visualizações',

  // ---------- landing: FAQ ----------
  'landing.faq.heading': 'Perguntas',
  'landing.faq.lede': 'O que a nota significa e o que ela não consegue dizer.',
  'landing.faq.q1': 'Posso auditar um canal que não é meu?',
  'landing.faq.a1':
    'Pode. Tudo vem de dados públicos do YouTube, então você pode auditar qualquer canal — inclusive o de um concorrente.',
  'landing.faq.q2': 'Como a nota é calculada?',
  'landing.faq.a2':
    'Quatorze verificações, cada uma valendo um número fixo de pontos que somam 100. Passar vale os pontos cheios, um acerto parcial vale metade, e tudo o que não conseguimos observar é excluído em vez de contar contra você. Cada ponto é rastreável até uma verificação com nome nos seus resultados.',
  'landing.faq.q3': 'O que ela não enxerga?',
  'landing.faq.a3':
    'Retenção, taxa de cliques, impressões e fontes de tráfego ficam no YouTube Studio e exigem o login do dono do canal. Esta auditoria raciocina a partir de visualizações, títulos e metadados — genuinamente útil para identificar padrões de embalagem e de tema, mas não consegue dizer se um vídeo fracassou porque ninguém clicou na miniatura ou porque as pessoas saíram cedo.',
  'landing.faq.q4': 'Qual é a diferença em relação ao vidIQ ou ao TubeBuddy?',
  'landing.faq.a4':
    'Aqueles são pacotes completos de gestão de canal — pesquisa de palavras-chave, edição de tags em massa, monitoramento de concorrentes — e em geral pedem que você instale uma extensão de navegador e conecte a sua conta do YouTube. Este aqui é propositalmente mais estreito: cole a arroba de qualquer canal e receba uma auditoria pontuada do que está publicamente visível, sem nada para instalar e sem conta para conectar. Como ele lê apenas dados públicos, consegue auditar canais que não são seus, e essa é a troca nos dois sentidos: ele nunca vai te mostrar as métricas privadas do Studio que aquelas ferramentas revelam depois que você conecta a conta.',
  'landing.faq.q5': 'Existe uma ferramenta gratuita de auditoria de canal do YouTube?',
  'landing.faq.a5':
    'Esta é uma. Avaliar um canal não custa nada e não exige conta — você recebe a nota de saúde, o gráfico de desempenho medido contra a mediana do próprio canal e uma amostra do checklist. Uma conta gratuita libera a análise completa das quatorze verificações, varreduras mais profundas de até 100 vídeos e o relatório escrito.',
  'landing.faq.q6': 'Posso usar isto para analisar o canal de um concorrente?',
  'landing.faq.a6':
    'Pode, e é um dos usos mais úteis. Toda verificação funciona com dados públicos, então a auditoria de um concorrente sai exatamente igual à sua: quais vídeos deles superaram o desempenho típico, como os títulos e as descrições são construídos e quais partes da configuração ficaram por fazer.',
  'landing.faq.q7': 'Isto funciona para canais pequenos?',
  'landing.faq.a7':
    'Funciona, e foi feito para eles. Como cada verificação é avaliada contra a mediana do próprio canal em vez de um referencial global, um canal com 400 inscritos é medido pelo fato de os vídeos dele superarem o vídeo típico dele — não pelo fato de superarem alguém com um milhão. Nada aqui penaliza um canal por ser pequeno, e as verificações de configuração e de metadados são as que costumam pesar mais no começo.',
  'landing.faq.q8': 'Por que comparar com a minha própria mediana em vez de outros canais?',
  'landing.faq.a8':
    'Porque um vídeo com 10 mil visualizações é um triunfo em um canal e um desastre em outro. Avaliar contra a sua própria mediana mostra quais dos seus vídeos realmente se destacaram, e usar a mediana em vez da média impede que um único sucesso viral faça todo o resto parecer fracasso.',

  // ---------- landing: guides ----------
  'landing.guides.heading': 'Leia mais',
  'landing.guides.lede': 'Respostas mais longas sobre como a nota é construída e o que fazer com ela.',
  'landing.guides.free': 'O que a auditoria gratuita inclui',
  'landing.guides.score': 'Como a nota de 0 a 100 é calculada',
  'landing.guides.competitor': 'Analisar o canal de um concorrente',
  'landing.guides.small': 'Por que isto funciona para canais pequenos',
  'landing.guides.versus': 'Comparação com vidIQ e TubeBuddy',
  'landing.guides.checklist': 'As catorze verificações, ordenadas por prioridade',
  'landing.guides.views': 'Por que suas visualizações estão caindo',
  'landing.guides.upload': 'Com que frequência publicar',

  // ---------- landing: closing CTA ----------
  'landing.cta.heading': 'Transforme a nota em um plano',
  'landing.cta.sub':
    'A auditoria diz o que está errado em poucos segundos. Uma conta gratuita diz o que fazer a respeito.',
  'landing.cta.item1': 'As quatorze verificações, cada uma com o raciocínio e a correção',
  'landing.cta.item2': 'Varreduras de até 100 vídeos em vez de {n}',
  'landing.cta.item3':
    'Uma análise escrita: o que está funcionando, o que corrigir, o que produzir em seguida',
  'landing.cta.item4': 'Uma seção Sobre reescrita, redigida para você',
  'landing.cta.item5': 'Auditorias salvas, para você refazer um canal e ver o que mudou',
  'landing.cta.fine':
    'Sem cartão, sem extensão, sem login do YouTube — e continua funcionando em qualquer canal público, inclusive nos dos seus concorrentes.',
  'landing.cta.back': 'Voltar para a busca',

  // ---------- results ----------
  'results.newAudit': '← Nova auditoria',
  'results.favorite': 'Favoritar',
  'results.favorited': 'Favoritado',
  'results.saveFailed': 'Não foi possível salvar esta auditoria.',
  'results.auditing': 'Auditando {channel}',
  'results.auditingSub': 'Buscando os últimos {n} vídeos e avaliando cada um.',
  'results.auditFailed': 'Não foi possível auditar esse canal.',
  'results.unreachable': 'Não dá para alcançar o servidor. Ele está rodando na porta 8000?',
  'results.stopped': '[interrompido]',
  'results.download': 'Baixar .md',
  'results.writing': 'Escrevendo…',
  'results.report.heading': 'Quer a análise escrita?',
  'results.report.body':
    'Transforma os números acima em texto claro — o que está funcionando, quais títulos reescrever e o que produzir em seguida. Escrito por {provider}.',
  'results.report.noModel': 'Nenhum modelo configurado.',
  'results.report.write': 'Escrever o relatório',
  'results.report.locked.title': 'A análise escrita é para membros',
  'results.report.locked.body':
    'Transforma os números acima em texto claro — o que está funcionando, quais títulos reescrever e o que produzir em seguida. Grátis com uma conta.',

  // ---------- score card ----------
  'score.ariaRing': 'Nota de saúde {score} de 100, conceito {grade}',
  'score.lede': 'Nota de saúde do canal, a partir de {n} verificações automáticas.',
  'score.passed': 'aprovadas',
  'score.needWork': 'precisam de ajuste',
  'score.failed': 'reprovadas',
  'score.group.setup': 'Configuração do canal',
  'score.group.metadata': 'Metadados dos vídeos',
  'score.group.habits': 'Hábitos e alcance',
  'score.moreChecks': 'mais {n} verificações',
  'score.status.pass': 'aprovado',
  'score.status.warn': 'atenção',
  'score.status.fail': 'reprovado',
  'score.status.skip': 'ignorado',
  'score.aboutFixer.locked': 'Crie uma conta para gerar uma',

  // ---------- log in / sign up dialog ----------
  'auth.close': 'Fechar',
  'auth.signup.title': 'Crie uma conta',
  'auth.signup.sub': 'Salve suas auditorias e volte a elas depois.',
  'auth.login.title': 'Que bom te ver de novo',
  'auth.login.sub': 'Entre para ver suas auditorias salvas.',
  'auth.google': 'Continuar com o Google',
  'auth.or': 'ou',
  'auth.name': 'Nome',
  'auth.namePlaceholder': 'Seu nome',
  'auth.email': 'E-mail',
  'auth.password': 'Senha',
  'auth.submit.signup': 'Criar conta',
  'auth.submit.login': 'Entrar',
  'auth.busy': 'Processando…',
  'auth.haveAccount': 'Já tem uma conta?',
  'auth.noAccount': 'Ainda não tem uma conta?',
  'auth.switchToLogin': 'Entrar',
  'auth.switchToSignup': 'Criar conta',
  'auth.checkEmail.title': 'Confira seu e-mail',
  'auth.checkEmail.body': 'Enviamos um link de confirmação para {email}. Abra o link para terminar de criar sua conta.',
  'auth.checkEmail.ok': 'Entendi',
  'auth.error.rateLimit': 'Muitas tentativas agora. Espere alguns minutos e tente de novo.',
  'auth.error.alreadyRegistered': 'Esse e-mail já tem uma conta. Faça login.',
  'auth.error.invalidCredentials': 'Esse e-mail e essa senha não correspondem a nenhuma conta.',
  'auth.error.weakPassword': 'A senha precisa ter pelo menos 6 caracteres.',
}
