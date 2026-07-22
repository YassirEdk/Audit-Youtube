/**
 * Arabic (Modern Standard Arabic) catalogue.
 * Translated from en.js — same key set, same order.
 * Western digits (0-9) throughout, matching the app's number formatter.
 */

export const ar = {
  // ---------- shared ----------
  'common.retry': 'حاول مرة أخرى',
  'common.stop': 'إيقاف',
  'common.copy': 'نسخ',
  'common.copied': 'تم النسخ',
  'common.loading': 'جارٍ التحميل…',

  // ---------- masthead ----------
  'nav.home': 'الرئيسية',
  'nav.checks': 'قائمة الفحص',
  'nav.how': 'كيف يعمل',
  'nav.faq': 'أسئلة شائعة',
  'nav.guides': 'اقرأ المزيد',
  'nav.brandAria': 'الصفحة الرئيسية لتدقيق القناة',
  'nav.sectionsAria': 'الأقسام',
  'nav.donate': 'ادعمني بتبرع',
  'nav.donateTitle': 'ادعم هذا المشروع',
  'nav.login': 'تسجيل الدخول',
  'nav.signup': 'إنشاء حساب',
  'nav.account': 'الحساب',
  'nav.signOut': 'تسجيل الخروج',

  'nav.language': 'اللغة',
  'nav.languageAria': 'اختر لغة',

  // ---------- app chrome ----------
  'app.title': 'تدقيق قنوات YouTube — قيّم أي قناة',
  'app.serverDown.lead': 'الخادم لا يعمل.',
  'app.serverDown.rest':
    'شغّله بالنقر المزدوج على {file}، ثم أعد تحميل هذه الصفحة.',
  'app.footer':
    'يُقاس الأداء بالمقارنة مع وسيط المشاهدات الخاص بكل قناة، حتى لا يجعل فيديو واحد منتشر بقية الفيديوهات تبدو فاشلة. بيانات عامة فقط — بلا معدّل الاستبقاء أو CTR أو مصادر الزيارات.',
  'app.search.another': 'دقّق قناة أخرى',
  'app.search.ariaChannel': 'القناة المراد تدقيقها',
  'app.search.ariaSubmit': 'تدقيق القناة',

  // ---------- landing: hero ----------
  'landing.hero.kicker': 'مجاني · نتائج فورية · بيانات عامة فقط',
  'landing.hero.titleBefore': 'اكتشف ما الذي يعيق',
  'landing.hero.titleEm': 'قناتك',
  'landing.hero.titleAfter': 'عن التقدّم',
  'landing.hero.sub':
    'درجة صحة من 100 مبنية على أربعة عشر فحصاً آلياً، وتقييم لكل فيديو حديث بالمقارنة مع متوسط قناتك نفسها، وتحليل مكتوب لما ينبغي إصلاحه أولاً.',
  'landing.hero.note': 'يعمل مع أي قناة عامة — بما في ذلك قنوات منافسيك.',

  // @handle stays wrapped in U+2066/U+2069 isolates: it is an ASCII
  // token inside an Arabic line, and without them the '@' migrates to
  // the far end of the run.
  'landing.form.placeholder': 'اسم القناة أو ⁦@handle⁩ أو رابط',
  'landing.form.ariaChannel': 'اسم قناة YouTube أو المعرّف أو الرقم التعريفي',
  'landing.form.ariaDepth': 'عدد الفيديوهات الحديثة المراد تحليلها',
  'landing.form.videos': '{n} فيديو',
  'landing.form.videosLocked': '{n} فيديو — أنشئ حساباً',
  'landing.form.submit': 'تدقيق القناة',

  // ---------- landing: what gets checked ----------
  'landing.checks.heading': 'قائمة فحص تدقيق القناة',
  'landing.checks.lede':
    'تعكس درجتك أحدث فيديوهاتك. كل فئة تقيس إشارة يكافئها نظام التوصيات في YouTube فعلاً.',
  'landing.checks.setup.title': 'إعداد القناة',
  'landing.checks.setup.body':
    'صورة الغلاف وقسم "نبذة" والكلمات المفتاحية والمعرّف — وهي البيانات التي يقرأها الزائر الجديد ومحرك البحث أولاً.',
  'landing.checks.metadata.title': 'بيانات الفيديو',
  'landing.checks.metadata.body':
    'الوسوم وطول الوصف وطول العنوان والترجمات وجودة الرفع في كل فيديو حديث.',
  'landing.checks.cadence.title': 'انتظام النشر',
  'landing.checks.cadence.body':
    'مدى انتظامك في النشر، مقيساً بالفجوة المعتادة بين الفيديوهات بدلاً من متوسط قد يشوّهه انقطاع واحد.',
  'landing.checks.recency.title': 'حداثة النشر',
  'landing.checks.recency.body':
    'كم مضى على آخر فيديو. قد تنشر قناة بانتظام تام لمدة عامين ثم تصمت — والانتظام وحده لن يكشف ذلك أبداً.',
  'landing.checks.hitrate.title': 'معدّل النجاح',
  'landing.checks.hitrate.body':
    'كم فيديو تجاوز وسيط قناتك أنت — لا معياراً عالمياً يعاقب القنوات الصغيرة على صغرها.',
  'landing.checks.reach.title': 'الوصول والتفاعل',
  'landing.checks.reach.body':
    'المشاهدات لكل مشترك، إضافة إلى الإعجابات والتعليقات نسبةً إلى المشاهدات. معاً تجيبان عمّا إذا كانت الفيديوهات تتجاوز جمهور المشتركين الحالي.',

  // ---------- landing: how it works ----------
  'landing.how.heading': 'كيف يعمل',
  'landing.how.lede': 'لا شيء يُثبَّت، وكل نقطة يمكن تتبّعها إلى فحص محدد بالاسم.',
  'landing.how.stepsHeading': 'ثلاث خطوات',
  'landing.how.step1.lead': 'الصق رابط قناة.',
  'landing.how.step1.rest': 'رابط أو @معرّف أو رقم تعريفي للقناة — الثلاثة تعمل.',
  'landing.how.step2.lead': 'احصل على الدرجة فوراً.',
  'landing.how.step2.rest':
    'تُحسب درجة الصحة وقائمة الفحص ومخطط الأداء من بيانات عامة، دون أي نموذج ذكاء اصطناعي ودون انتظار.',
  'landing.how.step3.lead': 'اقرأ التحليل.',
  'landing.how.step3.rest':
    'نقرة واحدة تحوّل الأرقام إلى كلام واضح: ما الذي ينجح، وأي العناوين يحتاج إعادة صياغة، وما الذي تصنعه لاحقاً.',

  // ---------- landing: the scorecard ----------
  'landing.scorecard.heading': 'الفحوص الأربعة عشر جميعها، وقيمة كل منها',
  'landing.scorecard.note':
    'النجاح الجزئي يمنح نصف النقاط. وأي شيء لا يستطيع التدقيق ملاحظته — مثل إخفاء عدد الإعجابات، أو قناة جديدة لم يتشكّل لها إيقاع نشر بعد — يُحذف من المجموع بدل أن يُحتسب صفراً، حتى تظل النسبة تعني دائماً "كم كان سليماً مما أمكن رؤيته".',
  'landing.scorecard.group.setup': 'إعداد القناة',
  'landing.scorecard.group.metadata': 'بيانات الفيديو',
  'landing.scorecard.group.habits': 'عادات النشر',
  'landing.scorecard.group.performance': 'الأداء',

  'landing.scorecard.banner': 'صورة غلاف القناة',
  'landing.scorecard.banner.earns': 'مرفوعة',
  'landing.scorecard.about': 'قسم "نبذة"',
  'landing.scorecard.about.earns': '{n} حرف أو أكثر',
  'landing.scorecard.keywords': 'الكلمات المفتاحية للقناة',
  'landing.scorecard.keywords.earns': 'مضبوطة في YouTube Studio',
  'landing.scorecard.handle': 'معرّف مخصص',
  'landing.scorecard.handle.earns': 'محجوز',
  'landing.scorecard.tags': 'وسوم الفيديو',
  'landing.scorecard.tags.earns': '{pct}% من الفيديوهات تحمل 3 وسوم أو أكثر',
  'landing.scorecard.descriptions': 'أوصاف الفيديوهات',
  'landing.scorecard.descriptions.earns': '{pct}% تبلغ {n} حرف أو أكثر',
  'landing.scorecard.titles': 'طول العنوان',
  'landing.scorecard.titles.earns': '{pct}% ضمن 30–70 حرفاً',
  'landing.scorecard.captions': 'الترجمات',
  'landing.scorecard.captions.earns': '{pct}% مزوّدة بترجمة',
  'landing.scorecard.hd': 'الرفع بدقة عالية',
  'landing.scorecard.hd.earns': '{pct}% بدقة 1080p أو أعلى',
  'landing.scorecard.cadence': 'انتظام النشر',
  'landing.scorecard.cadence.earns': 'فيديو جديد كل {n} يوم أو أقل',
  'landing.scorecard.recency': 'حداثة النشر',
  'landing.scorecard.recency.earns': 'نشر شيء خلال آخر {n} يوم',
  'landing.scorecard.hitRate': 'معدّل النجاح',
  'landing.scorecard.hitRate.earns': '{pct}% من الفيديوهات تتجاوز وسيط القناة',
  'landing.scorecard.vps': 'المشاهدات لكل مشترك',
  'landing.scorecard.vps.earns': 'الفيديو الوسيط يصل إلى {pct}% من المشتركين',
  'landing.scorecard.engagement': 'التفاعل',
  'landing.scorecard.engagement.earns': 'الإعجابات والتعليقات تتجاوز {pct}% من المشاهدات',

  // ---------- landing: FAQ ----------
  'landing.faq.heading': 'أسئلة',
  'landing.faq.lede': 'ما الذي تعنيه الدرجة، وما الذي لا يستطيع هذا التدقيق إخبارك به.',
  'landing.faq.q1': 'هل يمكنني تدقيق قناة لا أملكها؟',
  'landing.faq.a1':
    'نعم. كل شيء مصدره بيانات YouTube العامة، فيمكنك تدقيق أي قناة — بما فيها قناة منافس.',
  'landing.faq.q2': 'كيف تُحسب الدرجة؟',
  'landing.faq.a2':
    'أربعة عشر فحصاً، لكل منها عدد ثابت من النقاط مجموعها 100. النجاح يمنح النقاط كاملة، والنجاح الجزئي يمنح نصفها، وما لا يمكننا ملاحظته يُستبعد بدل أن يُحتسب ضدك. وكل نقطة يمكن تتبّعها إلى فحص محدد بالاسم في نتائجك.',
  'landing.faq.q3': 'ما الذي لا يستطيع رؤيته؟',
  'landing.faq.a3':
    'معدّل الاستبقاء ونسبة النقر CTR ومرات الظهور ومصادر الزيارات كلها داخل YouTube Studio وتتطلب تسجيل دخول مالك القناة. هذا التدقيق يستنتج من المشاهدات والعناوين والبيانات الوصفية — وهو مفيد فعلاً لرصد أنماط التغليف والمواضيع، لكنه لا يستطيع إخبارك إن كان الفيديو قد أخفق لأن الصورة المصغّرة لم تُنقر أم لأن المشاهدين غادروا مبكراً.',
  'landing.faq.q4': 'بم يختلف هذا عن vidIQ أو TubeBuddy؟',
  'landing.faq.a4':
    'تلك حزم كاملة لإدارة القنوات — بحث في الكلمات المفتاحية، وتحرير جماعي للوسوم، وتتبّع للمنافسين — وهي عادةً تطلب منك تثبيت إضافة متصفح وربط حسابك في YouTube. أما هذا فأضيق نطاقاً عن قصد: الصق معرّف أي قناة واحصل على تدقيق مُقيَّم لما هو ظاهر للعموم، دون تثبيت شيء ودون ربط حساب. ولأنه يقرأ البيانات العامة وحدها، يستطيع تدقيق قنوات لا تملكها، وهذه هي المقايضة في الاتجاهين: لن يعرض لك أبداً مقاييس Studio الخاصة التي تكشفها تلك الأدوات بعد الربط.',
  'landing.faq.q5': 'هل توجد أداة مجانية لتدقيق قنوات YouTube؟',
  'landing.faq.a5':
    'هذه واحدة منها. تقييم قناة لا يكلّف شيئاً ولا يحتاج حساباً — تحصل على درجة الصحة، ومخطط الأداء مقيساً بوسيط القناة نفسها، وعيّنة من قائمة الفحص. والحساب المجاني يفتح التحليل الكامل للفحوص الأربعة عشر، وفحصاً أعمق يصل إلى 100 فيديو، والتقرير المكتوب.',
  'landing.faq.q6': 'هل يمكنني استخدام هذا لتحليل قناة منافس؟',
  'landing.faq.a6':
    'نعم، وهي من أنفع طرق استخدامه. كل فحص يعمل على بيانات عامة، فتدقيق قناة منافس يقرأ تماماً كتدقيق قناتك: أي فيديوهاتهم تجاوز أداءهم المعتاد، وكيف تُبنى عناوينهم وأوصافهم، وأي أجزاء من إعداد قناتهم ما زالت ناقصة.',
  'landing.faq.q7': 'هل يصلح هذا للقنوات الصغيرة؟',
  'landing.faq.a7':
    'نعم، بل هو مصمم لها. لأن كل فحص يُقاس بوسيط القناة نفسها لا بمعيار عالمي، فإن قناة لديها 400 مشترك تُقاس بما إذا كانت فيديوهاتها تتجاوز فيديوهاتها المعتادة — لا بما إذا كانت تتجاوز قناة لديها مليون. لا شيء هنا يعاقب قناة على صغرها، وفحوص الإعداد والبيانات الوصفية هي الأكثر أهمية عادةً في البدايات.',
  'landing.faq.q8': 'لماذا تقارنون بوسيط قناتي بدل قنوات أخرى؟',
  'landing.faq.a8':
    'لأن فيديو بعشرة آلاف مشاهدة انتصار على قناة وكارثة على أخرى. القياس بوسيطك أنت يخبرك أي فيديوهاتك تفوّق فعلاً، واستخدام الوسيط بدل المتوسط يمنع نجاحاً واحداً منتشراً من أن يجعل كل ما عداه يبدو فشلاً.',

  // ---------- landing: guides ----------
  'landing.guides.heading': 'اقرأ المزيد',
  'landing.guides.lede': 'إجابات أطول عن كيفية بناء الدرجة وما تفعله بها.',
  'landing.guides.englishOnly': 'بالإنجليزية',

  // ---------- landing: closing CTA ----------
  'landing.cta.heading': 'حوّل الدرجة إلى خطة',
  'landing.cta.sub':
    'التدقيق يخبرك بالخلل في ثوانٍ. والحساب المجاني يخبرك بما تفعله حياله.',
  'landing.cta.item1': 'الفحوص الأربعة عشر كاملة، مع سبب كل نتيجة وطريقة إصلاحها',
  'landing.cta.item2': 'فحص يصل إلى 100 فيديو بدل {n}',
  'landing.cta.item3':
    'تحليل مكتوب: ما الذي ينجح، وما الذي يحتاج إصلاحاً، وما الذي تصنعه لاحقاً',
  'landing.cta.item4': 'صياغة جديدة لقسم "نبذة"، مكتوبة لك',
  'landing.cta.item5': 'حفظ عمليات التدقيق، لتعيد فحص القناة وترى ما الذي تغيّر',
  'landing.cta.fine':
    'بلا بطاقة، بلا إضافة متصفح، بلا تسجيل دخول إلى YouTube — ومع ذلك يعمل مع أي قناة عامة، بما في ذلك قنوات منافسيك.',
  'landing.cta.back': 'العودة إلى البحث',

  // ---------- results ----------
  'results.newAudit': 'تدقيق جديد →',
  'results.favorite': 'إضافة إلى المفضلة',
  'results.favorited': 'في المفضلة',
  'results.saveFailed': 'تعذّر حفظ هذا التدقيق.',
  'results.auditing': 'جارٍ تدقيق {channel}',
  'results.auditingSub': 'جارٍ جلب آخر {n} فيديو وتقييمها.',
  'results.auditFailed': 'تعذّر تدقيق تلك القناة.',
  'results.unreachable': 'تعذّر الوصول إلى الخادم. هل يعمل على المنفذ 8000؟',
  'results.stopped': '[أُوقف]',
  'results.download': 'تنزيل ملف .md',
  'results.writing': 'جارٍ الكتابة…',
  'results.report.heading': 'هل تريد التحليل المكتوب؟',
  'results.report.body':
    'يحوّل الأرقام أعلاه إلى كلام واضح — ما الذي ينجح، وأي العناوين يحتاج إعادة صياغة، وما الذي تصنعه لاحقاً. بقلم {provider}.',
  'results.report.noModel': 'لا يوجد نموذج مُعدّ.',
  'results.report.write': 'اكتب التقرير',
  'results.report.locked.title': 'التحليل المكتوب متاح للأعضاء',
  'results.report.locked.body':
    'يحوّل الأرقام أعلاه إلى كلام واضح — ما الذي ينجح، وأي العناوين يحتاج إعادة صياغة، وما الذي تصنعه لاحقاً. مجاناً مع حساب.',

  // ---------- score card ----------
  'score.ariaRing': 'درجة الصحة {score} من 100، التقدير {grade}',
  'score.lede': 'درجة صحة القناة، من {n} فحصاً آلياً.',
  'score.passed': 'ناجح',
  'score.needWork': 'يحتاج عملاً',
  'score.failed': 'فاشل',
  'score.group.setup': 'إعداد القناة',
  'score.group.metadata': 'بيانات الفيديو',
  'score.group.habits': 'العادات والوصول',
  'score.moreChecks': '{n} فحوص أخرى',
  'score.status.pass': 'ناجح',
  'score.status.warn': 'تحذير',
  'score.status.fail': 'فاشل',
  'score.status.skip': 'متخطى',
  'score.aboutFixer.locked': 'أنشئ حساباً لكتابة واحد',
}
