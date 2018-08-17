import { subscriberCollection, bindingMode, connectable, enqueueBindingConnect, sourceContext } from 'aurelia-binding';
import { DOM } from 'aurelia-pal';
import { SyntaxInterpreter } from 'aurelia-templating-binding';

const styleObserverContext = 'StyleObserver:context';
const hyphenateCache = Object.create(null);
const capitalMatcher = /([A-Z])/g;
function addHyphenAndLower(char) {
    return '-' + char.toLowerCase();
}
function hyphenate(name) {
    if (name in hyphenateCache) {
        return hyphenateCache[name];
    }
    return hyphenateCache[name] = (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
}

class InlineStyleObserver {
    constructor(element, cssRule) {
        this.element = element;
        this.cssRule = cssRule;
        this.hyphenatedCssRule = hyphenate(cssRule);
    }
    getValue() {
        return this.element.style.getPropertyValue(this.hyphenatedCssRule);
    }
    setValue(newValue) {
        if (newValue !== this.value) {
            this.prevValue = this.value;
            this.value = newValue;
            this.element.style.setProperty(this.hyphenatedCssRule, this.value);
            this.notify();
        }
    }
    notify() {
        const prev = this.prevValue;
        const curr = this.value;
        this.callSubscribers(curr, prev);
    }
    syncValue() {
        const prev = this.value;
        const value = this.getValue();
        if (value !== prev) {
            this.prevValue = prev;
            this.value = value;
            this.notify();
        }
    }
    observeMutation() {
        if (!this.mo) {
            this.mo = DOM.createMutationObserver(() => this.syncValue());
            this.mo.observe(this.element, {
                attributes: true
            });
        }
    }
    unobserveMutation() {
        if (this.mo) {
            this.mo.disconnect();
            this.mo = null;
        }
    }
    subscribe(context, callable) {
        if (!this.hasSubscribers()) {
            this.observeMutation();
        }
        this.addSubscriber(context, callable);
    }
    unsubscribe(context, callable) {
        if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
            this.unobserveMutation();
        }
    }
}
subscriberCollection()(InlineStyleObserver);

class StyleExpression {
    constructor(observerLocator, sourceExpression, targetProperty, mode, lookupFunctions) {
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.lookupFunctions = lookupFunctions;
    }
    createBinding(target) {
        return new StyleBinding(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.mode, this.lookupFunctions);
    }
}
class StyleBinding {
    constructor(observerLocator, sourceExpression, target, targetProperty, mode, lookupFunctions) {
        this.target = target;
        this.targetProperty = targetProperty;
        this.lookupFunctions = lookupFunctions;
        this.observerLocator = observerLocator;
        this.sourceExpression = sourceExpression;
        this.mode = mode;
    }
    updateTarget(value) {
        this.styleObserver.setValue(value);
    }
    updateSource(value) {
        this.sourceExpression.assign(this.source, value, this.lookupFunctions);
    }
    call(context, newValue, oldValue) {
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
    bind(source) {
        if (this.isBound) {
            if (this.source === source) {
                return;
            }
            this.unbind();
        }
        this.isBound = true;
        this.source = source;
        if (this.sourceExpression.bind) {
            this.sourceExpression.bind(this, source, this.lookupFunctions);
        }
        const styleObserver = this.target.__style_observer__;
        if (styleObserver) {
            this.styleObserver = styleObserver;
        }
        else {
            this.styleObserver = this.target.__style_observer__ = new InlineStyleObserver(this.target, this.targetProperty);
        }
        const mode = this.mode;
        if (mode !== bindingMode.fromView) {
            const value = this.sourceExpression.evaluate(source, this.lookupFunctions);
            this.updateTarget(value);
        }
        if (mode === bindingMode.oneTime) {
            return;
        }
        else if (mode === bindingMode.toView) {
            enqueueBindingConnect(this);
        }
        else if (mode === bindingMode.twoWay) {
            this.sourceExpression.connect(this, source);
            this.styleObserver.subscribe(styleObserverContext, this);
        }
        else if (mode === bindingMode.fromView) {
            this.styleObserver.subscribe(styleObserverContext, this);
        }
    }
    unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.unbind) {
            this.sourceExpression.unbind(this, this.source);
        }
        this.source = null;
        this.styleObserver.unsubscribe(styleObserverContext, this);
        this.styleObserver = null;
        this.unobserve(true);
    }
    connect(evaluate) {
        if (!this.isBound) {
            return;
        }
        if (evaluate) {
            let value = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
            this.updateTarget(value);
        }
        this.sourceExpression.connect(this, this.source);
    }
}
connectable()(StyleBinding);

const siProto = SyntaxInterpreter.prototype;
siProto.style = siProto['style-to-view'] = siProto['style-one-way'] = function (resources, element, info) {
    return new StyleExpression(this.observerLocator, this.parser.parse(info.attrValue), info.attrName, bindingMode.toView, resources.lookupFunctions);
};
siProto['style-one-time'] = function (resources, element, info) {
    return new StyleExpression(this.observerLocator, this.parser.parse(info.attrValue), info.attrName, bindingMode.oneTime, resources.lookupFunctions);
};
siProto['style-two-way'] = function (resources, element, info) {
    return new StyleExpression(this.observerLocator, this.parser.parse(info.attrValue), info.attrName, bindingMode.twoWay, resources.lookupFunctions);
};
siProto['style-from-view'] = function (resources, element, info) {
    return new StyleExpression(this.observerLocator, this.parser.parse(info.attrValue), info.attrName, bindingMode.fromView, resources.lookupFunctions);
};

export { InlineStyleObserver, StyleExpression, StyleBinding };
