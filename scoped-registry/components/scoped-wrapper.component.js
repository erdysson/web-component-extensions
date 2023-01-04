class ScopedWrapperComponent extends HTMLElement {
    connectedCallback() {
        const scope = this.getAttribute('scope') || 'default';

        if (!window[scope].registry) {
            window[scope].registry = new CustomElementRegistry();

            window[scope].componentConfig.forEach(componentConfig => {
                window[scope].registry.define(componentConfig.selector, componentConfig.factory);
            });
        }

        const shadow = this.attachShadow({ mode: 'open', customElements: window[scope].registry });

        requestAnimationFrame(() => {
            const template = this.querySelector(`template`);
            shadow.appendChild(template.content);
        });
    }
}

customElements.define('scoped-wrapper', ScopedWrapperComponent);
