const cos = Math.cos;
const sin = Math.sin;
const π = Math.PI;

function maxtrixTimes([[a, b], [c, d]], [x, y]) {
  return [a * x + b * y, c * x + d * y];
}

function rotateMatrix(x) {
  return [[cos(x), -sin(x)], [sin(x), cos(x)]];
}

function vecAdd([a1, a2], [b1, b2]) {
  return [a1 + b1, a2 + b2];
}

// http://xahlee.info/js/svg_circle_arc.html
export function svgEllipseArc([cx, cy], [rx, ry], [t1, Δ], φ) {
  /* [
  returns a SVG path element that represent a ellipse.
  cx,cy → center of ellipse
  rx,ry → major minor radius
  t1 → start angle, in radian.
  Δ → angle to sweep, in radian. positive.
  φ → rotation on the whole, in radian
  URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
  Version 2019-06-19
   ] */
  Δ = Δ % (2*π);
  const rotMatrix = rotateMatrix(φ);
  const [sX, sY] = vecAdd(maxtrixTimes(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx,cy]);
  const [eX, eY] = vecAdd(maxtrixTimes(rotMatrix, [rx * cos(t1+Δ), ry * sin(t1+Δ)]), [cx, cy]);
  const fA = Δ > π ? 1 : 0;
  const fS = Δ > 0 ? 1 : 0;
  
  return "M " + sX + " " + sY + " A " + [ rx , ry , φ / (2*π) *360, fA, fS, eX, eY ].join(" ");
};

