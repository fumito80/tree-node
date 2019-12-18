'use strict';

let timerUnitMove = null;

function dragover({ originalEvent }) {
  if (/drop-inner|drop-around|drop-helper/.test(originalEvent.target.className)) {
    originalEvent.preventDefault();
  }
}

function dragleave({ originalEvent: { target } }) {
  if (/drop-inner|drop-helper/.test(target.className)) {
    target.classList.remove('dragenter');
    return;
  }
  if (target.classList.contains('drop-around')) {
    // target.parentElement.removeAttribute('style');
    clearTimeout(timerUnitMove);
  }
}

($ => {

  function getTemplate(selector) {
    const tmpl = $('template')[0].content.querySelector(selector);
    return document.importNode(tmpl, true);
  }

  function dragstart({ originalEvent }) {
    $('main').addClass('dragging');
  }

  function dragenter({ originalEvent: { target } }) {
    if (/drop-inner|drop-helper/.test(target.className)) {
      target.classList.add('dragenter');
      return;
    }
    if (target.classList.contains('drop-around')) {
      const { column, row } = target.parentElement.dataset;
      const [ column1, row1 ] = [Number(column), Number(row)];
      const [, dir] = /(top|right|bottom|left)/.exec(target.className);
      timerUnitMove = setTimeout(_ => {
        $('.unit').toArray().forEach(unit => {
          const { column, row } = unit.dataset;
          const [ column2, row2 ] = [Number(column), Number(row)];
          if (target.parentElement === unit && ['right', 'bottom'].includes(dir)) {
            unit.setAttribute('style', `grid-area: ${row1} / ${column1}`);
          } else if (['left', 'right'].includes(dir) && column2 >= (column1 + (dir === 'right' ? 1 : 0))) {
            unit.setAttribute('style', `grid-area: ${row2} / ${column2 + 1}`);
          } else if (['top', 'bottom'].includes(dir) && row2 >= (row1 + (dir === 'bottom' ? 1 : 0))) {
            unit.setAttribute('style', `grid-area: ${row2 + 1} / ${column2}`);
          } else {
            unit.setAttribute('style', `grid-area: ${row2} / ${column2}`);
          }
        });
        const dropHelper = $('.drop-helper')[0];
        if (['left', 'top'].includes(dir)) {
          dropHelper.style.gridArea = row + ' / ' + column;
        } else if (dir === 'right') {
          dropHelper.style.gridArea = row + ' / ' + (column1 + 1);
        } else if (dir === 'bottom') {
          dropHelper.style.gridArea = (row1 + 1) + ' / ' + column;
        }
        dropHelper.style.display = 'block';
      }, 300);
    }
  }
  
  function dragend({ originalEvent }) {
    $('main').removeClass('dragging');
    $('.drop-helper').removeAttr('style');
    $('.unit').toArray().forEach(unit => {
      unit.style.gridColumnStart = unit.dataset.column;
      unit.style.gridRowStart = unit.dataset.row;
    });
  }

  function drop({ originalEvent: { target } }) {
    if (target.classList.contains('dragenter')) {
      target.classList.remove('dragenter');
      if (target.classList.contains('drop-helper')) {
        const $unit = $(getTemplate('.unit')).appendTo('main');
        $unit.css('grid-area', target.style.gridArea);
        $('.unit').toArray().forEach(unit => {
          unit.dataset.column = unit.style.gridColumnStart;
          unit.dataset.row = unit.style.gridRowStart;      
        });
      }
    }
  }
    
  $('aside a')
    .on('dragstart', dragstart)
    .on('dragend', dragend);
  
  const $unit = $(getTemplate('.unit')).appendTo('main');
  $unit[0].dataset.column = '1';
  $unit[0].dataset.row = '1';

  $(document)
    // .find('.drop-inner')
      .on('dragover', dragover)
      .on('dragenter', dragenter)
      .on('dragleave', dragleave)
      .on('drop', drop);

})(jQuery);
