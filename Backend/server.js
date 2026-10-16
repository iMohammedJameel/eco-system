/** نقطة التشغيل — تفصل الـ app عن السيرفر ليسهل اختباره بـ supertest */
const app = require("./app");
const connectedDB = require("./config/db");

connectedDB();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server Is Running ${port}`);
});
