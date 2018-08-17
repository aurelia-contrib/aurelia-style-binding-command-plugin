import { bindingMode } from 'aurelia-binding';
import { Container } from 'aurelia-dependency-injection';
import { ViewResources } from 'aurelia-templating';
import { SyntaxInterpreter } from 'aurelia-templating-binding';
import { StyleExpression } from 'style-expression';
import '../../src/style-command';

describe('SyntaxInterpreter Extension', () => {

  let container: Container;
  let resources: ViewResources;
  let syntaxInterpreter: SyntaxInterpreter;
  let element: Element;
  let styleExpression: StyleExpression;

  beforeEach(() => {
    container = new Container();
    resources = new ViewResources();
    element = document.createElement('div');
    syntaxInterpreter = container.get(SyntaxInterpreter);
  });

  it('handles .style, .style-to-view, .style-one-way commands', () => {
    styleExpression = syntaxInterpreter.style(resources, element, { attrValue: 'bg', attrName: 'background-color' });
    expect(styleExpression instanceof StyleExpression).toBe(true, 'It should have created StyleExpression');
    expect(styleExpression['mode']).toBe(bindingMode.toView);
    expect(styleExpression['targetProperty']).toBe('background-color');
    expect(styleExpression['lookupFunctions']).toBe(resources['lookupFunctions']);
  });

  it('handles .style-one-time command', () => {
    styleExpression = syntaxInterpreter['style-one-time'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
    expect(styleExpression instanceof StyleExpression).toBe(true, 'It should have created StyleExpression');
    expect(styleExpression['mode']).toBe(bindingMode.oneTime);
    expect(styleExpression['targetProperty']).toBe('background-color');
    expect(styleExpression['lookupFunctions']).toBe(resources['lookupFunctions']);
  });

  it('handles .style-from-view command', () => {
    styleExpression = syntaxInterpreter['style-from-view'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
    expect(styleExpression instanceof StyleExpression).toBe(true, 'It should have created StyleExpression');
    expect(styleExpression['mode']).toBe(bindingMode.fromView);
    expect(styleExpression['targetProperty']).toBe('background-color');
    expect(styleExpression['lookupFunctions']).toBe(resources['lookupFunctions']);
  });

  it('handles .style-two-way command', () => {
    styleExpression = syntaxInterpreter['style-two-way'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
    expect(styleExpression instanceof StyleExpression).toBe(true, 'It should have created StyleExpression');
    expect(styleExpression['mode']).toBe(bindingMode.twoWay);
    expect(styleExpression['targetProperty']).toBe('background-color');
    expect(styleExpression['lookupFunctions']).toBe(resources['lookupFunctions']);
  });
});
