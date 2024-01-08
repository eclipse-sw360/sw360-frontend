// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Gravatar from './Gravatar'
import './Gravatar.module.css'

interface GravatarProps {
    email: string
}

const gravatar = {
    title: 'SW360/Gravatar',
    component: Gravatar,
}

const Template = (args: GravatarProps) => (
    <div className='gravatar-container'>
        <Gravatar {...args} />
    </div>
)

export const Primary = Template.bind({})

export default gravatar
