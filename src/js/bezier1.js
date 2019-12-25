'use strict';

function setD($path, d) {
  $path.attr('d', d.flat(1).join(' '));
}

function get4ponitsBezierCurvedPoint(t, mx, my, cx1, cy1, cx2, cy2, cx3, cy3) {
  return {
    x: (1 - t) ** 3 * mx + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t * 3 * cx3,
    y: (1 - t) ** 3 * my + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t * 3 * cy3,
  };
}

$(_ => {
  const svg = document.importNode($('template')[0].content.querySelector('.connector'), true);
  $('main').append(svg);
  svg.style.width = '300px';
  svg.style.height = '200px';
  svg.style.left = '100px';
  svg.style.top = '100px';
  const $svg = $(svg);
  setD($svg.find('.conn-line-bg, .conn-line'), [
    ['M', 0, 0],
    ['C', 0, 200 * (2 / 3)],
    [300, 200 * (2 / 3)],
    [300, 200],
  ]);

  const svg2 = document.importNode($('template')[0].content.querySelector('.connector'), true);
  $('main').append(svg2);
  svg2.style.width = '300px';
  svg2.style.height = '200px';
  svg2.style.left = '100px';
  svg2.style.top = '100px';
  const $svg2 = $(svg2);
  setD($svg2.find('.conn-line-bg, .conn-line'), [
    ['M', 0, 0],
    ['Q', 0, 200 * (2 / 3)],
    [260, 160],
  ]);
});
