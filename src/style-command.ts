import { bindingMode, EventManager, ObserverLocator, Parser } from 'aurelia-binding';
import { ViewResources } from 'aurelia-templating';
import { SyntaxInterpreter } from 'aurelia-templating-binding';
import { StyleExpression } from 'style-expression';

/**@internal */
declare module 'aurelia-templating' {
  interface ViewResources {
    lookupFunctions: any;
  }
}

/**@internal */
declare module 'aurelia-templating-binding' {

  interface SyntaxInterpreter {

    parser: Parser;
    observerLocator: ObserverLocator;
    eventManager: EventManager;

    style(resources?: any, element?: any, info?: any, existingInstruction?: any, context?: any): any;
  }
}

interface IAttributeInspectionInfo {
  command: string;
  attrName: string;
  attrValue: string;
}

const siProto = SyntaxInterpreter.prototype;

siProto.style = siProto['style-to-view'] = siProto['style-one-way'] = function(
  this: SyntaxInterpreter,
  resources: ViewResources,
  element: Element,
  info: IAttributeInspectionInfo
) {
  return new StyleExpression(
    this.observerLocator,
    this.parser.parse(info.attrValue),
    info.attrName,
    bindingMode.toView,
    resources.lookupFunctions
  );
};

siProto['style-one-time'] = function(
  this: SyntaxInterpreter,
  resources: ViewResources,
  element: Element,
  info: IAttributeInspectionInfo
) {
  return new StyleExpression(
    this.observerLocator,
    this.parser.parse(info.attrValue),
    info.attrName,
    bindingMode.oneTime,
    resources.lookupFunctions
  );
};

siProto['style-two-way'] = function(
  this: SyntaxInterpreter,
  resources: ViewResources,
  element: Element,
  info: IAttributeInspectionInfo
) {
  return new StyleExpression(
    this.observerLocator,
    this.parser.parse(info.attrValue),
    info.attrName,
    bindingMode.twoWay,
    resources.lookupFunctions
  );
};

siProto['style-from-view'] = function(
  this: SyntaxInterpreter,
  resources: ViewResources,
  element: Element,
  info: IAttributeInspectionInfo
) {
  return new StyleExpression(
    this.observerLocator,
    this.parser.parse(info.attrValue),
    info.attrName,
    bindingMode.fromView,
    resources.lookupFunctions
  );
};
