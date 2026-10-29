/** ثوابت عرض الإنجازات (Gamification) — التسميات عبر labelKey وتُترجم في مواقع الاستخدام */

/** أسماء أيقونات lucide الصالحة لشارة الإنجاز — بترندر عبر <Icon name=... /> */
export const ICON_OPTIONS = [
  { value: 'sprout', labelKey: 'achievements.iconSprout' },
  { value: 'leaf',   labelKey: 'achievements.iconLeaf' },
  { value: 'trophy', labelKey: 'achievements.iconTrophy' },
  { value: 'gem',    labelKey: 'achievements.iconGem' },
  { value: 'coins',  labelKey: 'achievements.iconCoins' },
  { value: 'medal',  labelKey: 'achievements.iconMedal' },
  { value: 'star',   labelKey: 'achievements.iconStar' },
  { value: 'zap',    labelKey: 'achievements.iconZap' },
];

export const METRIC_OPTIONS = [
  { value: 'totalDeposits',  labelKey: 'achievements.metricTotalDeposits' },
  { value: 'depositsCount',  labelKey: 'achievements.metricDepositsCount' },
  { value: 'balance',        labelKey: 'achievements.metricBalance' },
  { value: 'co2Saved',       labelKey: 'achievements.metricCo2Saved' },
];

export const METRIC_LABEL_KEYS = Object.fromEntries(METRIC_OPTIONS.map((o) => [o.value, o.labelKey]));

export const METRIC_UNIT_KEYS = {
  totalDeposits: 'dashboard.kg',
  depositsCount: 'achievements.unitDeposits',
  balance: 'dashboard.egp',
  co2Saved: 'dashboard.kg',
};

export const EMPTY_FORM = {
  name: '',
  description: '',
  icon: "sprout",
  metric: "totalDeposits",
  threshold: "",
  xpReward: "",
  badgeColor: "#0d6c3d",
  isActive: true,
};
