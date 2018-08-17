import { subscriberCollection } from 'aurelia-binding';
import { DOM } from 'aurelia-pal';
import { ICallable, hyphenate } from './shared';

/**@internal */
export interface InlineStyleObserver {

  addSubscriber(context: string, callable: ICallable): void;

  removeSubscriber(context: string, callable: ICallable): boolean;

  hasSubscribers(): boolean;

  callSubscribers(newValue: any, oldValue: any): void;
}


export class InlineStyleObserver {

  private element: Element;

  private cssRule: string;

  private hyphenatedCssRule: string;

  private value: any;

  private prevValue: any;

  private mo: MutationObserver;

  constructor(
    element: Element,
    cssRule: string
  ) {
    this.element = element;
    this.cssRule = cssRule;
    this.hyphenatedCssRule = hyphenate(cssRule);
  }

  getValue() {
    return (this.element as HTMLElement).style.getPropertyValue(this.hyphenatedCssRule);
  }

  setValue(newValue: any) {
    if (newValue !== this.value) {
      this.prevValue = this.value;
      this.value = newValue;
      (this.element as HTMLElement).style.setProperty(this.hyphenatedCssRule, this.value);
      this.notify();
    }
  }

  notify() {
    const prev = this.prevValue;
    const curr = this.value;
    this.callSubscribers(curr, prev);
  }

  private syncValue() {
    const prev = this.value;
    const value = this.getValue();
    if (value !== prev) {
      this.prevValue = prev;
      this.value = value;
      this.notify();
    }
  }

  private observeMutation() {
    if (!this.mo) {
      this.mo = DOM.createMutationObserver(() => this.syncValue());
      this.mo.observe(this.element, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
  }

  private unobserveMutation() {
    if (this.mo) {
      this.mo.disconnect();
      this.mo = null;
    }
  }

  subscribe(context: string, callable: ICallable) {
    if (!this.hasSubscribers()) {
      this.observeMutation();
    }
    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.unobserveMutation();
    }
  }
}

subscriberCollection()(InlineStyleObserver);
