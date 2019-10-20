'use strict';

const rootNode = $()('.rootNode') as HTMLElement;
const template = $()('template') as HTMLTemplateElement;

// function getAddress(leafOrNode: HTMLDivElement, ): string {
//   return '';
// }

function addTemplate(selecor: string) {
  return (address?: string): void => {
    const target = Maybe.fromNullable(address)
      .map($<HTMLDivElement>(rootNode))
      .getOrElse(rootNode);
    Maybe.of(selecor)
      .map(template.content.querySelector.bind(template.content))
      .map(F.flipCurried(document.importNode.bind(document))(true))
      .map(target.appendChild.bind(target));
  }
}

function addNode(address?: string): void {
  addTemplate('.node')(address);
}

// function addLeaf(address?: string): void {
//   addTemplate('.leaf')(address);
// }

document.addEventListener('DOMContentLoaded', () => {
  addNode();
});
