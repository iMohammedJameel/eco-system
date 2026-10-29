class AppError extends Error {
    create(message, statusCode, statusText) {
        // كائن خطأ جديد لكل استدعاء — يمنع تشارك الحالة بين الأخطاء المتزامنة
        const err = new Error(message);
        err.statusCode = statusCode;
        err.statusText = statusText;
        return err;
    }
}

module.exports = new AppError();
