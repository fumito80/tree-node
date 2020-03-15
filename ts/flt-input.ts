class FitInput1 extends HTMLElement {
  constructor() {
    super();
    const input = this.querySelector<HTMLInputElement>(':scope > input');
    if (input == null) {
      return;
    }
    this.style.display = 'inline-block';
    const { font, padding } = getComputedStyle(input);
    const innerDiv = this.appendChild(document.createElement('div'));
    Object.assign(innerDiv.style, {
      font,
      padding,
      visibility: 'hidden',
    });
    input.style.width = '100%';
    input.addEventListener('input', _ => {
      innerDiv.textContent = input.value;
    });
  }
}

// customElements.define('fit-input', FitInput1);


class FitInput2 extends HTMLElement {
  constructor() {
    super();
    const input = this.querySelector<HTMLInputElement>(':scope > input');
    if (input == null) {
      return;
    }
    const shadow = this.attachShadow({ mode: 'open' });
    this.style.display = 'inline-block';
    const styleDeclaration = getComputedStyle(input);
    const styles: any = Array.from(styleDeclaration).reduce((acc, key) => ({ ...acc, [key]: styleDeclaration.getPropertyValue(key) }), {});
    // const innerDiv = this.appendChild(document.createElement('div'));
    // Object.assign(innerDiv.style, {
    //   font,
    //   padding,
    //   visibility: 'hidden',
    // });
    // input.style.width = '100%';
    // input.addEventListener('input', _ => {
    //   innerDiv.textContent = input.value;
    // });
    shadow.appendChild(input);
    Object.assign(input.style, styles);
  }
}

// customElements.define('fit-input', FitInput2);

class FitInput extends HTMLInputElement {
  constructor() {
    super();
    this.addEventListener('focus', () => {
      console.log('Focus on spotinput');
    });
  }
};

customElements.define('fit-input', FitInput, {
  extends: 'input',
});

// 
class HScrollNav extends HTMLInputElement {
  constructor() {
    super();
    this.addEventListener('focus', () => {
      console.log('Focus on spotinput');
    });
  }
};

customElements.define('fit-input', FitInput, {
  extends: 'input',
});
