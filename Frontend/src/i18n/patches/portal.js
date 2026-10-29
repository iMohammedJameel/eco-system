/* ═══════════════════════════════════════════════════════════════
   باتش ترجمة بوابة الشريك — namespace: portal
   يُدمج لاحقًا في src/i18n/translations.js تحت المفتاح portal
   الوحدات (ج.م) تمرّ كـ {unit} من dashboard.egp
   حالات الكوبون (issued/redeemed/cancelled) مفاتيح couponXxx
   ═══════════════════════════════════════════════════════════════ */

export const arPortal = {
  /* ── رأس الصفحة ── */
  title: 'بوابة الشريك',
  subtitle: 'إدارة عروض الخصم ومتابعة الأداء',
  headerTitle: '{name} — بوابة الشريك',
  headerSubtitle: '{category} · {n} عرض نشط',
  addOffer: 'إضافة عرض',
  pickerLabel: 'عرض بوابة شريك آخر (وضع الإدارة)',

  /* ── صفحة دخول الشريك ── */
  loginBrandTitle: 'بوابة الشركاء',
  loginBrandSub: 'سجّل الدخول لإدارة عروضك واستبدال كوبونات عملائك',
  loginBtn: 'دخول الشركاء',
  loginFailed: 'فشل تسجيل دخول الشريك',
  userLoginLink: 'دخول المواطن',

  /* ── إحصائيات الشريك الحقيقي ── */
  statActive: 'كوبونات نشطة',
  statRedeemed: 'كوبونات مستبدلة',
  statExpired: 'كوبونات منتهية',
  statPoints: 'نقاط مستبدلة',

  /* ── حالات فارغة ── */
  noPartnersTitle: 'لا يوجد شركاء بعد',
  noPartnersMsg: 'أضف شريكًا أولًا من صفحة الشركاء ثم عد لهنا لإدارة عروضه.',
  noAccountTitle: 'حساب الشريك غير موجود',
  noAccountMsg: 'تواصل مع إدارة EcoCycle لتفعيل حساب بوابة الشركاء الخاص بك.',
  offersEmptyTitle: 'لا توجد عروض بعد',
  offersEmptyMsg: 'أنشئ أول عرض خصم لك لجذب عملاء مهتمين بالبيئة.',
  offersEmptyAction: '+ إضافة عرض',

  /* ── رسائل Toast ── */
  updatedToast: 'تم تحديث العرض',
  addedToast: 'تمت إضافة العرض',
  saveFailed: 'فشل حفظ العرض',
  deletedToast: 'تم حذف العرض',
  deleteFailed: 'فشل حذف العرض',
  statusToast: 'تم تحديث حالة العرض',
  toggleFailed: 'فشل تحديث العرض',

  /* ── تأكيد حذف العرض ── */
  deleteOfferTitle: 'حذف العرض',
  deleteOfferMsg: 'هل أنت متأكد من حذف عرض "{title}"؟ لا يمكن التراجع عن هذا الإجراء.',

  /* ── كارت العرض ── */
  discountPct: 'خصم {n}%',
  discountFixed: 'خصم {n} {unit}',
  stopped: 'متوقف',
  minSpend: 'أقل مشتريات: {n} {unit}',
  validUntil: 'صالح حتى: {date}',
  deactivate: 'إيقاف',
  activate: 'تنشيط',

  /* ── نموذج العرض ── */
  editTitle: 'تعديل العرض',
  addTitle: 'إضافة عرض جديد',
  fTitle: 'عنوان العرض',
  fTitlePh: 'مثال: خصم 10% على البقالة',
  fDesc: 'الوصف',
  fDiscountType: 'نوع الخصم',
  typePercentage: 'نسبة مئوية (%)',
  typeFixed: 'مبلغ ثابت ({unit})',
  fDiscountValue: 'قيمة الخصم',
  fMinSpend: 'الحد الأدنى للشراء ({unit})',
  fValidUntil: 'صالح حتى',
  fStatus: 'حالة العرض',
  saveEdit: 'حفظ التعديلات',
  addConfirm: 'إضافة العرض',

  /* ── كوبونات الشريك ── */
  couponsTitle: 'كوبونات الشريك',
  couponsCount: '{n} كوبون',
  couponsLoading: 'جارٍ تحميل الكوبونات...',
  couponsLoadFailed: 'تعذر تحميل الكوبونات',
  couponsEmpty: 'لا توجد كوبونات بعد — أول ما الأدمن يصدر كوبون لمستخدم عندك هيظهر هنا',
  pointsCost: '{n} نقطة',
  couponIssued: 'مُصدر',
  couponRedeemed: 'مُستبدل',
  couponCancelled: 'ملغي',
  confirmRedeem: 'تأكيد الاستبدال',
  redeemedToast: 'تم تأكيد استبدال الكوبون {code}',

  /* ── متفرقات ── */
  help: 'مساعدة',
  helpTitle: 'دليل بوابة الشريك',
  helpBody: 'من البوابة دي الشريك بيتابع استهلاك كوبوناته لحظة بلحظة، وبيضيف عروضًا جديدة بخصومات مختلفة. كل كوبون مستخدم بيتسجل برقمه وتاريخ استخدامه عشان التقارير تطلع مظبوطة.',
};

