import { createApp, h, type Component } from 'vue';

export function transformTag(
    el: HTMLElement,
    component: Component,
    props: Record<string, any> = {}
): void {
    // On garde le contenu du span comme slot
    const slotContent = el.innerHTML;

    // On vide l'élément pour que Vue puisse le contrôler
    el.innerHTML = '';

    // On monte directement le composant sur l'élément existant
    const app = createApp({
        render() {
            return h(component, props, {
                default: () => slotContent
            });
        }
    });

    app.mount(el);
}
