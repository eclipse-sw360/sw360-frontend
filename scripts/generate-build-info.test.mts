// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { simpleGit } from 'simple-git'
import { generateBuildInfo } from './generate-build-info.mts'

test('generates checkout metadata, handles detached HEAD, and persists without Git', async (context) => {
    const root = await mkdtemp(join(tmpdir(), 'sw360-build-info-'))
    context.after(
        async () =>
            await rm(root, {
                recursive: true,
                force: true,
            }),
    )
    await writeFile(
        join(root, 'package.json'),
        JSON.stringify({
            version: '2.3.4',
        }),
    )
    const git = simpleGit(root)
    await git.init()
    await git.addConfig('user.name', 'Build Metadata Test')
    await git.addConfig('user.email', 'build-test@example.invalid')
    await git.addConfig('commit.gpgsign', 'false')
    await git.checkoutLocalBranch('metadata-test')
    await git.add('package.json')
    await git.commit('Test fixture')
    const sha = await git.revparse([
        'HEAD',
    ])
    const info = await generateBuildInfo(root)
    assert.deepEqual(info, {
        version: '2.3.4',
        gitBranch: 'metadata-test',
        gitCommit: sha,
    })

    // A later build must overwrite the previous build's identity.
    await git.commit('Second fixture commit', {
        '--allow-empty': null,
    })
    const nextSha = await git.revparse([
        'HEAD',
    ])
    await git.checkout([
        '--detach',
        nextSha,
    ])
    const detached = await generateBuildInfo(root)
    assert.equal(detached.gitCommit, nextSha)
    assert.notEqual(detached.gitCommit, sha)
    assert.equal(detached.gitBranch, 'detached HEAD')

    await rm(join(root, '.git'), {
        recursive: true,
        force: true,
    })
    const stored: unknown = JSON.parse(await readFile(join(root, 'frontend-build-info.json'), 'utf8'))
    assert.deepEqual(stored, detached)
    await assert.rejects(generateBuildInfo(root), /Cannot generate build metadata/)
})

test('development permits missing Git, production does not', async (context) => {
    const root = await mkdtemp(join(tmpdir(), 'sw360-no-git-'))
    context.after(
        async () =>
            await rm(root, {
                recursive: true,
                force: true,
            }),
    )
    await writeFile(
        join(root, 'package.json'),
        JSON.stringify({
            version: '1.0.0',
        }),
    )
    await assert.rejects(generateBuildInfo(root), /Cannot generate build metadata/)
    const warning = context.mock.method(console, 'warn', () => undefined)
    assert.deepEqual(await generateBuildInfo(root, true), {
        version: '1.0.0',
        gitBranch: 'unknown',
        gitCommit: 'unknown',
    })
    assert.equal(warning.mock.callCount(), 1)
})
