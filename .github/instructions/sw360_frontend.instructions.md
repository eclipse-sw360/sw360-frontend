---
applyTo: "**/*"
---

# SW360 Frontend Copilot Instructions

> **Optimized for GitHub Copilot ASK, EDIT, and Agent modes**

---

## Code Style

### Mandatory Rules

1. **TypeScript Strict Mode** - All code must be TypeScript with strict type checking enabled
2. **Functional Components** - Always use functional components with hooks, never class components
3. **Async/Await** - Use `async/await` for all asynchronous operations, avoid `.then()` chains
4. **No Inline CSS** - Never use inline styles; add custom styles to `src/styles/globals.css`
5. **Biome Tooling** - Always run Biome before committing using local `biome.json` config

### TypeScript Guidelines

#### Type Everything
```typescript
// ✅ Correct: Typed function parameters and return values
const fetchUsers = async (page: number): Promise<User[]> => {
    const response = await ApiUtils.GET(`users?page=${page}`, token)
    return response.json()
}

// ✅ Correct: Typed state
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)

// ❌ Wrong: Untyped or using any
const [data, setData] = useState<any>([])
const fetchData = async (params) => { ... }
```

#### Use Interfaces for Props
```typescript
// ✅ Correct: Interface for component props
interface UserListProps {
    users: User[]
    onSelect: (user: User) => void
    isLoading?: boolean
    className?: string
}

export default function UserList({ users, onSelect, isLoading = false }: UserListProps): JSX.Element {
    // ...
}
```

#### Avoid `any` Type
```typescript
// ❌ Wrong
const handleData = (data: any) => { ... }
const response: any = await fetch(url)

// ✅ Correct: Use proper types or unknown
const handleData = (data: unknown) => {
    if (isUser(data)) { ... }
}
const response: Response = await fetch(url)
```

### Functional Components Only

```typescript
// ✅ Correct: Functional component with hooks
export default function UserCard({ user }: { user: User }): JSX.Element {
    const [expanded, setExpanded] = useState(false)
    
    return (
        <div className="card">
            {/* content */}
        </div>
    )
}

// ❌ Wrong: Class component - NEVER USE
class UserCard extends React.Component<Props, State> {
    render() {
        return <div>{/* content */}</div>
    }
}
```

### Async/Await Pattern

```typescript
// ✅ Correct: async/await with proper error handling
const handleSubmit = async () => {
    setLoading(true)
    try {
        const session = await getSession()
        if (!session) return signOut()
        
        const response = await ApiUtils.POST('users', userData, session.user.access_token)
        if (response.status === StatusCodes.CREATED) {
            MessageService.success(t('User created successfully'))
            onSuccess?.()
        }
    } catch (error) {
        ApiUtils.reportError(error)
    } finally {
        setLoading(false)
    }
}

// ❌ Wrong: .then() chains
const handleSubmit = () => {
    setLoading(true)
    getSession()
        .then(session => ApiUtils.POST('users', userData, session.user.access_token))
        .then(response => { ... })
        .catch(error => { ... })
        .finally(() => setLoading(false))
}
```

### CSS Guidelines - No Inline Styles

```typescript
// ❌ Wrong: Inline styles - NEVER USE
<div style={{ marginLeft: '10px', padding: '20px' }}>Content</div>
<button style={{ backgroundColor: 'blue', color: 'white' }}>Click</button>

// ✅ Correct: Bootstrap utility classes
<div className="ms-2 p-3">Content</div>
<Button variant="primary">Click</Button>

// ✅ Correct: Custom class in globals.css
<div className="custom-card-container">Content</div>
```

When you need custom styles, add them to `src/styles/globals.css`:
```css
/* src/styles/globals.css */
.custom-card-container {
    margin-left: 10px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Biome Linting & Formatting

Always run Biome before committing:

```bash
# Check code for issues
npx biome check src/

# Auto-fix formatting issues
npx biome format --write src/

# Check and fix specific file
npx biome check --write src/components/MyComponent.tsx

# Fix with unsafe changes (use carefully)
npx biome check --write --unsafe src/
```

#### Biome Rules (from biome.json)
| Rule | Value |
|------|-------|
| Indentation | 4 spaces |
| Line width | 120 characters |
| Quotes | Single quotes |
| Trailing commas | All |
| Line endings | LF |
| Semicolons | As needed |

#### Key Linter Rules
- `noUnusedImports` - Remove unused imports
- `noUnusedVariables` - Remove unused variables  
- `useAwait` - Async functions must use await
- `noExplicitAny` - Warn on `any` type usage

### Import Organization

```typescript
// 1. React imports
import { type JSX, useState, useEffect, useCallback, useMemo } from 'react'

