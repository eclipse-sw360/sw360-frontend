// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { CheckRepoActions, simpleGit } from 'simple-git'

interface FrontendBuildInfo {
    version: string
    gitBranch: string
    gitCommit: string
}

// Build tooling only. Never import this module into application or Next.js startup code.
export async function generateBuildInfo(root: string, development = false): Promise<FrontendBuildInfo> {
    const pkg: unknown = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
    if (typeof pkg !== 'object' || pkg === null || !('version' in pkg) || typeof pkg.version !== 'string') {
        throw new Error('package.json must contain a version string.')
    }

    const info: FrontendBuildInfo = {
        version: pkg.version,
        gitBranch: 'unknown',
        gitCommit: 'unknown',
    }
    try {
        const git = simpleGit({
            baseDir: root,
            trimmed: true,
        })
        if (!(await git.checkIsRepo(CheckRepoActions.IS_REPO_ROOT))) {
            throw new Error('The build directory must be the root of a Git checkout.')
        }
        info.gitCommit = await git.revparse([
            'HEAD',
        ])
        const branch = await git.revparse([
            '--abbrev-ref',
            'HEAD',
        ])
        info.gitBranch = branch === 'HEAD' ? 'detached HEAD' : branch
    } catch (cause) {
        if (!development) {
            throw new Error('Cannot generate build metadata. Install Git and build from a Git checkout.', {
                cause,
            })
        }
        console.warn('Git metadata is unavailable; development footer will show unknown.', cause)
    }

    const output = resolve(root, 'frontend-build-info.json')
    await writeFile(output, `${JSON.stringify(info, null, 2)}\n`, 'utf8')
    return info
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        await generateBuildInfo(fileURLToPath(new URL('../', import.meta.url)), process.argv.includes('--development'))
    } catch (error) {
        console.error(error)
        process.exitCode = 1
    }
}
