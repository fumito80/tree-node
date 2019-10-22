'use strict';

const rootNode = $('.rootNode') as HTMLElement;
const template = $('template') as HTMLTemplateElement;

// function getAddress(leafOrNode: HTMLDivElement, ): string {
//   return '';
// }

function addTemplate(selecor: string) {
  return (address?: string) => {
    return Maybe.of(selecor)
      .map<HTMLElement>(template.content.querySelector.bind(template.content))
      .map(F.flipCurried(document.importNode.bind(document))(true))
      .map(Maybe.fromNullable((address ? F.curry($)(address) : I)(rootNode))
        .map(F.curry(appendChild))
        .getOrElse(() => null))
      .getOrElse(null);
  }
}

function addNode(address?: string): void {
  addTemplate('.node')(address);
}

function addLeaf(address?: string) {
  const leaf = addTemplate('.leaf')(address);
  if (leaf == null) {
    return;
  }
  const index = $$('.leaf', rootNode).findIndex((el) => el === leaf) + 1;
  setElementText(String(index))($('.leaf-number', leaf));
}

document.addEventListener('DOMContentLoaded', () => {
  getEventListener('.add-leaf-down')('click', () => {
    addNode();
  });
});
