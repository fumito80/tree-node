'use strict';

const rootNode = $('.rootNode') as HTMLElement;
const template = $('template') as HTMLTemplateElement;

type Dir = 'top' | 'bottom';

function getTemplate(selector: string) {
  return Maybe.fromNullable(template.content.querySelector<HTMLElement>(selector))
    .map(F.flipCurried(document.importNode.bind(document))(true))
    .getOrElse(null);
}

function getDropRow() {
  return Maybe.fromNullable(getTemplate('.drop-row'))
    .tap((el) => {
      el.addEventListener('dragenter', (e) => {
        setCss(e.target as HTMLElement, 'background-color: #44c0ff');
        e.preventDefault();
        return false;
      });
    })
    .tap((el) => {
      el.addEventListener('dragleave', (e) => {
        setCss(e.target as HTMLElement, 'background-color: white');
      });
    })
    .getOrElse(null);
}

function getSelector(leafOrNode: HTMLElement, path: string[] = []): string | null {
  if (leafOrNode.parentElement == null || leafOrNode.classList.contains('rootNode')) {
    return [':scope', ...path].join(' > ') || null;
  }
  let selector = '';
  if (Array.from(leafOrNode.classList).some((className) => ['leaf', 'node'].includes(className))) {
    const index = Array.from(leafOrNode.parentElement.children).indexOf(leafOrNode) + 1;
    selector = `div:nth-child(${index})`;
  } else if (leafOrNode.classList.contains('leaf-area')) {
    selector = `.leaf-area`;
  } else {
    selector = leafOrNode.localName;
  }
  return getSelector(leafOrNode.parentElement, [selector, ...path]);
}

function getNextTarget(target: HTMLElement) {
  return Maybe.fromNullable(target.nextElementSibling)
    .map((next) => next.nextElementSibling)
    .getOrElse(null) as HTMLElement | null;
}

function addNode(parent: HTMLElement, target: HTMLElement, dir: Dir = 'bottom') {
  Maybe.fromNullable(insertBefore(parent, getTemplate('.node'), target))
    .map(F.curry($)('.leaf-area'))
    .map(append(getDropRow())())
    .map(append(target)())
    .map(append(getDropRow())())
    .map(F.flipCurried(addLeaf(dir))(target));
}

function addLeaf(dir: Dir = 'bottom') {
  return (parent: HTMLElement, target: HTMLElement | null = null) => {
    Either.fromNullable(target)
      .map(dir === 'top' ? I : getNextTarget)
      .toRight(() => dir === 'top' ? parent.children[1] as HTMLElement : null)
      .map(F.curry3(insertBefore)(parent)(getDropRow()))
      .map(F.curry3(insertBefore)(parent)(getTemplate('.leaf')))
      .map(F.invoke('focus'))
      .map(renumberLeaf);
    return parent;
  }
}

function getFocusedSelector() {
  return Maybe.fromNullable($<HTMLDivElement>('.leaf:focus,.node:focus'))
    .map(getSelector)
    .getOrElse('');
}

function getTarget(selector: string | null) {
  return Maybe.fromNullable(selector)
    .map(F.flipCurried($)<HTMLElement>(rootNode))
    .getOrElse(null);
}

function renumberLeaf() {
  $$('.leaf').map((leaf, i) => setElementText($('.leaf-number', leaf), String(i + 1)));
}

function dispatchAddNode(e: MouseEvent) {
  const button = e.target as HTMLButtonElement;
  const dir: Dir = button.classList.contains('add-leaf-up') ? 'top' : 'bottom';
  if (rootNode.children.length === 1) {
    // 最初
    addLeaf()(rootNode);
    return;
  }
  if (rootNode.children[1] && rootNode.children[1].classList.contains('leaf')) {
    // Leaf一個 -> join
    addNode(rootNode, rootNode.children[1] as HTMLElement, dir);
    return;
  }
  const { focusedSelector } = button.dataset;
  const self = getTarget(focusedSelector || null);
  if (self == null) {
    // フォーカス無し　-> 一番外枠の最後に追加
    Maybe.fromNullable($('.leaf-area', rootNode))
      .map((leafArea) => addLeaf(dir)(leafArea))
    return;
  }
  if (self.parentElement) {
    // フォーカス有り
    const parent = self.parentElement;
    if (parent.classList.contains('rootNode')) {
      // 一番外枠 -> join
      addNode(rootNode, rootNode.children[1] as HTMLElement, dir);
      return;
    }
    // 通常の追加
    addLeaf(dir)(self.parentElement, self);
  }
}

function removeNode(target: HTMLElement) {
  return Maybe.fromNullable(target.parentElement)
    .tap((parent) => {
      Maybe.fromNullable(target.nextElementSibling).map(parent.removeChild.bind(parent))
      parent.removeChild(target);  
    })
    .getOrElse(null);
}

function setCss(el: HTMLElement | null, cssText: string) {
  if (el) {
    el.style.cssText = cssText;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getEventListeners('.add-leaf-down, .add-leaf-up, .add-leaf-join, .del-tree').map((listener) => {
    listener('mousedown', (e) => (e.target as HTMLElement).dataset.focusedSelector = getFocusedSelector());
  });
  getEventListeners('.add-leaf-down, .add-leaf-up').map((listener) => listener('click', dispatchAddNode));
  getEventListener('.del-tree')('click', (e) => {
    Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
      .map(getTarget)
      .map(removeNode)
      .filter((parent) => $$(':scope > .leaf, :scope > .node', parent).length === 1)
      .map((parent) => {
        if (parent.parentElement) {
          const parentNode = parent.parentElement.parentElement;
          const dropRow = insertBefore(parentNode, getDropRow(), parent.parentElement);
          const node = $(':scope > .leaf, :scope > .node', parent);
          insertBefore(parentNode, node, dropRow);
          removeNode(parent.parentElement);
        }
      });
    renumberLeaf();
  });
  getEventListener('.add-leaf-join')('click', (e) => {
    Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
      .map(getTarget)
      .map((target) => {
        if (target.parentElement) {
          addNode(target.parentElement, target);
        }
      });
  });
  append(getDropRow())()($('.leaf-area'));
  getEventListeners('.badge-btn').map((listener) => listener('click', (e) => {
    Maybe.fromNullable(e.target)
      .map((el) => [el, (el as HTMLElement).dataset.defined] as [HTMLElement, string])
      .map(([el, defined]) => {
        el.dataset.defined = defined === 'yes' ? 'no' : 'yes';
      });
  }));
});
