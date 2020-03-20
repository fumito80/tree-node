class HScrollableNavs extends HTMLUListElement {
  constructor() {
    super();
    if (this.parentElement.classList.contains('h-scrollable-navs')) {
      return;
    }
    const divParent = document.createElement('div');
    divParent.className = 'h-scrollable-navs';
    divParent.innerHTML = this.template();
    this.before(divParent);
    divParent.firstElementChild.after(this);
    const observer = new MutationObserver(this.onChangeSubtree.bind(this));
    observer.observe(this, { childList: true, subtree: true });
  }
  onChangeSubtree() {
    if (this.scrollWidth > this.offsetWidth) {
      this.scrollLeft = 0;
      this.parentElement.classList.add('ellipsis-next');
    }
  }
  template() {
    return `
      <div class="bshsn-ellipsis bshsn-prev">･･･</div>
      <div class="bshsn-ellipsis bshsn-next">･･･</div>
      <div class="btn-group">
        <button type="button" class="btn btn-default btn-sm"><i class="fa fa-chevron-left"></i></button>
        <button type="button" class="btn btn-default btn-sm"><i class="fa fa-chevron-right"></i></button>
      </div>
    `;
  }
};

customElements.define('bs-h-scrollable-navs', HScrollableNavs, { extends: 'ul' });
