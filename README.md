### Web component extensions

This repository contains some extensions for [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

#### Add observed properties

Custom elements currently comes with 4 lifecycle methods. From [MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)

- `connectedCallback()` Invoked each time the custom element is appended into a document-connected element. This will happen each time the node is moved, and may happen before the element's contents have been fully parsed 
- `disconnectedCallback()` Invoked each time the custom element is disconnected from the document's DOM
- `attributeChangedCallback(name, oldValue, newValue)` Invoked each time one of the custom element's attributes is added, removed, or changed. Which attributes to notice change for is specified in a `static get observedAttributes` method
- `adoptedCallback()` Invoked each time the custom element is moved to a new document

At first glance, `attributeChangedCallback` might be quite useful, but it does not allow to pass any value besides type of `string` due to [difference between attribute and property](https://stackoverflow.com/questions/258469/what-is-the-difference-between-attribute-and-property#:~:text=Attribute%20is%20a%20quality%20or,clay%20is%20its%20adhesive%20quality),
or taken from another [stackoverflow thread](https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html).
So, imagine using complex types like arrays, objects with your custom elements, `attributeChangedCallback` will not be enough, since the attribute will be stringified.

As a result, one may wonder how to achieve to add this extension to custom elements, and this repo contains [add-observed-properties.js](./observed-properties/add-observed-properties.js) script to demonstrate it hypothetically.

Before all, switch to observed-properties directory, by simply running

```shell
cd observed-properties
```

### Install

To install dependencies, simply run

```shell
npm install
```

### Start

To start development server to serve the basic assets, simply run

```shell
npm run serve
```

And visit [http://127.0.0.1:8080](http://127.0.0.1:8080) or [http://192.168.178.43:8080](http://192.168.178.43:8080) in your favorite browser.

### Assets and folder structure

Here is the [index.html](./observed-properties/index.html) with two script files; one for extending observed attributes, and one for our dummy web component:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Observed properties</title>
        <script src="add-observed-properties.js"></script>
        <script src="components/my-component.js"></script>
    </head>
    <body>
        <my-component></my-component>
    </body>
</html>
```

Test component contains basic implementation that uses lifecycle callback with additional one; `propertyChangedCallback`:

```javascript
class MyComponent extends HTMLElement {
    static get observedAttributes() {
        return ['index'];
    }

    static get observedProperties() {
        return ['list'];
    }

    listItems = ['banana', 'apple', 'strawberry',' plum', 'orange'];

    connectedCallback() {
        this.innerHTML += `
            <h1>My component</h1>
            <div>
                <div>
                   <label for="index-attr-value">Index :</label>&nbsp;<span id="index-attr-value">${this.getAttribute('index') || '0'}</span>
                </div>
                <div>
                   <label for="list-prop-value">List :</label>&nbsp;<span id="list-prop-value">${JSON.stringify(this.list || [])}</span>
                </div>
            </div>
            <div>
                <button id="increase-index">Increase index</button>
                <button id="update-list">Update list</button>
            </div>
        `;

        this.querySelector('#increase-index').addEventListener('click', () => this.increaseIndex());
        this.querySelector('#update-list').addEventListener('click', () => this.updateList());
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.querySelector('#index-attr-value').innerText = this.getAttribute('index') || 0;
        this.querySelector('#list-prop-value').style.color = newValue && newValue % 2 ? '#FF00FF' : '#00FF00';
    }

    propertyChangedCallback(name, oldValue, newValue) {
        this.querySelector('#list-prop-value').innerText = JSON.stringify(this.list);
    }

    increaseIndex() {
        let index = Number.parseInt(this.getAttribute('index') || '0');
        index++;
        this.setAttribute('index', index.toString(10));
    }

    updateList() {
        const randIndex = Math.floor(Math.random() * this.listItems.length);
        const randItem = this.listItems[randIndex];
        const list = this.list || [];
        this.list = [...list, randItem];
    }
}

customElements.define('my-component', MyComponent);
```

And the most important piece for this logic is:

```javascript
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
```

### Explanation

This extension does 2 important things:

- Uses [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to trap the construction of custom element, and injects the logic
- In the injected logic, gets the defined `observedProperties` in the similar way that it would be configured as `observedAttributes`, and re-defines `setter` and `getters` on the created instance's observed properties, and injects a call for `propertyChangedCallback` (if exists on prototype of the custom element's class) with a similar interface used for `attributeChangedCallback`.

With this implementation, you can use your custom elements within frameworks (like angular) to pass more complex data structures and update templates accordingly.

Enjoy :)
