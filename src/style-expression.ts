import { Binding, BindingBehavior, bindingMode, connectable, enqueueBindingConnect, Expression, Scope, sourceContext, ObserverLocator } from 'aurelia-binding';
import { InlineStyleObserver } from './inline-style-observer';
import { IStyleObservableElement, styleObserverContext, hyphenate } from './shared';

/**@internal */
declare module 'aurelia-binding' {
  interface BindingBehavior {
    bind(...args: any[]): any;
    unbind(...args: any[]): any;
  }
}

export class StyleExpression {

  /**
   * Signal template compiler this is a normal expression
   */
  discrete: boolean;

  constructor(
    private observerLocator: ObserverLocator,
    private sourceExpression: Expression,
    private targetProperty: string,
    private mode: bindingMode,
    private lookupFunctions: any
  ) {

  }

  createBinding(target: Element) {
    return new StyleBinding(
      this.observerLocator,
      this.sourceExpression,
      target,
      this.targetProperty,
      this.mode,
      this.lookupFunctions
    );
  }
}

StyleExpression.prototype.discrete = true;

export interface StyleBinding {
  _version: number;
  observe(): void;
  unobserve(all?: boolean): void;
}

export class StyleBinding {

  observerLocator: ObserverLocator;

  styleObserver: InlineStyleObserver;

  source: Scope;

  sourceExpression: Expression;

  mode: bindingMode;

  isBound: boolean;

  constructor(
    observerLocator: ObserverLocator,
    sourceExpression: Expression,
    private target: IStyleObservableElement,
    private targetProperty: string,
    mode: bindingMode,
    private lookupFunctions: any,
  ) {
    this.observerLocator = observerLocator;
    this.sourceExpression = sourceExpression;
    this.mode = mode;
  }

  updateTarget(value: any) {
    this.styleObserver.setValue(value);
  }

  updateSource(value: any) {
    this.sourceExpression.assign(this.source, value, this.lookupFunctions);
  }

  call(context: string, newValue: any, oldValue: any) {
    if (!this.isBound) {
      return;
    }
    if (context === sourceContext) {
      oldValue = this.styleObserver.getValue();
      newValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      if (newValue !== oldValue) {
        this.updateTarget(newValue);
      }
      if (this.mode !== bindingMode.oneTime) {
        this._version++;
        this.sourceExpression.connect(this, this.source);
        this.unobserve(false);
      }
      return;
    }
    if (context === styleObserverContext) {
      if (newValue !== oldValue) {
        this.updateSource(newValue);
      }
      return;
    }
    throw new Error(`Unexpected context for style binding: "${context}"`);
  }

  bind(source: Scope) {
    if (this.isBound) {
      if (this.source === source) {
        return;
      }
      this.unbind();
    }
    this.isBound = true;
    this.source = source;

    if ((this.sourceExpression as BindingBehavior).bind) {
      (this.sourceExpression as BindingBehavior).bind(this, source, this.lookupFunctions);
    }

    const { target, targetProperty } = this;
    const styleObserversLookup = target.__style_observer__ || (target.__style_observer__ = {});
    const targetCssRule = hyphenate(targetProperty);
    let styleObserver: InlineStyleObserver = styleObserversLookup[targetCssRule];
    if (styleObserver) {
      this.styleObserver = styleObserver;
    } else {
      styleObserver = this.styleObserver = styleObserversLookup[targetCssRule] = new InlineStyleObserver(target, targetProperty);
    }

    const mode = this.mode;
    // In from-view bindind mode, element inline style should be synced to view model
    // during initialization phase. Only do so if there is that rule in inline style
    // Not simply resolving via getPropertyValue as it normalizes everything to an empty string
    // regardless the property presence
    if (mode === bindingMode.fromView) {
      if (target.hasAttribute('style')) {
        const ruleValue = this.findRuleValue((target as HTMLElement).style, targetCssRule);
        if (ruleValue !== null) {
          this.updateSource(ruleValue);
        }
      }
    } else {
      const value = this.sourceExpression.evaluate(source, this.lookupFunctions);
      this.updateTarget(value);
    }

    if (mode === bindingMode.oneTime) {
      return;
    } else if (mode === bindingMode.toView) {
      enqueueBindingConnect(this as Binding);
    } else if (mode === bindingMode.twoWay) {
      this.sourceExpression.connect(this, source);
      styleObserver.subscribe(styleObserverContext, this);
    } else if (mode === bindingMode.fromView) {
      styleObserver.subscribe(styleObserverContext, this);
    }
  }

  unbind() {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    if ((this.sourceExpression as BindingBehavior).unbind) {
      (this.sourceExpression as BindingBehavior).unbind(this, this.source);
    }
    this.source = null;
    this.styleObserver.unsubscribe(styleObserverContext, this);
    this.styleObserver = null;
    this.unobserve(true);
  }

  connect(evaluate?: boolean) {
    if (!this.isBound) {
      return;
    }
    if (evaluate) {
      let value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
      this.updateTarget(value);
    }
    this.sourceExpression.connect(this as Binding, this.source);
  }

  /**
   * @internal
   * Used to initially look for css value of a css rule
   */
  private findRuleValue(style: CSSStyleDeclaration, prop: string) {
    for (let i = 0, ii = style.length; ii > i; ++i) {
      if (style[i] === prop) {
        return style.getPropertyValue(prop);
      }
    }
    return null;
  }
}

(connectable as any)()(StyleBinding);
