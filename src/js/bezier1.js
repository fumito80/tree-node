'use strict';

function getTemplate(selector) {
  return document.importNode($('template')[0].content.querySelector(selector), true);
}

function setD(pathes, d) {
  [...pathes].map(path => path.setAttribute('d', d.flat(1).join(' ')));
}

function get4ponitsBezier(t, m, c0, c1, c2) {
  const p = (1 - t) ** 3 * m + 3 * (1 - t) ** 2 * t * c0 + 3 * (1 - t) * t ** 2 * c1 + t ** 3 * c2;
  return Math.round(p * 1E+3) / 1E+3;
}

function cubic(a, b1, c1, d1) {

  const b = b1 / a;
  const c = c1 / a;
  const d = d1 / a;
  const q = (3 * c - (b * b)) / 9;
  const r = (- (27 * d) + b * (9 * c - 2 * (b * b))) / 54;
  const discrim = q ** 3 + r ** 2;
  const term = b / 3;

  if (discrim > 0) {
    let s = r + Math.sqrt(discrim);
    s = (s < 0) ? - ((- s) ** 1 / 3) : s ** (1 / 3);
    let t = r - Math.sqrt(discrim);
    t = (t < 0) ? - ((- t) ** 1 / 3) : t ** (1 / 3);
    const term2 = - (term + (s + t) / 2);
    return [
      - term + s + t,
      term2,
      term2,
    ];
  }

  if (discrim === 0) {
    const r13 = ((r < 0) ? - ((- r) ** 1 / 3) : r ** (1 / 3));
    return [
      - term + 2 * r13,
      - (r13 + term),
      - (r13 + term),
    ];
  }

  const dum = Math.acos(r / Math.sqrt((- q) ** 3));
  const r13 = 2.0 * Math.sqrt(- q);
  return [
    - term + r13 * Math.cos(dum / 3),
    - term + r13 * Math.cos((dum + 2 * Math.PI) / 3),
    - term + r13 * Math.cos((dum + 4 * Math.PI) / 3),
  ];
}

function drawArc(ctx, px, py) {
  ctx.arc(px, 30, 15, 0, Math.PI * 2);
}

function drawVenn(type, backgroundColor, fillColorL, composite, fillColorR) { 
  const [offsetX, offsetY] = [0, 0];
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    backgroundColor,
    border: '1px solid darkgray',
    borderRadius: '2px',
  });
  document.querySelector('.grid-venn').append(canvas);
  [canvas.width, canvas.height] = [64, 52];
  const ctx = canvas.getContext('2d');
  // Fill
  ctx.fillStyle = fillColorL;
  drawArc(ctx, 23);
  ctx.fill();
  ctx.globalCompositeOperation = composite;
  ctx.fillStyle = fillColorR;
  ctx.beginPath();
  drawArc(ctx, 41);
  ctx.fill();
  // Stroke
  ctx.beginPath();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'gray';
  drawArc(ctx, 23);
  ctx.stroke();
  ctx.beginPath();
  drawArc(ctx, 41);
  ctx.stroke();
  ctx.fillStyle = '#222222';
  // Text
  ctx.fillText(type, 2, 10);
}

$(_ => {
  const svg = getTemplate('.connector');
  $('main').append(svg);
  Object.assign(svg.style, {
    width: '300px',
    height: '200px',
    left:'200px',
    top: '100px',
  });

  const m = { x: 2, y: 0 };
  const c0 = { x: 2, y: 200 * (2 / 3) };
  const c1 = { x: 298, y: 200 * (2 / 3) };
  const c2 = { x: 298, y: 200 };

  setD(svg.querySelectorAll('.conn-line-bg, .conn-line'), [
    ['M', m.x, m.y],
    ['C', c0.x, c0.y],
    [c1.x, c1.y],
    [c2.x, c2.y],
  ]);

  const x = 100;

  // ベジェ曲線の方程式(tからx,yを求める)からtを求める3次方程式に変換する（At³ + Bt² + Ct + D = 0）
  const A = c2.x - 3 * c1.x + 3 * c0.x - m.x;
  const B = 3 * c1.x - 6 * c0.x + 3 * m.x;
  const C = 3 * c0.x - 3 * m.x;
  const D = m.x - x;
  
  const roots = cubic(A, B, C, D);
  const t = roots.find(root => root > 0 && root < 1);

  const px = get4ponitsBezier(t, m.x, c0.x, c1.x, c2.x);
  const py = get4ponitsBezier(t, m.y, c0.y, c1.y, c2.y);

  setD(svg.querySelectorAll('.conn-close'), [
    ['M', px - 5, py - 5],
    ['L', px + 5, py + 5],
    ['M', px + 5, py - 5],
    ['L', px - 5, py + 5],
  ]);
  setD(svg.querySelectorAll('.conn-close-box'), [
    ['M', px - 5, py - 5],
    ['h', 10],
    ['v', 10],
    ['h', -10, 'Z'],
  ]);

  const posiColor = 'white';
  const negaColor = 'lawngreen';

  // AND
  drawVenn('AND', posiColor, negaColor, 'source-in', negaColor);
  // NAND
  drawVenn('NAND', negaColor, posiColor, 'source-in', posiColor);
  // OR
  drawVenn('OR', posiColor, negaColor, 'source-over', negaColor);
  // NOR
  drawVenn('NOR', negaColor, posiColor, 'source-over', posiColor);
  // XOR
  drawVenn('XOR', posiColor, negaColor, 'xor', negaColor);
  // EQV
  drawVenn('EQV', negaColor, posiColor, 'xor', posiColor);
  // IMP
  drawVenn('IMP', negaColor, posiColor, 'source-over', negaColor);

});
