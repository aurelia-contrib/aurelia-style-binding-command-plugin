import { InlineStyleObserver } from '../../src/inline-style-observer';
import * as Color from 'color';
import { styleObserverContext } from 'shared';

describe('InlineStyleObserver', () => {

  let element: HTMLElement;
  let cssRule: string;
  let observer: InlineStyleObserver;

  beforeEach(() => {
    element = document.body.appendChild(document.createElement('div'));
  });

  afterEach(() => {
    document.body.removeChild(element);
  })

  it('getValue', () => {
    cssRule = 'background-color';
    observer = new InlineStyleObserver(element, cssRule);
    element.style.backgroundColor = '#fff';
    expect(observer.getValue()).toBe(Color('#fff').rgb().toString());
  });

  it('setValue', () => {
    cssRule = 'backgroundColor';
    observer = new InlineStyleObserver(element, cssRule);
    observer.setValue('#fff');
    expect(observer.getValue()).toBe(Color('#fff').rgb().toString());
  });

  it('subscribes / unsubscribes', () => {
    const binding = {
      call() { }
    };
    cssRule = 'color';
    observer = new InlineStyleObserver(element, cssRule);
    expect(observer.hasSubscribers()).toBe(false, 'It should have had no subscribers');
    observer.subscribe(styleObserverContext, binding);
    expect(observer.hasSubscribers()).toBe(true, 'It should have had 1 subscriber');
    expect(observer['mo'] instanceof MutationObserver).toBe(true, 'It should have had MutationObserver setup');
    observer.unsubscribe(styleObserverContext, binding);
    expect(observer.hasSubscribers()).toBe(false, 'It should have removed all subscribers');
    expect(observer['mo']).toBe(null, 'It should have disconnected and dereferenced MutationObserver');

  });

  it('notifies', (done: DoneFn) => {
    let newStyle: string;
    let oldStyle: string;
    const binding = {
      count: 1,
      call(_context: any, $newStyle: string, $oldStyle: string) {
        this.count++;
        newStyle = $newStyle;
        oldStyle = $oldStyle;
      }
    };
    cssRule = 'color';
    observer = new InlineStyleObserver(element, cssRule);
    observer.subscribe(styleObserverContext, binding);
    expect(newStyle).toBeUndefined();
    expect(oldStyle).toBeUndefined();
    element.style.color = '#fff';
    const spy = spyOn(observer, 'syncValue' as any).and.callThrough();
    // use set timeout to wait for MutationObserver to notify changes
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      expect(newStyle).toBe(Color('#fff').rgb().toString());
      expect(oldStyle).toBeUndefined();
      element.className = 'asd';
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      }, 40);
    }, 40);
  });
});
