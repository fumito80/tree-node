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
    target.classList.remove('dragenter');
    // target.parentElement.removeAttribute('style');
    // const dropHelper = $('.drop-helper');
    // dropHelper.style.display = 'none';
    // clearTimeout(timerUnitMove);
  }
}

($ => {

  function getTemplate(selector) {
    const tmpl = $('template')[0].content.querySelector(selector);
    return document.importNode(tmpl, true);
  }

  function dragstart({ originalEvent }) {
    $('main').addClass('dragstart');
  }

  function dragenter({ originalEvent: { target } }) {
    if (/drop-inner|drop-helper/.test(target.className)) {
      target.classList.add('dragenter');
      $('.drop-helper').hide();
      return;
    }
    if (target.classList.contains('drop-around')) {
      target.classList.add('dragenter');
      const { gridRowStart, gridColumnStart } = target.parentElement.dataset;
      const [ row1, column1 ] = [Number(gridRowStart), Number(gridColumnStart)];
      const [, dir] = /(top|right|bottom|left)/.exec(target.className) || [];
      const $dropHelper = $('.drop-helper').hide();
      if (dir === 'right' || dir === 'bottom') {
      // timerUnitMove = setTimeout(_ => {
        // $('.unit').toArray().forEach(unit => {
        //   const { column, row } = unit.dataset;
        //   const [ column2, row2 ] = [Number(column), Number(row)];
        //   if (target.parentElement === unit && ['right', 'bottom'].includes(dir)) {
        //     unit.setAttribute('style', `grid-area: ${row1} / ${column1}`);
        //   } else if (['left', 'right'].includes(dir) && column2 >= (column1 + (dir === 'right' ? 1 : 0))) {
        //     unit.setAttribute('style', `grid-area: ${row2} / ${column2 + 1}`);
        //   } else if (['top', 'bottom'].includes(dir) && row2 >= (row1 + (dir === 'bottom' ? 1 : 0))) {
        //     unit.setAttribute('style', `grid-area: ${row2 + 1} / ${column2}`);
        //   } else {
        //     unit.setAttribute('style', `grid-area: ${row2} / ${column2}`);
        //   }
        // });
        if (['left', 'top'].includes(dir)) {
          // dropHelper.style.gridArea = row1 + '/' + column1;
        } else if (dir === 'right') {
          $dropHelper[0].style.gridRowStart = row1;
          $dropHelper[0].style.gridColumnStart = column1 + 1;
        } else if (dir === 'bottom') {
          $dropHelper[0].style.gridRowStart = row1 + 1;
          $dropHelper[0].style.gridColumnStart = column1;
        }
        $dropHelper.show();
      // }, 300);
      }
    }
  }
  
  function dragend({ originalEvent }) {
    $('main').removeClass('dragstart');
    $('.drop-helper').removeAttr('style');
    $('.unit').toArray().forEach(unit => {
      unit.style.gridColumnStart = unit.dataset.gridColumnStart;
      unit.style.gridRowStart = unit.dataset.gridRowStart;
    });
  }

  function drop({ originalEvent: { target } }) {
    if (target.classList.contains('dragenter')) {
      target.classList.remove('dragenter');
      if (target.classList.contains('drop-around')) {

        const $dropHelper = $('.drop-helper');
        const isAppend = $dropHelper.is(':visible');
        const currentTarget = isAppend ? $dropHelper[0] : target.parentElement;
        const { gridRowStart, gridColumnStart } = currentTarget.style;
        const [row1, column1] = [Number(gridRowStart), Number(gridColumnStart)];  

        const $unit = $(getTemplate('.unit')).appendTo('main');
        $unit[0].style.gridRowStart = gridRowStart;
        $unit[0].style.gridColumnStart = gridColumnStart;

        if (!isAppend) {
          const [, dir] = /(top|right|bottom|left)/.exec(target.className) || [];

          $('.unit').toArray().forEach(unit => {
            const { gridRowStart, gridColumnStart } = unit.dataset;
            const [row2, column2] = [Number(gridRowStart), Number(gridColumnStart)];
            if ($unit[0] === unit) {
              unit.style.gridRowStart = row1;
              unit.style.gridColumnStart = column1;
            } else if (['left', 'right'].includes(dir) && column2 >= (column1 + (dir === 'right' ? 1 : 0))) {
              unit.style.gridRowStart = row2;
              unit.style.gridColumnStart = column2 + 1;
            } else if (['top', 'bottom'].includes(dir) && row2 >= (row1 + (dir === 'bottom' ? 1 : 0))) {
              unit.style.gridRowStart = row2 + 1;
              unit.style.gridColumnStart = column2;
            } else {
              unit.style.gridRowStart = row2;
              unit.style.gridColumnStart = column2;
            }
          });
        }

        $('.unit').toArray().forEach(unit => {
          unit.dataset.gridColumnStart = unit.style.gridColumnStart;
          unit.dataset.gridRowStart = unit.style.gridRowStart;      
        });

        const main = $('main')[0];
        $('.unit').toArray()
          .map(unit => {
            return [Number(unit.dataset.gridRowStart) * 10000 + Number(unit.dataset.gridColumnStart), unit];
          })
          .sort(([seqA], [seqB]) => Math.sign(seqA - seqB))
          .forEach(([seq, unit], _, self) => {
            main.appendChild(unit);
            if (self.find(([seq1]) => seq + 1 === seq1) || self.find(([seq1]) => seq + 10000 === seq1)) {
              unit.classList.remove('edge');
            } else {
              unit.classList.add('edge');
            }
          });
      }
    }
  }
    
  $('aside a')
    .on('dragstart', dragstart)
    .on('dragend', dragend);
  
  const $unit = $(getTemplate('.unit')).appendTo('main').addClass('edge');
  $unit[0].dataset.gridColumnStart = '1';
  $unit[0].dataset.gridRowStart = '1';
  $unit[0].style.gridRowStart = '1';
  $unit[0].style.gridColumnStart = '1';

  $(document)
    // .find('.drop-inner')
      .on('dragover', dragover)
      .on('dragenter', dragenter)
      .on('dragleave', dragleave)
      .on('drop', drop);

})(jQuery);
