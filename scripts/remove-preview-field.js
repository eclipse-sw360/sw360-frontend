#!/usr/bin/env node
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * This script helps in making the Next.js build deterministic by:
 * Removing the 'preview' field from specific prerender-manifest.json files.
 */

/* biome-ignore lint/style/noCommonJs: Standalone Node.js helper script */
const fs = require('fs')
/* biome-ignore lint/style/noCommonJs: Standalone Node.js helper script */
const path = require('path')

const manifestPaths = [
    path.join(__dirname, '../.next/standalone/.next/prerender-manifest.json'),
    path.join(__dirname, '../.next/prerender-manifest.json'),
]

try {
    for (const manifestPath of manifestPaths) {
        if (!fs.existsSync(manifestPath)) continue

        const content = fs.readFileSync(manifestPath, 'utf8')
        const manifest = JSON.parse(content)

        // Overwrite preview field with deterministic values instead of deleting it
        // to avoid 'TypeError: Cannot read properties of undefined (reading "previewModeId")' at runtime.
        manifest.preview = {
            previewModeId: 'deterministic-preview-mode-id',
            previewModeSigningKey: 'deterministic-preview-mode-signing-key',
            previewModeEncryptionKey: 'deterministic-preview-mode-encryption-key',
        }
        // Write back with 2-space indentation for consistency
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
        /* biome-ignore lint/suspicious/noConsole: CLI tool feedback */
        console.log(`Patched preview field in: ${path.relative(path.join(__dirname, '..'), manifestPath)}`)
    }
} catch (error) {
    /* biome-ignore lint/suspicious/noConsole: Required for CLI error reporting */
    console.error('Error during manifest patching:', error)
    process.exit(1)
}
