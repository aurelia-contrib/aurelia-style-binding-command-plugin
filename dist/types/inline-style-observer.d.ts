import { ICallable } from './shared';
export declare class InlineStyleObserver {
    private element;
    private cssRule;
    private hyphenatedCssRule;
    private value;
    private prevValue;
    private mo;
    constructor(element: Element, cssRule: string);
    getValue(): string;
    setValue(newValue: any): void;
    notify(): void;
    private syncValue;
    private observeMutation;
    private unobserveMutation;
    subscribe(context: string, callable: ICallable): void;
    unsubscribe(context: string, callable: ICallable): void;
}
