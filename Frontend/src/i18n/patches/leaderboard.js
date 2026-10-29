/* ═══════════════════════════════════════════════════════════════
   Patch — namespace: leaderboard (لوحة المتصدرين)
   يُدمج لاحقًا في translations.js تحت leaderboard: {...}
   ═══════════════════════════════════════════════════════════════ */

export const arLeaderboard = {
  title: 'لوحة المتصدرين',
  subtitle: 'أعلى المستخدمين نشاطاً في إعادة التدوير — مرتبين حسب إجمالي الوزن المُعاد',
  show: 'عرض',
  topN: 'أفضل {n}',
  emptyTitle: 'لا توجد بيانات',
  emptyMsg: 'لم يتم تسجيل أي عمليات تدوير بعد.',
  thRank: 'الترتيب',
  thUser: 'المستخدم',
  thLevel: 'المستوى',
  thWeight: 'الوزن المُعاد (كجم)',
  thDeposits: 'عدد العمليات',
  thRevenue: 'الإيرادات (ج.م)',
  thBalance: 'الرصيد الحالي',
  unitDeposits: 'عملية',
  help: 'مساعدة',
  helpTitle: 'إزاي بيشتغل لوحة الصدارة؟',
  helpBody: 'الصدارة بترتب المستخدمين حسب إجمالي الكيلوهات المتدورة. المراكز الأولى بياخدوا إنجازات ومكافآت إضافية، والترتيب بيتحدث تلقائيًا مع كل عملية إيداع مكتملة.',
};

export const enLeaderboard = {
  title: 'Leaderboard',
  subtitle: 'The most active recycling users — ranked by total recycled weight',
  show: 'Show',
  topN: 'Top {n}',
  emptyTitle: 'No data',
  emptyMsg: 'No recycling activity has been recorded yet.',
  thRank: 'Rank',
  thUser: 'User',
  thLevel: 'Level',
  thWeight: 'Recycled Weight (kg)',
  thDeposits: 'Deposits',
  thRevenue: 'Revenue (EGP)',
  thBalance: 'Current Balance',
  unitDeposits: 'deposits',
  help: 'Help',
  helpTitle: 'How the leaderboard works',
  helpBody: 'The leaderboard ranks users by total kilograms recycled. Top positions earn achievements and extra rewards, and the ranking updates automatically with every completed deposit.',
};
