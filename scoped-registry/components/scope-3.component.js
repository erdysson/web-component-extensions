class Scope3Component extends HTMLElement {
    connectedCallback() {
        this.innerHTML += `
            <h4>Scope 3 component</h4>
            <div>Scope 3 component</div>
        `;
    }

    disconnectedCallback() {
        console.log('scope 3 component disconnected');
    }
}

window['scope-3'] = {
    componentConfig: [
        {
            selector: 'scoped-element',
            factory: Scope3Component
        }]
};