// 2. Next.js imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 3. External library imports
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button, Form, Modal } from 'react-bootstrap'
import { StatusCodes } from 'http-status-codes'

// 4. Internal imports (using path aliases)
import { User, Project } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { SW360Table, TableFooter } from 'next-sw360'
import MessageService from '@/services/message.service'
```

### Error Handling Pattern

```typescript
// ✅ Correct: Centralized error handling
try {
    const response = await ApiUtils.GET('endpoint', token)
    if (response.status !== StatusCodes.OK) {
        throw new ApiError('Request failed', { status: response.status })
    }
    // Process successful response
} catch (error) {
    ApiUtils.reportError(error)  // Shows toast notification
}

// For form submissions with user feedback
try {
    await submitData()
    MessageService.success(t('Operation successful'))
} catch (error) {
    MessageService.error(t('Operation failed'))
    console.error('Submit error:', error)
}
```

---

## Project Structure

```
sw360-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Locale-prefixed routes
│   │   ├── api/                # API routes (auth, session)
│   │   └── provider.tsx        # Session provider
│   ├── components/             # Reusable components
│   │   └── sw360/              # Core SW360 components (aliased as 'next-sw360')
│   ├── contexts/               # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── i18n/                   # Internationalization config
│   ├── object-types/           # TypeScript interfaces and types
│   │   └── enums/              # Enumeration types
│   ├── services/               # Service layer (auth, download, message)
│   ├── styles/                 # Global CSS styles (globals.css)
│   └── utils/                  # Utility functions
│       └── api/                # API utilities (ApiUtils)
├── messages/                   # Translation files (10 locales)
├── cypress/                    # E2E tests
├── biome.json                  # Biome linter config
└── tsconfig.json               # TypeScript configuration
```

### Import Path Aliases

```typescript
import { User, Project } from '@/object-types'           // src/object-types
import { ApiUtils, CommonUtils } from '@/utils'          // src/utils
import { SW360Table, TableFooter } from 'next-sw360'     // src/components/sw360
import MessageService from '@/services/message.service'   // src/services
import { useUiConfig } from '@/hooks'                    // src/hooks
```

---

## Component Development

### License Header (Required)

All files must include the EPL-2.0 license header:
```typescript
// Copyright (C) [Organization], [Year]. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
```

### When to Use 'use client'

Add `'use client'` directive for components with:
- React hooks (useState, useEffect, useCallback, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs
- next-auth session access

---

## API Communication

### ApiUtils Pattern

```typescript
import { ApiUtils, ApiError } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { StatusCodes } from 'http-status-codes'

// Always use async/await
const fetchData = async () => {
    const session = await getSession()
    if (!session) return signOut()

    try {
        const response = await ApiUtils.GET('users', session.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = await response.json()
            return data
        }
    } catch (error) {
        ApiUtils.reportError(error)
    }
}

// POST with data
const createUser = async (userData: UserPayload) => {
    const session = await getSession()
    if (!session) return signOut()
    
    const response = await ApiUtils.POST('users', userData, session.user.access_token)
    // Handle response
}
```

### Data Fetching in useEffect

```typescript
useEffect(() => {
    const controller = new AbortController()
    
    const fetchData = async () => {
        const session = await getSession()
        if (!session) return signOut()
        
        try {
            const response = await ApiUtils.GET(url, session.user.access_token, controller.signal)
            // Process response
        } catch (error) {
            ApiUtils.reportError(error)
        }
    }
    
    fetchData()
    return () => controller.abort()
}, [dependencies])
```

### File Upload Pattern

```typescript
const handleUpload = async (file: File) => {
    const session = await getSession()
    if (!session) return signOut()

    const formData = new FormData()
    formData.append('fieldName', file)

    const response = await fetch(
        `${SW360_API_URL}/resource/api/endpoint`,
        {
            method: 'POST',
            headers: { Authorization: session.user.access_token },
            body: formData,
        }
    )
}
```

---

## Internationalization (i18n)

### Supported Locales
`en`, `de`, `es`, `fr`, `ja`, `ko`, `pt-BR`, `vi`, `zh-CN`, `zh-TW`

### Using Translations

```typescript
import { useTranslations } from 'next-intl'

