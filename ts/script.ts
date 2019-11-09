'use strict';

const rootNode = $('.rootNode') as HTMLElement;
const template = $('template') as HTMLTemplateElement;

type Dir = 'top' | 'bottom';

function getTemplate(selector: string) {
  return Maybe.fromNullable(template.content.querySelector<HTMLElement>(selector))
    .map(F.flipCurried(document.importNode.bind(document))(true))
    .tap((el) => {
      $$('.droppable', el).forEach((el2) => {
        getEventListener(el2)('dragover', (e) => {
          Maybe.fromNullable(e.target)
            .map(e.preventDefault.bind(e));
        });
        getEventListener(el2)('dragenter', (e) => {
          Maybe.fromNullable(e.target as HTMLElement)
            // .tap(F.invoke(['classList', 'add'], 'dragenter'))
            // .map(F.invoke('parentElement'))
            .filter((target) => {
              if (target.parentElement && e.dataTransfer) {
                const srcElement = getTarget(e.dataTransfer.types[0]);
                if (target.parentElement === srcElement) {
                  return false;
                }
                if (/space\-top/.test(target.className) && srcElement && target.parentElement === srcElement.nextElementSibling) {
                  return false;
                }
                return true;
              }
              return false;
            })
            .tap(F.invoke(['classList', 'add'], 'dragenter'));
        });
        getEventListener(el2)('dragleave', (e) => {
          Maybe.fromNullable(e.target)
            .map(F.invoke(['classList', 'remove'], 'dragenter'));
        });
        getEventListener(el2)('drop', (e) => {
          Maybe.fromNullable(e.target as HTMLElement)
            .filter(F.invoke(['classList', 'contains'], 'dragenter'))
            .tap(F.invoke(['classList', 'remove'], 'dragenter'))
            .map((target) => {
              if (target.parentElement && e.dataTransfer) {
                const refNode = /space\-bottom/.test(target.className) ? null : target.parentElement;
                const srcElement = getTarget(e.dataTransfer.types[0]);
                if (srcElement) {
                  const srcElementParent = srcElement.parentElement;
                  insertBefore(target.parentElement.parentElement, srcElement, refNode);
                  afterRemove(srcElementParent);
                }
              }
            });
        });
      });
      Maybe.fromNullable($('.leaf-body', el))
        .map(getEventListener)
        .map((listener) => listener('dragstart', (e) => {
          const target = e.target as HTMLElement;
          if (target && target.parentElement && e.dataTransfer) {
            e.dataTransfer.setData(getSelector(target.parentElement) || '', '');
          }
        }));
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
    .getOrElse(null) as HTMLElement | null;
}

function addNode(parent: HTMLElement, target: HTMLElement, dir: Dir = 'bottom') {
  Maybe.fromNullable(insertBefore(parent, getTemplate('.node'), target))
    .map(F.curry($)('.leaf-area'))
    .map(append(target)())
    .map(F.flipCurried(addLeaf(dir))(target));
}

function addLeaf(dir: Dir = 'bottom') {
  return (parent: HTMLElement, target: HTMLElement | null = null) => {
    Either.fromNullable(target)
      .map(dir === 'top' ? I : getNextTarget)
      .toRight(() => dir === 'top' ? parent.children[1] as HTMLElement : null)
      .map(F.curry3(insertBefore)(parent)(getTemplate('.leaf')))
      .map(F.invoke('focus'))
      .map(renumberLeaf);
    return parent;
  }
}

function getFocusedSelector() {
  return Maybe.fromNullable($<HTMLDivElement>('.leaf-body:focus,.node-body:focus'))
    .map((nodeBode) => nodeBode.parentElement)
    .map(getSelector)
    .getOrElse(undefined);
}

function getTarget(selector: string | null) {
  return Maybe.fromNullable(selector)
    .map(F.flipCurried($)<HTMLElement>(rootNode))
    .getOrElse(null);
}

function renumberLeaf() {
  $$('.leaf-number').map((leaf, i) => setElementText(leaf, String(i + 1)));
}

function dispatchAddNode(e: MouseEvent) {
  const button = e.target as HTMLButtonElement;
  const dir: Dir = button.classList.contains('add-leaf-up') ? 'top' : 'bottom';
  if (rootNode.children.length === 0) {
    // 最初
    addLeaf()(rootNode);
    return;
  }
  if (rootNode.children[0] && rootNode.children[0].classList.contains('leaf')) {
    // Leaf一個 -> join
    addNode(rootNode, rootNode.children[0] as HTMLElement, dir);
    return;
  }
  // const { focusedSelector } = button.dataset;
  // const self = getTarget(focusedSelector || null);
  const target = $('input[name="node-selected"]:checked', rootNode);
  if (target == null) {
    // フォーカス無し　-> 一番外枠の最後に追加
    Maybe.fromNullable($('.leaf-area', rootNode))
      .map((leafArea) => addLeaf(dir)(leafArea))
    return;
  }
  if (target.parentElement) {
    // フォーカス有り
    const parent = target.parentElement;
    if (parent.classList.contains('rootNode')) {
      // 一番外枠 -> join
      addNode(rootNode, rootNode.children[0] as HTMLElement, dir);
      return;
    }
    // 通常の追加
    addLeaf(dir)(target.parentElement, target);
  }
}

function removeNode(target: HTMLElement) {
  return Maybe.fromNullable(target.parentElement)
    .tap(F.invoke('removeChild', target))
    .getOrElse(null);
}

function setCss(el: HTMLElement | null, cssText: string) {
  if (el) {
    el.style.cssText = cssText;
  }
}

function afterRemove(parent: HTMLElement | null) {
  Maybe.fromNullable(parent)
    .filter((parent) => $$(':scope > .leaf, :scope > .node', parent).length === 1)
    .map((parent) => {
      if (parent.parentElement && parent.parentElement.parentElement) {
        const parentNode = parent.parentElement.parentElement.parentElement;
        const node = $(':scope > .leaf, :scope > .node', parent);
        insertBefore(parentNode, node, parent.parentElement.parentElement);
        removeNode(parent.parentElement.parentElement);
      }
    });
    renumberLeaf();
}

document.addEventListener('DOMContentLoaded', () => {
  // getEventListeners('.add-leaf-down, .add-leaf-up, .add-leaf-join, .del-tree').map((listener) => {
  //   listener('mousedown', (e) => (e.target as HTMLElement).dataset.focusedSelector = getFocusedSelector());
  // });
  getEventListeners('.add-leaf-down, .add-leaf-up').map((listener) => listener('click', dispatchAddNode));
  getEventListener('.del-tree')('click', () => {
    // Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
    Maybe.fromNullable($('input[name="node-selected"]:checked', rootNode))
      // .map(getTarget)
      .map(removeNode)
      .map(afterRemove);
  });
  getEventListener('.add-leaf-join')('click', () => {
    // Maybe.fromNullable((e.target as HTMLElement).dataset.focusedSelector)
    Maybe.fromNullable($('input[name="node-selected"]:checked', rootNode))
      // .map(getTarget)
      .map((target) => {
        if (target.parentElement) {
          addNode(target.parentElement, target);
        }
      });
  });
  // append(getDropRow())()($('.leaf-area'));
  getEventListeners('.badge-btn').map((listener) => listener('click', (e) => {
    Maybe.fromNullable(e.target)
      .map((el) => [el, (el as HTMLElement).dataset.defined] as [HTMLElement, string])
      .map(([el, defined]) => {
        el.dataset.defined = defined === 'yes' ? 'no' : 'yes';
      });
  }));
});