export const enPortal = {
  /* ── Page header ── */
  title: 'Partner Portal',
  subtitle: 'Manage discount offers and track performance',
  headerTitle: '{name} — Partner Portal',
  headerSubtitle: '{category} · {n} active offers',
  addOffer: 'Add Offer',
  pickerLabel: 'View another partner portal (admin mode)',

  /* ── Partner login page ── */
  loginBrandTitle: 'Partner Portal',
  loginBrandSub: 'Sign in to manage your offers and redeem your customers coupons',
  loginBtn: 'Partner sign in',
  loginFailed: 'Partner sign in failed',
  userLoginLink: 'Citizen login',

  /* ── Real partner stats ── */
  statActive: 'Active coupons',
  statRedeemed: 'Redeemed coupons',
  statExpired: 'Expired coupons',
  statPoints: 'Points redeemed',

  /* ── Empty states ── */
  noPartnersTitle: 'No partners yet',
  noPartnersMsg: 'Add a partner from the Partners page first, then come back here to manage their offers.',
  noAccountTitle: 'Partner account not found',
  noAccountMsg: 'Contact EcoCycle management to activate your partner portal account.',
  offersEmptyTitle: 'No offers yet',
  offersEmptyMsg: 'Create your first discount offer to attract eco-conscious customers.',
  offersEmptyAction: '+ Add Offer',

  /* ── Toast messages ── */
  updatedToast: 'Offer updated successfully',
  addedToast: 'Offer added successfully',
  saveFailed: 'Failed to save the offer',
  deletedToast: 'Offer deleted',
  deleteFailed: 'Failed to delete the offer',
  statusToast: 'Offer status updated',
  toggleFailed: 'Failed to update the offer',

  /* ── Delete offer confirmation ── */
  deleteOfferTitle: 'Delete Offer',
  deleteOfferMsg: 'Are you sure you want to delete the offer "{title}"? This action cannot be undone.',

  /* ── Offer card ── */
  discountPct: '{n}% off',
  discountFixed: '{n} {unit} off',
  stopped: 'Stopped',
  minSpend: 'Min. spend: {n} {unit}',
  validUntil: 'Valid until: {date}',
  deactivate: 'Deactivate',
  activate: 'Activate',

  /* ── Offer form ── */
  editTitle: 'Edit Offer',
  addTitle: 'Add New Offer',
  fTitle: 'Offer Title',
  fTitlePh: 'e.g. 10% off groceries',
  fDesc: 'Description',
  fDiscountType: 'Discount Type',
  typePercentage: 'Percentage (%)',
  typeFixed: 'Fixed amount ({unit})',
  fDiscountValue: 'Discount Value',
  fMinSpend: 'Minimum Spend ({unit})',
  fValidUntil: 'Valid Until',
  fStatus: 'Offer Status',
  saveEdit: 'Save Changes',
  addConfirm: 'Add Offer',

  /* ── Partner coupons ── */
  couponsTitle: 'Partner Coupons',
  couponsCount: '{n} coupons',
  couponsLoading: 'Loading coupons...',
  couponsLoadFailed: 'Failed to load coupons',
  couponsEmpty: 'No coupons yet — once an admin issues a coupon to one of your users, it will appear here',
  pointsCost: '{n} points',
  couponIssued: 'Issued',
  couponRedeemed: 'Redeemed',
  couponCancelled: 'Cancelled',
  confirmRedeem: 'Confirm Redemption',
  redeemedToast: 'Coupon {code} redemption confirmed',

  /* ── Misc ── */
  help: 'Help',
  helpTitle: 'Partner portal guide',
  helpBody: 'From this portal the partner tracks coupon usage in real time and adds new offers with different discounts. Every redeemed coupon is logged with its code and redemption date so reports come out accurate.',
};
