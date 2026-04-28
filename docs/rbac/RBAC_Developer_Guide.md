# SW360 Frontend RBAC Developer Guide

## Quick Start

This guide helps developers implement role-based access control in SW360 Frontend.

---

## Available Roles

```typescript
import { UserGroupType } from '@/object-types'

// All available roles
UserGroupType.USER           // Default user - can create/edit own records
UserGroupType.VIEWER         // Read-only user (no write access)
UserGroupType.CLEARING_EXPERT// Can handle clearing, edit licenses
UserGroupType.CLEARING_ADMIN // Full clearing permissions for own dept
UserGroupType.ECC_ADMIN      // Can edit ECC classifications
UserGroupType.SECURITY_ADMIN // Can view/suppress vulnerabilities
UserGroupType.SECURITY_USER  // Can view vulnerabilities (read-only)
UserGroupType.SW360_ADMIN    // Full admin access
UserGroupType.ADMIN          // Legacy, same as SW360_ADMIN
```

---

## Three Levels of Access Control

### Level 1: Route Blocking (Recommended for entire pages)

Block access at the middleware level. User cannot even load the page.

**When to use:** Entire sections that a role should never see (e.g., VIEWER cannot access /admin)

```typescript
// src/config/permissions/permissions.config.ts
export const routePermissions = {
    // Block VIEWER from all add/edit pages
    '/projects/add': { blockedRoles: [UserGroupType.VIEWER] },
    '/components/edit': { blockedRoles: [UserGroupType.VIEWER] },
    
    // Allow only admins
    '/admin': { allowedRoles: [UserGroupType.ADMIN, UserGroupType.SW360_ADMIN] },
}
```

### Level 2: Page-Level HOC (For dynamic "Access Denied" pages)

Wrap your page component with `AccessControl` HOC.

**When to use:** When you want to show an "Access Denied" message instead of blocking entirely.

```typescript
import { AccessControl } from '@/components/AccessControl'
import { UserGroupType } from '@/object-types'

function MyPage() {
    return <div>Page Content</div>
}

// Block VIEWER and SECURITY_USER from this page
export default AccessControl(MyPage, [
    UserGroupType.VIEWER,
    UserGroupType.SECURITY_USER,
])
```

### Level 3: Element-Level Gates (For hiding buttons, tabs, etc.)

Use gate components to conditionally render UI elements.

**When to use:** Hiding specific buttons, tabs, or sections while keeping the page accessible.

```tsx
import { ViewerGate, AdminGate, RoleGate, CapabilityGate, ClearingGate, EccAdminGate, SecurityAdminGate } from '@/components/AccessControl'

// Example 1: Hide from VIEWER role
<ViewerGate>
    <Button onClick={handleEdit}>Edit</Button>
</ViewerGate>

// Example 2: Show only to admins
<AdminGate>
    <Button variant="danger" onClick={handleDelete}>Delete All</Button>
</AdminGate>

// Example 3: Show only to clearing roles (or admin)
<ClearingGate>
    <Button onClick={handleClearingAction}>Approve Clearing</Button>
</ClearingGate>

// Example 4: Show only to ECC admins
<EccAdminGate>
    <ECCEditForm />
</EccAdminGate>

// Example 5: Show only to security admins
<SecurityAdminGate>
    <Button onClick={handleSuppress}>Suppress Vulnerability</Button>
</SecurityAdminGate>

// Example 6: Custom role logic with allowedRoles
<RoleGate allowedRoles={[UserGroupType.CLEARING_ADMIN, UserGroupType.CLEARING_EXPERT]}>
    <Button onClick={handleClearingAction}>Approve Clearing</Button>
</RoleGate>

// Example 7: Admin + Clearing Admin only (NOT Clearing Expert)
<RoleGate allowedRoles={[UserGroupType.ADMIN, UserGroupType.SW360_ADMIN, UserGroupType.CLEARING_ADMIN]}>
    <Button onClick={handleAdminAction}>Admin/Clearing Admin Only</Button>
</RoleGate>

// Example 8: Block specific roles
<RoleGate blockedRoles={[UserGroupType.VIEWER, UserGroupType.SECURITY_USER]}>
    <ExportButton />
</RoleGate>

// Example 9: Capability-based (recommended for complex permissions)
<CapabilityGate capability="canEditECCClassifications">
    <ECCEditForm />
</CapabilityGate>
```

---

## Two Permission Systems

### PermissionContext (React Layer)

For quick role checks and UI gating in React components.

