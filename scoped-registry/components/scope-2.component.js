class Scope2Component extends HTMLElement {
    connectedCallback() {
        this.innerHTML += `
            <h4>Scope 2 component</h4>
            <div>Scope 2 component</div>
        `;
    }

    disconnectedCallback() {
        console.log('scope 2 component disconnected');
    }
}

window['scope-2'] = {
    componentConfig: [
        {
            selector: 'scoped-element',
            factory: Scope2Component
        }]
};
