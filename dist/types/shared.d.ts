import { InlineStyleObserver } from 'inline-style-observer';
export declare const styleObserverContext = "StyleObserver:context";
export interface ICallable {
    call(...args: any[]): any;
}
export interface IStyleObservableElement extends Element {
    __style_observer__?: InlineStyleObserver;
}
export declare function hyphenate(name: string): string;
