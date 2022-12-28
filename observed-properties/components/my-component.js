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
                   <label>Index :</label>&nbsp;<span id="index-attr-value">${this.getAttribute('index') || '0'}</span>
                </div>
                <div>
                   <label>List :</label>&nbsp;<span id="list-prop-value">${JSON.stringify(this.list || [])}</span>
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
