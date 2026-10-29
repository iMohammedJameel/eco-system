/**
 * حماية مدخلات البحث من حقن Regular Expressions.
 * أي رمز خاص (.*+?^${}()|[]\) يتم تهريبه حتى يُطابق حرفيًا.
 */
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * يبني شرط بحث نصي $or فوق حقول محددة (case-insensitive).
 * مثال: searchQuery(["name", "governorate"], "kazyon")
 * → { $or: [{ name: /kazyon/i }, { governorate: /kazyon/i }] }
 */
function searchQuery(fields, term) {
  const rx = new RegExp(escapeRegex(term), "i");
  return { $or: fields.map((field) => ({ [field]: rx })) };
}

module.exports = { escapeRegex, searchQuery };
