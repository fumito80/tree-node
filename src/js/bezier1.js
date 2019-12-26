'use strict';

function getTemplate(selector) {
  return document.importNode($('template')[0].content.querySelector(selector), true);
}

function setD(pathes, d) {
  [...pathes].map(path => path.setAttribute('d', d.flat(1).join(' ')));
}

function get4ponitsBezier(t, m, c0, c1, c2) {
  return (1 - t) ** 3 * m + 3 * (1 - t) ** 2 * t * c0 + 3 * (1 - t) * t ** 2 * c1 + t ** 3 * c2;
}

function cubic(a, b, c, d) {
    let m,m2,k,n,n2,x,r,rc;
    
    const f = eval(((3*c)/a) - (((b*b)/(a*a))))/3;
    const g = eval((2*((b*b*b)/(a*a*a))-(9*b*c/(a*a)) + ((27*(d/a)))))/27;
    const h = eval(((g*g)/4) + ((f*f*f)/27));

    if (h > 0) {        
      m = eval(-(g/2)+ (Math.sqrt(h)));
      k = m < 0 ? -1:1;
      m2 = eval(Math.pow((m*k),(1/3)));
      m2 = m2*k;
      n = eval(-(g/2)- (Math.sqrt(h)));
      k = n<0 ? -1:1;
      n2 = eval(Math.pow((n*k),(1/3)));
      n2 = n2*k;
      x= eval ((m2 + n2) - (b/(3*a)));        
    }else {
      r = (eval(Math.sqrt((g*g/4)-h)));
      k = r<0 ? -1:1;
      rc = Math.pow((r*k),(1/3))*k;
      const theta = Math.acos((-g/(2*r)));
      x=eval (2*(rc*Math.cos(theta/3))-(b/(3*a)));
      x=x*1E+14;
      x=Math.round(x);
      x=(x/1E+14);
    }
    
    if ((f + g + h) === 0) {
      let sign;
      if (d < 0) {
        sign = -1;
      } else if (d >= 0) {
        sign = 1;
      }
      let dans;
      if (sign > 0) {
        dans = Math.pow((d/a),(1/3));
        dans = dans * -1;
      } else if (sign < 0) {
        d = d * -1;
        dans = Math.pow((d/a),(1/3));
      }
      x = dans;
    }
    return x;
}

$(_ => {
  const svg = getTemplate('.connector');
  $('main').append(svg);
  Object.assign(svg.style, {
    width: '300px',
    height: '200px',
    left:'100px',
    top: '100px',
  });

  const m = { x: 0, y: 0 };
  const c0 = { x: 0, y: 200 * (2 / 3) };
  const c1 = { x: 300, y: 200 * (2 / 3) };
  const c2 = { x: 300, y: 200 };

  setD(svg.querySelectorAll('.conn-line-bg, .conn-line'), [
    ['M', m.x, m.y],
    ['C', c0.x, c0.y],
    [c1.x, c1.y],
    [c2.x, c2.y],
  ]);

  // const x = 100;
  // const A = c2.x - 3 * c1.x + 3 * c0.x - m.x;
  // const B = 3 * c1.x - 6 * c0.x + 3 * m.x;
  // const C = 3 * c0.x - 3 * m.x;
  // const D = m.x - x;
  
  // So we need to solve At³ + Bt² + Ct + D = 0     
  // var t = cubic(A, B, C, D);

  // const px = get4ponitsBezier(t, m.x, c0.x, c1.x, c2.x);
  // const py = get4ponitsBezier(t, m.y, c0.y, c1.y, c2.y);
  
  let t = 0.3;
  let px = 0;
  while (px < 100 && t < 1) {
    t += 0.01;
    px = get4ponitsBezier(t, m.x, c0.x, c1.x, c2.x);
  }
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
});
