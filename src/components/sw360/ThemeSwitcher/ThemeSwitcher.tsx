// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTheme } from 'next-themes'
import { Nav } from 'react-bootstrap'
import { BsSun, BsSunFill } from 'react-icons/bs'

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Nav.Item>
      {theme === 'dark' ? (
        <BsSunFill onClick={() => setTheme('light')} />
      ) : (
        <BsSun onClick={() => setTheme('dark')} />
      )}
    </Nav.Item>
  )
}

export default ThemeSwitcher
