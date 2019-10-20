'use strict';

const rootNode = $()('.rootNode') as HTMLElement;
const template = $()('template') as HTMLTemplateElement;

function getAddress(leafOrNode: HTMLDivElement, ): string {
  return '';
}

function getTemplateElement(selector: string) {
  return template.content.querySelector<HTMLElement>(selector);
}

function getImportedTemplate(template: HTMLElement) {
  return document.importNode(template, true);
}

function appendChild(target: HTMLElement) {
  return (child: HTMLElement) => {
    target.appendChild(child);
    return target;
  }
}

function addTemplate(address?: string) {
  // Maybe.of('.node')
  //   .map(getTemplateElement)
  //   .map(getImportedTemplate)
  //   .map(
  //     Maybe.fromNullable(address)
  //       .map($<HTMLDivElement>(rootNode))
  //       .getOrElse(rootNode)
  //       .appendChild.bind(rootNode)
  //   );
  return pipe<string, HTMLDivElement>(
    getTemplateElement,
    getImportedTemplate,
    appendChild(
      Maybe.fromNullable(address)
        .map($<HTMLDivElement>(rootNode))
        .getOrElse(rootNode)
    ),
  );
}

function addNode(address?: string) {
  return addTemplate(address)('.node');
}

document.addEventListener('DOMContentLoaded', _ => {
  addNode();
});