function MyComponent() {
    const t = useTranslations('default')
    
    return (
        <div>
            <h1>{t('Users')}</h1>
            <p>{t.rich('showing page entries', {
                entryStart: 1,
                entryEnd: 10,
                totalElements: 100,
            })}</p>
        </div>
    )
}
```

### Adding New Translations

**IMPORTANT**: Add keys to ALL 10 locale files in `messages/`

```json
// messages/en.json
{
    "Bulk User Upload": "Bulk User Upload",
    "Upload successful entries created": "Upload successful: {count} entries created"
}
```

---

## State Management

### Component State

```typescript
const [loading, setLoading] = useState(false)
const [data, setData] = useState<User[]>([])
```

### Refresh Trigger Pattern

```typescript
const [refreshTrigger, setRefreshTrigger] = useState(0)

const handleSuccess = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
}, [])

useEffect(() => {
    // Fetch data
}, [refreshTrigger])
```

### Toast Messages

```typescript
import MessageService from '@/services/message.service'

MessageService.success('Operation completed')
MessageService.error('Operation failed')
MessageService.info('Information message')
MessageService.warn('Warning message')
```

---

## Tables with @tanstack/react-table

```typescript
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { SW360Table, TableFooter, PageSizeSelector } from 'next-sw360'

const columns = useMemo<ColumnDef<User>[]>(() => [
    {
        id: 'email',
        accessorKey: 'email',
        header: t('Email'),
        enableSorting: true,
        cell: ({ row }) => (
            <Link href={`/admin/users/${row.original.id}`}>
                {row.original.email}
            </Link>
        ),
        meta: { width: '25%' },
    },
], [t])

const table = useReactTable({
    data: userData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: paginationMeta?.totalPages ?? 1,
})

return (
    <>
        <SW360Table table={table} />
        <TableFooter
            pageableQueryParam={pageableQueryParam}
            setPageableQueryParam={setPageableQueryParam}
            paginationMeta={paginationMeta}
        />
    </>
)
```

---

## Authentication

### Session Access

```typescript
import { getSession, useSession, signOut } from 'next-auth/react'

// Hook usage
const { data: session, status } = useSession()

useEffect(() => {
    if (status === 'unauthenticated') {
        void signOut()
    }
}, [status])

// For API calls
const session = await getSession()
if (!session) return signOut()
const response = await ApiUtils.GET('endpoint', session.user.access_token)
```

### Auth Providers
Configured via `NEXT_PUBLIC_SW360_AUTH_PROVIDER`: `sw360basic` | `sw360oauth` | `keycloak`

---

## Utility Functions

### CommonUtils

```typescript
import { CommonUtils } from '@/utils'

CommonUtils.isNullOrUndefined(obj)
CommonUtils.isNullEmptyOrUndefinedString(str)
CommonUtils.isNullEmptyOrUndefinedArray(arr)
CommonUtils.createUrlWithParams(url, params)
CommonUtils.getIdFromUrl(url)  // '/users/abc123' -> 'abc123'
```

---

## Testing

```bash
pnpm cypress:open    # Open Cypress UI
pnpm cypress:run     # Run headless
```

---

## Development Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start dev server
pnpm build           # Production build
pnpm lint            # Run Biome linter
```

---

## Configuration

### Key Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SW360_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SW360_AUTH_PROVIDER` | Auth provider: `sw360basic`, `sw360oauth`, `keycloak` |
| `NEXTAUTH_URL` | Frontend URL |
| `NEXTAUTH_SECRET` | Session encryption secret |

See `.env` and `docs/templates/template.env` for full list.

---

## Git Workflow

For commit message format, branch naming conventions, and PR guidelines, see:
**[git-commit.instructions.md](./git-commit.instructions.md)**

---

## AI Copilot Checklist

When generating code for SW360 Frontend:

- [ ] Include license header
- [ ] Use `'use client'` for interactive components
- [ ] Use TypeScript strict types for all props and state
- [ ] Use functional components only
- [ ] Use `async/await` for all async operations
- [ ] Use path aliases (`@/`) for imports
- [ ] Use `next-sw360` barrel exports for SW360 components
- [ ] Translate all user-facing text with `useTranslations`
- [ ] Handle errors with `ApiUtils.reportError()`
- [ ] No inline CSS - use Bootstrap utilities or globals.css
- [ ] Add translations to ALL 10 locale files
- [ ] Run `npx biome check` before committing

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `src/app/[locale]/admin/users/page.tsx` |
| Component | `PascalCase.tsx` | `UserAdministration.tsx` |
| Hook | `useCamelCase.ts` | `useLocalStorage.ts` |
| Type | `PascalCase.ts` | `User.ts` |
| Utility | `camelCase.utils.ts` | `common.utils.ts` |

---

*For versions, see `package.json`. For latest standards, see source code and `biome.json`.*
