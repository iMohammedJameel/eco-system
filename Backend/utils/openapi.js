/**
 * OpenAPI spec — توثيق حي للـ API على /api/docs
 * (مكتوب يدويًا ليغطي كل المسارات الأساسية)
 */
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EcoCycle API",
      version: "1.1.0",
      description:
        "منصة إعادة التدوير الذكية — Backend API. التوثيق يغطي المسارات الأساسية. المصادقة عبر Bearer JWT (access token قصير العمر) + refresh cookie.",
    },
    servers: [
      { url: "/api", description: "السيرفر الحالي" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            msg: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
