import { InlineStyleObserver } from 'inline-style-observer';

export const styleObserverContext = 'StyleObserver:context';

export interface ICallable {
  call(...args: any[]): any;
}

export interface IStyleObservableElement extends Element {
  __style_observer__?: InlineStyleObserver;
}

const hyphenateCache: Record<string, string> = Object.create(null);
const capitalMatcher = /([A-Z])/g;

function addHyphenAndLower(char: string) {
  return '-' + char.toLowerCase();
}

export function hyphenate(name: string) {
  if (name in hyphenateCache) {
    return hyphenateCache[name];
  }
  return hyphenateCache[name] = (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}
