// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const PageFooter = () => (
    <footer id='footer' role='contentinfo'>
        <div className='powered-by'>
            powered-by			
            <a href='http://www.github.com/eclipse/sw360' rel='external' target='_blank'>SW360</a> |
            <a href='/resource/mkdocs/index.html' rel='external' target='_blank'>SW360 Docs</a> |
            <a href='/resource/docs/api-guide.html' rel='external' target='_blank'>REST API Docs</a> |
            <a href='https://github.com/eclipse/sw360/issues' rel='external' target='_blank'> Report an issue.</a>
        </div>
        <div className='build-info text-muted'>
            Version: 16.0.0 | Branch: UNKNOWN (d15db4a) | Build time: 2023-02-13T02:10:24Z
        </div>
    </footer>
)

export default PageFooter