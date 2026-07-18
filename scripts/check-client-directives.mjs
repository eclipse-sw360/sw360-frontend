// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const clientComponentDirectories = [
    path.join('src', 'app') + path.sep,
    path.join('src', 'components') + path.sep,
]
const fileExtensions = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
])
const invalidDirectives = new Set([
    'use-client',
    'used-client',
])
const clientMarkers = [
    /from\s+['"]next-auth\/react['"]/,
    /from\s+['"][^'"]*authenticatedApi\.util['"]/,
    /from\s+['"][^'"]*api\.util['"]/,
    /\bApiUtils\./,
    /\bwindow\b/,
    /\bdocument\b/,
    /\blocation\b/,
    /\buse(State|Effect|LayoutEffect|Reducer|Ref|Memo|Callback|ImperativeHandle)\b/,
]

function getMeaningfulFirstStatement(content) {
    const lines = content.split(/\r?\n/)
    let inBlockComment = false

    for (const line of lines) {
        const trimmed = line.trim()

        if (inBlockComment) {
            if (trimmed.includes('*/')) {
                inBlockComment = false
            }
            continue
        }

        if (trimmed === '') {
            continue
        }

        if (trimmed.startsWith('/*')) {
            if (!trimmed.includes('*/')) {
                inBlockComment = true
            }
            continue
        }

        if (trimmed.startsWith('//')) {
            continue
        }

        return trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed
    }

    return ''
}

function isClientComponentFile(relativePath) {
    return (
        relativePath.endsWith('.tsx') &&
        clientComponentDirectories.some((directory) => relativePath.startsWith(directory))
    )
}

function isAppDirectoryFileMakingApiCalls(relativePath, content) {
    // Check if this is a .tsx file under src/app (any file in the page tree)
    const isAppFile = relativePath.endsWith('.tsx') && relativePath.startsWith(path.join('src', 'app') + path.sep)

    if (!isAppFile) return false

    // Any file under src/app that makes API calls must be a client component
    // because they're part of the page tree and could execute server-side
    const apiCallPatterns = [
        /from\s+['"][^'"]*authenticatedApi\.util['"]/,
        /from\s+['"][^'"]*api\.util['"]/,
        /\bApiUtils\./,
    ]

    return apiCallPatterns.some((pattern) => pattern.test(content))
}

function hasValidUseClientDirective(content) {
    const firstStatement = getMeaningfulFirstStatement(content)
    return firstStatement === "'use client'" || firstStatement === '"use client"'
}

function findInvalidDirective(content) {
    const lines = content.split(/\r?\n/)
    for (const line of lines) {
        const match = line.trim().match(/^(?<quote>['"])(?<directive>use-client|used-client)\k<quote>;?$/)
        if (match?.groups?.directive) {
            return match.groups.directive
        }
    }
    return undefined
}

function hasServerSessionUsage(content) {
    return /\bgetServerSession\b/.test(content)
}

function usesClientOnlyPatterns(content) {
    return clientMarkers.some((pattern) => pattern.test(content))
}

function normalizePaths(values) {
    return values
        .map((value) => value.trim())
        .filter((value) => value !== '')
        .map((value) => path.normalize(value))
        .filter((value) => fileExtensions.has(path.extname(value)))
        .filter((value) => value.startsWith('src' + path.sep) || value.startsWith('src/'))
}

function getStagedFiles() {
    const output = execFileSync(
        'git',
        [
            'diff',
            '--cached',
            '--name-only',
            '--diff-filter=ACMR',
        ],
        {
            cwd: repoRoot,
            encoding: 'utf8',
        },
    )
    return normalizePaths(output.split(/\r?\n/))
}

function getTargetFiles(argv) {
    if (argv.length > 0) {
        return normalizePaths(argv)
    }

    return getStagedFiles()
}

function main() {
    const targetFiles = getTargetFiles(process.argv.slice(2))

    if (targetFiles.length === 0) {
        process.exit(0)
    }

    const issues = []

    for (const relativePath of targetFiles) {
        const absolutePath = path.join(repoRoot, relativePath)

        if (!fs.existsSync(absolutePath)) {
            continue
        }

        const content = fs.readFileSync(absolutePath, 'utf8')
        const invalidDirective = findInvalidDirective(content)

        if (invalidDirective && invalidDirectives.has(invalidDirective)) {
            issues.push(`${relativePath}: replace '${invalidDirective}' with 'use client'`)
            continue
        }

        if (hasValidUseClientDirective(content) && hasServerSessionUsage(content)) {
            issues.push(`${relativePath}: do not use getServerSession in 'use client' files`)
        }

        if (
            isClientComponentFile(relativePath) &&
            usesClientOnlyPatterns(content) &&
            !hasValidUseClientDirective(content)
        ) {
            issues.push(`${relativePath}: add 'use client' as the first statement for client-only component code`)
        }

        if (isAppDirectoryFileMakingApiCalls(relativePath, content) && !hasValidUseClientDirective(content)) {
            issues.push(`${relativePath}: files under src/app making API calls must declare 'use client'`)
        }
    }

    if (issues.length === 0) {
        process.exit(0)
    }

    process.stderr.write('Client directive check failed:\n')
    for (const issue of issues) {
        process.stderr.write(`- ${issue}\n`)
    }
    process.stderr.write(
        '\nThis repo is frontend-client-first for now, so staged app/components files with client-only code must declare `use client`.\n',
    )
    process.exit(1)
}

main()
