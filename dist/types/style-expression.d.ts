import { bindingMode, Expression, Scope, ObserverLocator } from 'aurelia-binding';
import { InlineStyleObserver } from './inline-style-observer';
import { IStyleObservableElement } from './shared';
export declare class StyleExpression {
    private observerLocator;
    private sourceExpression;
    private targetProperty;
    private mode;
    private lookupFunctions;
    /**
     * Signal template compiler this is a normal expression
     */
    discrete: boolean;
    constructor(observerLocator: ObserverLocator, sourceExpression: Expression, targetProperty: string, mode: bindingMode, lookupFunctions: any);
    createBinding(target: Element): StyleBinding;
}
export interface StyleBinding {
    _version: number;
    observe(): void;
    unobserve(all?: boolean): void;
}
export declare class StyleBinding {
    private target;
    private targetProperty;
    private lookupFunctions;
    observerLocator: ObserverLocator;
    styleObserver: InlineStyleObserver;
    source: Scope;
    sourceExpression: Expression;
    mode: bindingMode;
    isBound: boolean;
    constructor(observerLocator: ObserverLocator, sourceExpression: Expression, target: IStyleObservableElement, targetProperty: string, mode: bindingMode, lookupFunctions: any);
    updateTarget(value: any): void;
    updateSource(value: any): void;
    call(context: string, newValue: any, oldValue: any): void;
    bind(source: Scope): void;
    unbind(): void;
    connect(evaluate?: boolean): void;
}
