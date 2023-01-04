class Scope1Component extends HTMLElement {
    connectedCallback() {
        this.innerHTML += `
            <h4>Scope 1 component</h4>
            <div>Scope 1 component</div>
        `;
    }

    disconnectedCallback() {
        console.log('scope 1 component disconnected');
    }
}

window['scope-1'] = {
    componentConfig: [
        {
            selector: 'scoped-element',
            factory: Scope1Component,
        }
    ],
};
