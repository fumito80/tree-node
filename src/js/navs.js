($ => {
  $(_ => {
    const [$tabs, $contents] = [...Array(15)].reduce(([$tabs, $contents], _, i) => {
      const tabName = 'Tab' + (i + 1);
      return [
        $tabs.append(`<li class="nav-item"><a href="#${tabName}" data-toggle="tab">${tabName}</a></li>`),
        $contents.append(`<div class="tab-pane fade" id="${tabName}"></div>`),
      ];
    }, [$('.nav-tabs'), $('.tab-content')]);
    $tabs.find('li:first').addClass('active');
    $contents.find('div:first').addClass('show active');
  });
})(jQuery);