```tsx
import { usePermissionContext } from '@/contexts'

function MyComponent() {
    const { 
        // Role state
        isLoading,
        isAuthenticated,
        userRole,
        
        // Quick checks
        isViewer,
        isAdmin,
        isClearingAdmin,
        isClearingExpert,
        isEccAdmin,
        isSecurityAdmin,
        isSecurityUser,
        
        // Generic checks
        isAnyRole,
        isBlocked,
        
        // Capability checks
        hasCapability,
        capabilities,
    } = usePermissionContext()

    // Example: Conditional logic
    if (isLoading) return <Spinner />
    
    if (!isAuthenticated) return <LoginPrompt />
    
    if (isViewer) {
        // Show read-only view
    }
    
    if (hasCapability('canSuppressVulnerabilities')) {
        // Show suppress button
    }
    
    if (isAnyRole([UserGroupType.CLEARING_ADMIN, UserGroupType.CLEARING_EXPERT])) {
        // Show clearing actions
    }
    
    // Admin + Clearing Admin only (NOT Clearing Expert)
    if (isAdmin || isClearingAdmin) {
        // Show admin-level clearing actions
    }
}
```

### PermissionUtils (Utility Layer)

For record-level permission checks that require document context. Mirrors backend `PermissionUtils.java`.

```tsx
import { PermissionUtils, RequestedAction } from '@/utils'
import type { ProjectUserRolesEmbedded, SessionUser } from '@/utils/permission.utils'

function ProjectActions({ projectData, session }) {
    // Check if user can write to this specific project
    const canWrite = useMemo(
        () => PermissionUtils.getStandardPermissions(
            RequestedAction.WRITE,
            projectData?._embedded,
            session?.user
        ),
        [projectData, session]
    )
    
    // Check if user is a moderator of this project
    const isModerator = PermissionUtils.isModerator(
        projectData?._embedded,
        session?.user?.email
    )
    
    // Check if user is a contributor
    const isContributor = PermissionUtils.isContributor(
        projectData?._embedded,
        session?.user?.email
    )
    
    return canWrite ? <Button>Edit</Button> : null
}
```

#### Available PermissionUtils Methods

| Method | Purpose |
|--------|---------|
| `isAdmin(user)` | Check if user is ADMIN or SW360_ADMIN |
| `isClearingAdmin(user)` | Check if CLEARING_ADMIN or CLEARING_EXPERT |
| `isClearingExpert(user)` | Check if CLEARING_EXPERT |
| `isEccAdmin(user)` | Check if ECC_ADMIN |
| `isSecurityAdmin(user)` | Check if SECURITY_ADMIN |
| `isSecurityUser(user)` | Check if SECURITY_USER |
| `isViewer(user)` | Check if VIEWER (read-only) |
| `isNormalUser(user)` | Check if USER |
| `canWrite(user)` | Quick check if not VIEWER |
| `isModerator(embedded, email)` | Check if user is document moderator |
| `isContributor(embedded, email)` | Check if user is document contributor |
| `getStandardPermissions(action, embedded, user)` | Full permission check matching backend |
| `userIsEquivalentToProjectModerator(embedded, email)` | Check project moderator equivalence |

---

## Common Patterns

### Pattern 1: VIEWER-Safe Component

**Use case:** On the Components table, the Edit and Delete icons should be hidden from VIEWER users since they have read-only access.

