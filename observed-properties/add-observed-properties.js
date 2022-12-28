(() => {
    // redefine html element constructor to trap constructor in order to inject property proxy
    HTMLElement = new Proxy(HTMLElement, {
        construct(target, argArray, newTarget) {
            let newTargetInstance = Reflect.construct(target, argArray, newTarget);
            const proxy = {};
            newTarget.observedProperties.forEach(observedProperty => {
                // assign initial values to proxy
                proxy[observedProperty] = newTargetInstance[observedProperty];
                // proxy properties on component instance
                Object.defineProperty(newTargetInstance, observedProperty, {
                    get() {
                        return proxy[observedProperty];
                    },
                    set(v) {
                        // get the copy of old value
                        const oldValue = proxy[observedProperty];
                        // set the new value before callback is executed
                        proxy[observedProperty] = v;
                        if (newTarget.prototype.propertyChangedCallback) {
                            // execute callback if the property has changed, basic eqeqeq comparison
                            if (oldValue !== v) {
                                newTargetInstance.propertyChangedCallback(observedProperty, oldValue, v);
                            }
                        }
                    },
                    // set configurable false to prevent initial override before the custom element is constructed
                    configurable: false,
                });
            });

            return newTargetInstance;
        }
    });
})();
