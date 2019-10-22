'use strict';

const rootNode = $('.rootNode') as HTMLElement;
const template = $('template') as HTMLTemplateElement;

function addTemplate(template: HTMLTemplateElement, selector: string, parent: HTMLElement, target: Element | null = null) {
  return Maybe.of(selector)
    .map<HTMLElement>(template.content.querySelector.bind(template.content))
    .map(F.flipCurried(document.importNode.bind(document))(true))
    .map(F.curry(insertBefore(target))(parent))
    .getOrElse(null);
}

function getSelector(leafOrNode: HTMLElement, path: string[] = [':scope']): string | null {
  if (leafOrNode.parentElement == null || leafOrNode.classList.contains('rootNode')) {
    return path.join(' > ') || null;
  }
  const index = Array.from(leafOrNode.parentElement.children).indexOf(leafOrNode) + 1;
  return getSelector(leafOrNode.parentElement, [...path, `div:nth-child(${index})`]);
}

function addNode(parent: HTMLElement, target: Element) {
  return Maybe.fromNullable(addTemplate(template, '.node', parent, target))
    .map(F.curry($)('.leaf-area'))
    .map(F.flipCurried(insertBefore())(target));
}

function addLeaf(parent: HTMLElement, target: Element | null = null) {
  Maybe.fromNullable(addTemplate(template, '.leaf', parent, target))
    .map((leaf) => {
      const index = $$('.leaf', rootNode).indexOf(leaf) + 1;
      setElementText($('.leaf-number', leaf), String(index));
    })
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

document.addEventListener('DOMContentLoaded', () => {
  getEventListeners('.add-leaf-down, .add-leaf-up, .add-leaf-join, .del-tree').map((listener) => {
    listener('mousedown', (e) => (e.target as HTMLElement).dataset.focusedSelector = getTargetSelector());
  });
  getEventListener('.add-leaf-down')('click', (e) => {
    if (rootNode.children.length === 0) {
      // 最初
      addLeaf(rootNode);
      return;
    }
    if (rootNode.firstElementChild && rootNode.firstElementChild.classList.contains('leaf')) {
      // Leaf一個 -> join
      addNode(rootNode, rootNode.firstElementChild)
        .map((leaf) => leaf.parentElement)
        .map(addLeaf);
      return;
    }
    const { focusedSelector } = (e.target as HTMLElement).dataset;
    const self = getTarget(focusedSelector || null);
    if (self == null) {
      // フォーカス無し　-> 一番外枠の最後に追加
      Maybe.fromNullable(rootNode.firstElementChild)
        .map((el) => $('.leaf-area', el))
        .map(F.curry(addLeaf))
        .map((f) => f(null));
      return;
    }
    if (self.parentElement) {
      // フォーカス有り
      const parent = self.parentElement;
      if (parent.classList.contains('.rootNode')) {
        // 一番外枠
        // join
        return;
      }
      // 通常の追加
      addLeaf(self.parentElement, self.nextElementSibling);
    }
  });
  getEventListener('.add-leaf-up')('click', (e) => {
    // const { focusedSelector } = (e.target as HTMLElement).dataset;
    // addLeaf(getTarget(focusedSelector || null));
  });
  getEventListener('.del-tree')('click', (e) => {
    const { focusedSelector } = (e.target as HTMLElement).dataset;
    if (focusedSelector) {
      const target = getTarget(focusedSelector);
      if (target && target.parentElement) {
        target.parentElement.removeChild(target);
      }
    }
  });
  getEventListener('.add-leaf-join')('click', (e) => {
    const { focusedSelector } = (e.target as HTMLElement).dataset;
    // addNode(getTarget(focusedSelector || null));
  });
  // addLeaf();
});
