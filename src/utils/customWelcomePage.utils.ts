// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export function createWelcomePageSrcDoc(
    html: string,
    appearance: CSSStyleDeclaration = getComputedStyle(document.body),
): string {
    const template = document.createElement('template')
    template.innerHTML = html
    const allowedTags = new Set(
        'a article b blockquote br code dd div dl dt em footer h1 h2 h3 h4 h5 h6 header hr i li main ol p pre section small span strong style sub sup table tbody td th thead tr ul'.split(
            ' ',
        ),
    )
    const allowedAttributes = new Set([
        'class',
        'dir',
        'lang',
        'style',
        'title',
    ])
    for (const element of template.content.querySelectorAll('*')) {
        if (element.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !allowedTags.has(element.localName)) {
            element.remove()
            continue
        }
        const href = element.localName === 'a' ? element.getAttribute('href') : null
        for (const attribute of Array.from(element.attributes)) {
            if (!allowedAttributes.has(attribute.name)) {
                element.removeAttribute(attribute.name)
            }
        }

        if (href) {
            try {
                const url = new URL(href)
                if (url.protocol === 'https:' && !url.username && !url.password) {
                    element.setAttribute('href', url.href)
                    element.setAttribute('target', '_blank')
                    element.setAttribute('rel', 'noopener noreferrer')
                }
            } catch {
                // Relative and malformed links intentionally remain non-navigable.
            }
        }
    }

    const bodyStyles = document.createElement('div').style
    for (const property of [
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'color',
        'display',
        'margin',
        'overflow-wrap',
        '--link-color',
        '--link-hover-color',
    ]) {
        bodyStyles.setProperty(property, appearance.getPropertyValue(property))
    }

    const styles = document.createElement('style')
    styles.textContent = `
        body { ${bodyStyles.cssText} }
        a[href] { color: var(--link-color); text-decoration: none; }
        a[href]:hover, a[href]:focus-visible { color: var(--link-hover-color); }
    `

    // API headers do not transfer to srcDoc. Block scripts and network resources.
    const csp = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta charset="utf-8">${styles.outerHTML}</head><body>${template.innerHTML}</body></html>`
}
