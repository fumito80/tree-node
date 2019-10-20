'use strict';

const rootNode = $()('.rootNode') as HTMLElement;
const template = $()('template') as HTMLTemplateElement;

// function getAddress(leafOrNode: HTMLDivElement, ): string {
//   return '';
// }

function addTemplate(selecor: string) {
  return (address?: string) => {
    const target = Maybe.fromNullable(address)
      .map($<HTMLDivElement>(rootNode))
      .getOrElse(rootNode);
    return Maybe.of(selecor)
      .map(template.content.querySelector.bind(template.content))
      .map(F.flipCurried(document.importNode.bind(document))(true))
      .map(target.appendChild.bind(target))
      .value as HTMLElement;
  }
}

function addNode(address?: string): void {
  addTemplate('.node')(address);
}

function setElementText(text: string) {
  return (el: HTMLElement | null) => {
    if (el != null) {
      el.textContent = text;
    }
    return el;
  }
}

function addLeaf(address?: string) {
  const leaf = addTemplate('.leaf')(address);
  const index = $$(rootNode)('.leaf').findIndex((el) => el === leaf) + 1;
  setElementText(String(index))($<HTMLDivElement>(leaf)('.leaf-number'));
}

document.addEventListener('DOMContentLoaded', () => {
  addNode();
  addLeaf();
  addLeaf();
});
