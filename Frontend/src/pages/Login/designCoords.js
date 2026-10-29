/**
 * إحداثيات التصميم المعتمد (1536 × 1024) — أسلوب "pixel-perfect overlay".
 * box = [x0, y0, x1, y1] بوحدات بكسل التصميم، وتُحوَّل لنسب مئوية
 * حتى يظل كل عنصر تفاعلي مُحاذيًا لموضعه في التصميم على أي مقاس شاشة.
 */
export const DW = 1536;
export const DH = 1024;

export const px = (v) => `${(v / DW) * 100}%`;
export const py = (v) => `${(v / DH) * 100}%`;
/* حجم خط مرتبط بالارتفاع — يمنع تضخم النص عند نسب عرض مختلفة عن 3:2 */
export const vh = (v) => `${(v / DH) * 100}vh`;

export const boxStyle = (b) => ({
  left: px(b[0]),
  top: py(b[1]),
  width: `${((b[2] - b[0]) / DW) * 100}%`,
  height: `${((b[3] - b[1]) / DH) * 100}%`,
});
