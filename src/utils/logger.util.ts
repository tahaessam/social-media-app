export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

/*
========================================================
LOG LEVELS (مستويات اللوج)
========================================================
- INFO  → معلومات عادية عن سير عمل التطبيق (request نجح / عملية تمت)
- WARN  → تحذير إن في حاجة مش طبيعية لكنها مش بتكسر النظام
- ERROR → خطأ فعلي حصل وبيأثر على التنفيذ
- DEBUG → تفاصيل عميقة للتطوير فقط (مش بتظهر في production)

الفكرة: بنقسم الأحداث حسب أهميتها عشان نقدر نفلترها ونفهم النظام
بسهولة بدل ما كل حاجة تبقى console.log واحدة.
========================================================
*/

export class Logger {
  private static formatMessage(
    level: LogLevel,
    message: string,
    meta?: any
  ): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";

    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  /*
  ========================================================
  FORMAT MESSAGE (تنسيق الرسالة)
  ========================================================
  الوظيفة دي بتبني شكل موحد لكل logs في التطبيق:

  الشكل النهائي:
  [timestamp] LEVEL: message | meta

  مثال:
  [2026-04-13T12:00:00Z] ERROR: DB failed | {"stack":"..."}
  
  الفايدة:
  - توحيد شكل كل اللوجات
  - يسهل البحث والتحليل
  - مناسب للـ production logging systems
  ========================================================
  */

  static info(message: string, meta?: any) {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  /*
  ========================================================
  INFO LOG
  ========================================================
  بيستخدم لعرض الأحداث الطبيعية في النظام:

  أمثلة:
  - user logged in
  - request succeeded
  - file uploaded

  الهدف:
  متابعة سير النظام بشكل طبيعي بدون panic
  ========================================================
  */

  static warn(message: string, meta?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  /*
  ========================================================
  WARN LOG
  ========================================================
  بيستخدم لما يكون في حاجة مش طبيعية لكن النظام لسه شغال

  أمثلة:
  - محاولة تسجيل دخول فاشلة
  - rate limit قرب يخلص
  - deprecated API usage

  الهدف:
  نرصد مشاكل قبل ما تبقى errors
  ========================================================
  */

  static error(message: string, error?: Error | any) {
    const meta = error
      ? { error: error.message, stack: error.stack }
      : undefined;

    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  /*
  ========================================================
  ERROR LOG
  ========================================================
  ده أهم نوع لوج عندك

  بيستخدم لما يحصل:
  - crash في API
  - DB error
  - validation failure critical

  بيضيف:
  - message
  - stack trace
  - error details

  الهدف:
  تشخيص المشاكل بسرعة في production
  ========================================================
  */

  static debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  /*
  ========================================================
  DEBUG LOG
  ========================================================
  بيظهر فقط في development mode

  بيستخدم لـ:
  - تتبع flow بتاع الكود
  - مراقبة variables
  - فهم execution step-by-step

  في production:
  ❌ بيتقفل عشان الأداء والأمان

  الهدف:
  مساعدة المطور أثناء البناء فقط
  ========================================================
  */
}