**Real code from:** [ComponentsTable.tsx](../../src/app/[locale]/components/components/ComponentsTable.tsx#L152-L176)

```tsx
import { ViewerGate } from '@/components/AccessControl'

// Inside table cell renderer
{id && (
    <span className='d-flex justify-content-evenly'>
        <ViewerGate>
            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                <span
                    className='d-inline-block'
                    onClick={() => handleEditComponent(id)}
                >
                    <BsPencil className='btn-icon' size={20} />
                </span>
            </OverlayTrigger>
        </ViewerGate>

        <ViewerGate>
            <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                <span className='d-inline-block'>
                    <BsFillTrashFill
                        className='btn-icon'
                        size={20}
                        onClick={() => handleClickDelete(id)}
                    />
                </span>
            </OverlayTrigger>
        </ViewerGate>
    </span>
)}
```

### Pattern 2: Block Multiple Roles (Page-Level HOC)

**Use case:** The Requests page should be blocked for both VIEWER (read-only) and SECURITY_USER (can only view vulnerabilities). Use the AccessControl HOC to show an "Access Denied" message.

**Real code from:** [Requests.tsx](../../src/app/[locale]/requests/components/Requests.tsx#L306-L309)

```tsx
import { AccessControl } from '@/components/AccessControl'
import { UserGroupType } from '@/object-types'

function Requests() {
    // ... component implementation
}

// Block VIEWER and SECURITY_USER from this page
export default AccessControl(Requests, [
    UserGroupType.SECURITY_USER,
    UserGroupType.VIEWER,
])
```

### Pattern 3: Admin-Only Section (Navigation)

**Use case:** The "Admin" menu item in the sidebar should only be visible to SW360_ADMIN users. Configure this in NavList.ts.

**Real code from:** [NavList.ts](../../src/object-types/NavList.ts#L94-L97)

```typescript
// src/object-types/NavList.ts
{
    href: '/admin',
    name: t('Admin'),
    id: 'admin',
    visibility: [
        UserGroupType.ADMIN,
        UserGroupType.SW360_ADMIN,
    ],
    childs: [
        { href: '/admin/users', name: t('User'), id: 'admin_user' },
        { href: '/admin/vendors', name: t('Vendors'), id: 'admin_vendors' },
        // ... more admin submenus
    ],
},
```

### Pattern 4: Record-Level Permissions with PermissionUtils

**Use case:** On a Project detail page, the "Change rating" button for vulnerabilities should only appear if the user has WRITE permission on this specific project (is creator, moderator, contributor, or admin in same BU).

**Real code from:** [ProjectDetailTab.tsx](../../src/app/[locale]/projects/detail/[id]/components/ProjectDetailTab.tsx#L67-L73)

```tsx
import { PermissionUtils, RequestedAction } from '@/utils'
import { useSession } from 'next-auth/react'

function ProjectDetailTab({ summaryData }: Props) {
    const session = useSession()

    // Check if user can change vulnerability ratings for this project
    const canChangeVulnerability = useMemo(
        () => PermissionUtils.getStandardPermissions(
            RequestedAction.WRITE,
            summaryData?._embedded,
            session.data?.user
        ),
        [summaryData, session.data?.user],
    )

    return (
        <ProjectVulnerabilities
            projectId={summaryData.id}
            canChangeVulnerability={canChangeVulnerability}
        />
    )
}
```

### Pattern 5: Navigation Visibility (Hide Menu Items)

**Use case:** The "ECC" and "Vulnerabilities" menu items should not appear for VIEWER users since they cannot access these sections.

**Real code from:** [NavList.ts](../../src/object-types/NavList.ts#L47-L70)

```typescript
// src/object-types/NavList.ts
{
    href: '/ecc',
    name: t('ECC'),
    id: 'ecc',
    visibility: [
        UserGroupType.USER,
        UserGroupType.ADMIN,
        UserGroupType.SW360_ADMIN,
        UserGroupType.CLEARING_ADMIN,
        UserGroupType.ECC_ADMIN,
        UserGroupType.SECURITY_ADMIN,
        UserGroupType.CLEARING_EXPERT,
    ],
    // Note: VIEWER is excluded - menu item won't appear for them
},
{
    href: '/vulnerabilities',
    name: t('Vulnerabilities'),
    id: 'vulnerabilities',
    visibility: [
        UserGroupType.USER,
        UserGroupType.ADMIN,
        UserGroupType.SW360_ADMIN,
        UserGroupType.CLEARING_ADMIN,
        UserGroupType.ECC_ADMIN,
        UserGroupType.SECURITY_ADMIN,
        UserGroupType.CLEARING_EXPERT,
    ],
},
```

### Pattern 6: Projects Page Edit Button

**Use case:** On the Projects list, the Edit pencil icon should be hidden from VIEWER users.

**Real code from:** [Projects.tsx](../../src/app/[locale]/projects/components/Projects.tsx#L250-L266)

```tsx
import { ViewerGate } from '@/components/AccessControl'

// Inside table cell renderer for Actions column
<span className='d-flex align-items-center justify-content-center'>
    <ViewerGate>
        <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
            <span
                className='d-inline-flex align-items-center justify-content-center'
                style={{ width: 28, height: 28 }}
                onClick={() => handleEditProject(id)}
            >
                <BsPencil className='btn-icon' size={20} />
            </span>
        </OverlayTrigger>
    </ViewerGate>
    <span className='border-start align-self-stretch mx-1 my-1' />
    {/* Other action buttons */}
</span>
```

### Pattern 7: Capability-Based Button Disabling

**Use case:** Disable the "Add Vulnerability" button for SECURITY_USER role. SECURITY_USER can view vulnerabilities but cannot create them.

**Real code from:** [Vulnerabilities.tsx](../../src/app/[locale]/vulnerabilities/components/Vulnerabilities.tsx#L43-L387)

```tsx
import { usePermissionContext } from '@/contexts'

function Vulnerabilities(): ReactNode {
    const { data: session, status } = useSession()
    const { hasCapability } = usePermissionContext()
    const canCreateVulnerabilities = hasCapability('canCreateVulnerabilities')
    
    return (
        <div className='row'>
            <button
                className='btn btn-primary col-auto'
                onClick={handleAddVulnerability}
                disabled={!canCreateVulnerabilities}
            >
                {t('Add Vulnerability')}
            </button>
        </div>
    )
}
```

### Pattern 8: Conditional Form Fields with Capability Check

**Use case:** On the Clearing Request edit form, the "Requesting User" and "Clearing Type" fields should only be editable by users with `canEditClearingRequestDetails` capability (all roles except USER). Regular USER role sees the fields but they are disabled.

**Real code from:** [EditClearingRequestInfo.tsx](../../src/app/[locale]/requests/clearingRequest/edit/[id]/components/EditClearingRequestInfo.tsx#L37-L90)

```tsx
import { usePermissionContext } from '@/contexts'

export default function EditClearingRequestInfo({
    clearingRequestData,
    updateClearingRequestPayload,
    setUpdateClearingRequestPayload,
}: Props): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()
    const { hasCapability } = usePermissionContext()
    const canEditClearingRequestDetails = hasCapability('canEditClearingRequestDetails')
    
    return (
        <table className='table summary-table'>
            <tbody>
                <tr>
                    <td>{t('Requesting User')}:</td>
                    <td>
                        <input
                            type='text'
                            className='form-control'
                            readOnly={true}
                            name='requestingUser'
                            value={updateClearingRequestPayload.requestingUser}
                            disabled={!canEditClearingRequestDetails}
                        />
                    </td>
                </tr>
                <tr>
                    <td>{t('Clearing Type')}:</td>
                    <td>
                        <select
                            className='form-select'
                            name='clearingType'
                            value={updateClearingRequestPayload.clearingType}
                            onChange={updateInputField}
                            disabled={!canEditClearingRequestDetails}
                            required
                        >
                            <option value='DEEP'>{t('Deep Level CLX')}</option>
                            <option value='HIGH'>{t('High Level ISR')}</option>
                        </select>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}
```

---

## Checklist for New Features

When adding a new feature, ask yourself:

- [ ] **Does this feature modify data?** → Block VIEWER role
- [ ] **Should this be accessible to all authenticated users?** → No restrictions needed
- [ ] **Is this admin-only?** → Use AdminGate or route restriction
- [ ] **Does this need a specific capability?** → Use CapabilityGate
- [ ] **Does permission depend on record ownership?** → Use PermissionUtils
- [ ] **Should button/tab be hidden or page blocked?** → Choose appropriate level

### Quick Decision Tree

```
Feature adds/edits/deletes data?
├── Yes → Hide/block for VIEWER
│   ├── Entire page? → Route blocking or AccessControl HOC
│   └── Just a button? → ViewerGate
└── No → Visible to all

Feature is admin config/management?
├── Yes → AdminGate or route restriction
└── No → Continue

Feature requires record-level permission (project owner, moderator)?
├── Yes → PermissionUtils.getStandardPermissions()
└── No → Continue

Feature requires specific role capability?
├── Yes → CapabilityGate with appropriate capability
└── No → No restrictions
```

---

## Available Capabilities

All capabilities are defined in `src/config/permissions/capabilities.config.ts`:

| Capability | Description | Roles with Capability |
|------------|-------------|----------------------|
| `canCreateRecords` | Create components, releases, projects | All except VIEWER |
| `canEditOwnRecords` | Edit own creations | All except VIEWER |
| `canEditOthersRecords` | Edit without moderation | CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canApproveModerationRequests` | Approve MRs for dept | CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canEditLicenses` | Edit license details | CLEARING_EXPERT, CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canImportDeleteLicenses` | Import/delete SPDX/OSADL | CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canEditObligations` | Edit obligations | CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canHandleClearingRequests` | Work on clearing requests | CLEARING_EXPERT, CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canDeleteClearingRequests` | Delete clearing requests | CLEARING_ADMIN, SW360_ADMIN, ADMIN |
| `canEditClearingRequestDetails` | Edit clearing request details (requesting user, clearing type, priority) | All except USER, VIEWER |
| `canEditECCClassifications` | Edit ECC status | ECC_ADMIN, SW360_ADMIN, ADMIN |
| `canViewVulnerabilities` | View vulnerability data | SECURITY_ADMIN, SECURITY_USER, SW360_ADMIN, ADMIN |
| `canSuppressVulnerabilities` | Suppress findings | SECURITY_ADMIN, SW360_ADMIN, ADMIN |
| `canCreateVulnerabilities` | Add new vulnerabilities | All except VIEWER, SECURITY_USER |
| `canManageUsers` | Manage users/roles | SW360_ADMIN, ADMIN |
| `canAccessAdminConfig` | Admin configurations | SW360_ADMIN, ADMIN |

---

## Testing RBAC

### Local Testing

1. Create test users with different roles in CouchDB
2. Login as each role and verify:
   - Route access/blocking
   - Element visibility
   - Button/action availability

---

## Troubleshooting

### Gate not hiding content
1. Ensure `PermissionProvider` wraps your app (check `provider.tsx`)
2. Verify session has `userGroup` field
3. Check for loading state: `isLoading` should be false

### Route not blocking
1. Check `routePermissions` config in `permissions.config.ts`
2. Verify route pattern matches (longest prefix wins)
3. Check `proxy.ts` for middleware integration

### AccessControl HOC shows loading forever
1. Ensure next-auth session is configured
2. Check `useSession` returns proper status
3. Verify authentication provider is working

### PermissionUtils returns unexpected result
1. Verify `_embedded` block has required fields (createdBy, moderators, etc.)
2. Check user object has `email`, `userGroup`, `department`
3. For BU-matching, verify `businessUnit` is set on project

---

## API Reference

### ViewerGate
```tsx
<ViewerGate fallback={<span>Not available</span>}>
    {children}
</ViewerGate>
```

### AdminGate
```tsx
<AdminGate fallback={null}>
    {children}
</AdminGate>
```

### ClearingGate
```tsx
<ClearingGate fallback={null}>
    {children}
</ClearingGate>
```

### EccAdminGate
```tsx
<EccAdminGate fallback={null}>
    {children}
</EccAdminGate>
```

### SecurityAdminGate
```tsx
<SecurityAdminGate fallback={null}>
    {children}
</SecurityAdminGate>
```

### RoleGate
```tsx
<RoleGate 
    allowedRoles={[UserGroupType.ADMIN]}
    blockedRoles={[UserGroupType.VIEWER]}
    fallback={<DisabledButton />}
>
    {children}
</RoleGate>
```

### CapabilityGate
```tsx
<CapabilityGate 
    capability="canEditLicenses"
    fallback={null}
>
    {children}
</CapabilityGate>
```

### usePermissionContext
```tsx
const {
    // State
    isLoading: boolean,
    isAuthenticated: boolean,
    userRole: UserGroupType | null,
    
    // Quick role checks
    isViewer: boolean,
    isAdmin: boolean,
    isClearingAdmin: boolean,
    isClearingExpert: boolean,
    isEccAdmin: boolean,
    isSecurityAdmin: boolean,
    isSecurityUser: boolean,
    
    // Generic checks
    isAnyRole: (roles: UserGroupType[]) => boolean,
    isBlocked: (blockedRoles: UserGroupType[]) => boolean,
    
    // Capability checks
    hasCapability: (cap: keyof RoleCapabilities) => boolean,
    capabilities: RoleCapabilities,
} = usePermissionContext()
```

### PermissionUtils
```typescript
import { PermissionUtils, RequestedAction } from '@/utils'
import type { ProjectUserRolesEmbedded, SessionUser } from '@/utils/permission.utils'

// Role checks
PermissionUtils.isAdmin(user)
PermissionUtils.isViewer(user)
PermissionUtils.canWrite(user)

// Document checks
PermissionUtils.isModerator(embedded, email)
PermissionUtils.isContributor(embedded, email)

// Full permission check
PermissionUtils.getStandardPermissions(
    RequestedAction.WRITE,  // READ, WRITE, DELETE, CLEARING, etc.
    embedded,               // Project _embedded block
    user                    // Session user
)
```

---

## Examples from Codebase

| File | Pattern Used |
|------|--------------|
| [Projects.tsx](../../src/app/[locale]/projects/components/Projects.tsx) | ViewerGate for Edit/Export buttons |
| [ComponentsTable.tsx](../../src/app/[locale]/components/components/ComponentsTable.tsx) | ViewerGate for Export buttons |
| [Requests.tsx](../../src/app/[locale]/requests/components/Requests.tsx) | AccessControl HOC to block VIEWER |
| [NavList.ts](../../src/object-types/NavList.ts) | Visibility arrays for nav items |
| [proxy.ts](../../src/proxy.ts) | Route-level blocking in middleware |
| [ProjectDetailTab.tsx](../../src/app/[locale]/projects/detail/[id]/components/ProjectDetailTab.tsx) | PermissionUtils for vulnerability permissions |
| [VulnerabilityTab.tsx](../../src/app/[locale]/projects/detail/[id]/components/VulnerabilityTab.tsx) | canChangeVulnerability prop |
