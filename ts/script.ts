'use strict';

const rootNode = $('.rootNode') as HTMLElement;
const template = $('template') as HTMLTemplateElement;

function addTemplate(template: HTMLTemplateElement, selector: string, parent: HTMLElement, target: HTMLElement | null = null) {
  return Maybe.of(selector)
    .map<HTMLElement>(template.content.querySelector.bind(template.content))
    .map(F.flipCurried(document.importNode.bind(document))(true))
    .map(F.curry(insertBefore(target))(parent))
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

function addNode(parent: HTMLElement, target: HTMLElement) {
  return Maybe.fromNullable(addTemplate(template, '.node', parent, target))
    .map(F.curry($)('.leaf-area'))
    .map(F.flipCurried(insertBefore())(target));
}

function addLeaf(parent: HTMLElement, target: HTMLElement | null = null) {
  Maybe.fromNullable(addTemplate(template, '.leaf', parent, target))
    .map((leaf) => {
      const index = $$('.leaf', rootNode).indexOf(leaf) + 1;
      setElementText($('.leaf-number', leaf), String(index));
    });
  renumberLeaf();
}

function getTargetSelector() {
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

function preAddLeaf(e: MouseEvent) {
  const button = e.target as HTMLButtonElement;
  const dir = button.classList.contains('add-leaf-up') ? 'up' : 'down';
  if (rootNode.children.length === 0) {
    // 最初
    addLeaf(rootNode);
    return;
  }
  if (rootNode.firstElementChild && rootNode.firstElementChild.classList.contains('leaf')) {
    // Leaf一個 -> join
    addNode(rootNode, rootNode.firstElementChild as HTMLElement)
      .map((leaf) => addLeaf(leaf.parentElement as HTMLElement, dir === 'up' ? leaf : null));
    return;
  }
  const { focusedSelector } = button.dataset;
  const self = getTarget(focusedSelector || null);
  if (self == null) {
    // フォーカス無し　-> 一番外枠の最後に追加
    Maybe.fromNullable($('.leaf-area', rootNode))
      .map((leafArea) => addLeaf(leafArea, dir === 'up' ? leafArea.firstElementChild as HTMLElement : null))
    return;
  }
  if (self.parentElement) {
    // フォーカス有り
    const parent = self.parentElement;
    if (parent.classList.contains('rootNode')) {
      // 一番外枠 -> join
      addNode(rootNode, rootNode.firstElementChild as HTMLElement)
        .map((leaf) => addLeaf(leaf.parentElement as HTMLElement, dir === 'up' ? leaf : null));
      return;
    }
    // 通常の追加
    addLeaf(self.parentElement, dir === 'up' ? self : self.nextElementSibling as HTMLElement);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getEventListeners('.add-leaf-down, .add-leaf-up, .add-leaf-join, .del-tree').map((listener) => {
    listener('mousedown', (e) => (e.target as HTMLElement).dataset.focusedSelector = getTargetSelector());
  });
  getEventListeners('.add-leaf-down, .add-leaf-up').map((listener) => listener('click', preAddLeaf));
  getEventListener('.del-tree')('click', (e) => {
    Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
      .map(getTarget)
      .map(removeChild)
      .filter((parent) => $$(':scope > .leaf, :scope > .node', parent).length === 1)
      .map((parent) => {
        if (parent.parentElement) {
          const node = $(':scope > .leaf, :scope > .node', parent);
          insertBefore(parent.parentElement)(parent.parentElement.parentElement, node);
          removeChild(parent.parentElement);
        }
      });
    renumberLeaf();
  });
  getEventListener('.add-leaf-join')('click', (e) => {
    Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
      .map(getTarget)
      .map((target) => {
        if (target.parentElement) {
          addNode(target.parentElement, target)
            .map((leaf) => addLeaf(leaf.parentElement as HTMLElement));
        }
      });
  });
});
