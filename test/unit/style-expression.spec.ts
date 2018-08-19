import { bindingMode, Scope, ObserverLocator } from 'aurelia-binding';
import { Container } from 'aurelia-dependency-injection';
import { ViewResources } from 'aurelia-templating';
import { SyntaxInterpreter } from 'aurelia-templating-binding';
import { InlineStyleObserver } from 'inline-style-observer';
import { StyleBinding, StyleExpression } from 'style-expression';
import { styleObserverContext } from 'shared';

describe('StyleExpression & StyleBinding', () => {

  let observerLocator: ObserverLocator;
  let container: Container;
  let resources: ViewResources;
  let syntaxInterpreter: SyntaxInterpreter;
  let element: HTMLElement;
  let styleExpression: StyleExpression;
  let styleBinding: StyleBinding;

  beforeEach(() => {
    container = new Container();
    resources = new ViewResources();
    element = document.createElement('div');
    syntaxInterpreter = container.get(SyntaxInterpreter);
    observerLocator = syntaxInterpreter.observerLocator;
  });


  describe('StyleExpression', () => {
    it('Creates binding', () => {
      styleExpression = syntaxInterpreter.style(resources, element, { attrValue: 'bg', attrName: 'background-color' });
      styleBinding = styleExpression.createBinding(element);
      expect(styleBinding.mode).toBe(bindingMode.toView);
      expect(styleBinding.mode).toBe(styleExpression['mode']);
      expect(styleBinding).toEqual(jasmine.any(StyleBinding), 'It should have created StyleBinding instance');
    });
  });

  describe('StyleBinding', () => {
    describe('bind()', () => {
      it('binds', () => {
        styleExpression = syntaxInterpreter.style(resources, element, { attrValue: 'bg', attrName: 'background-color' });
        styleBinding = styleExpression.createBinding(element);
        const scope: Scope = {
          bindingContext: { bg: '#fff' },
          overrideContext: null
        };
        styleBinding.bind(scope);
        expect((element as any).__style_observer__['background-color']).toEqual(styleBinding.styleObserver);
        expect(styleBinding.styleObserver).toEqual(jasmine.any(InlineStyleObserver));
        expect(styleBinding.styleObserver.hasSubscribers()).toBe(false, 'It should have had 0 subscriber');
        expect(element.style.backgroundColor).toBe('rgb(255, 255, 255)');
        expect(observerLocator.getObserver(scope, 'bg')).toBeDefined();
      });

      it('setups observer in from-view and two-way', () => {
        styleExpression = syntaxInterpreter['style-two-way'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
        styleBinding = styleExpression.createBinding(element);
        const scope: Scope = {
          bindingContext: { bg: '#fff' },
          overrideContext: null
        };
        styleBinding.bind(scope);
        expect(styleBinding.styleObserver.hasSubscribers()).toBe(true, 'It should have had 1 subscriber');

        styleExpression = syntaxInterpreter['style-from-view'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
        styleBinding = styleExpression.createBinding(element);
        styleBinding.bind(scope);
        expect(styleBinding.styleObserver.hasSubscribers()).toBe(true, 'It should have had 1 subscriber');
      });

      it('does nothing in one-time', () => {
        styleExpression = syntaxInterpreter['style-one-time'](resources, element, { attrValue: 'bg', attrName: 'background-color' });
        styleBinding = styleExpression.createBinding(element);

        const scope: Scope = {
          bindingContext: { bg: '#fff' },
          overrideContext: null
        };
        const spy = spyOn(observerLocator, 'getObserver');
        styleBinding.bind(scope);

        expect(spy).not.toHaveBeenCalled();
        expect(styleBinding.styleObserver.hasSubscribers()).toBe(false, 'It should have had 0 subscriber');
      });
    });

    it('unbinds', () => {
      styleExpression = syntaxInterpreter.style(resources, element, { attrValue: 'bg', attrName: 'background-color' });
      styleBinding = styleExpression.createBinding(element);
      const scope: Scope = {
        bindingContext: { bg: '#fff' },
        overrideContext: null
      };
      styleBinding.bind(scope);
      expect(styleBinding.isBound).toBe(true, 'It should have switched `isBound`');

      const spy = spyOn(styleBinding.styleObserver, 'removeSubscriber');
      styleBinding.unbind();
      expect(styleBinding.isBound).toBe(false, 'It should have switched `isBound`');
      expect(spy).toHaveBeenCalledWith(styleObserverContext, styleBinding);
    });

    it('works when there are multiple bindings on same element', (done) => {
      const expressions = [
        { rule: 'background-color', expression: 'bg' },
        { rule: 'width', expression: 'divWidth' },
        { rule: 'height', expression: 'divHeight' }
      ].map(e => new StyleExpression(
        observerLocator,
        syntaxInterpreter.parser.parse(e.expression),
        e.rule,
        bindingMode.toView,
        resources.lookupFunctions
      ));

      const bindings = expressions.map(e => e.createBinding(element));
      const viewModel = {
        bg: '#000',
        divWidth: '100px',
        divHeight: '100px'
      };
      const scope: Scope = {
        bindingContext: viewModel,
        overrideContext: null
      };
      bindings.forEach(b => b.bind(scope));
      expect(element.style.height).toBe('100px', 'It should have had height 100px');
      expect(element.style.width).toBe('100px', 'It should have had width 100px');
      expect(element.style.backgroundColor.replace(/ /g, '')).toBe(
        'rgb(0,0,0)',
        'It should have had background black in rgb'
      );
      viewModel.bg = '#fff';
      viewModel.divHeight = '150px';
      viewModel.divWidth = '120px';
      setTimeout(() => {
        expect(element.style.height).toBe('150px', 'It should have had height 100px');
        expect(element.style.width).toBe('120px', 'It should have had width 100px');
        expect(element.style.backgroundColor.replace(/ /g, '')).toBe(
          'rgb(255,255,255)',
          'It should have had background black in rgb'
        );
        done();
      }, 40);
    });
  });
});
