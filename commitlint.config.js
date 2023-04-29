// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case', 'upper-case']]
  }
}
