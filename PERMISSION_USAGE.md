# Permission Context Usage Guide

## Setup
PermissionContext already integrated in App.jsx:
```jsx
<PermissionProvider>
  <AppProvider>
    <AppContent />
  </AppProvider>
</PermissionProvider>
```

## Usage Examples

### 1. Basic Permission Check
```jsx
import { usePermissions } from '../PermissionContext';

const MyComponent = () => {
  const { hasPermission } = usePermissions();

  return (
    <div>
      {hasPermission('LEAD_CREATE') && (
        <button>Add Lead</button>
      )}
    </div>
  );
};
```

### 2. Resource-Based Actions
```jsx
const { canRead, canCreate, canUpdate, canDelete } = usePermissions();

// Show add button only if user can create leads
{canCreate('LEAD') && <button>Add Lead</button>}

// Show edit button only if user can update leads
{canUpdate('LEAD') && <button>Edit Lead</button>}

// Show delete button only if user can delete leads
{canDelete('LEAD') && <button>Delete Lead</button>}
```

### 3. Multiple Permissions
```jsx
const { hasAnyPermission, hasAllPermissions } = usePermissions();

// Show if user has ANY of these permissions
{hasAnyPermission(['LEAD_READ', 'LEAD_UPDATE']) && (
  <button>View/Edit Lead</button>
)}

// Show only if user has ALL permissions
{hasAllPermissions(['LEAD_READ', 'LEAD_UPDATE']) && (
  <button>Full Lead Access</button>
)}
```

### 4. Dashboard Cards
```jsx
const { canViewDashboardCard } = usePermissions();

{canViewDashboardCard('TOTAL_LEADS') && <TotalLeadsCard />}
{canViewDashboardCard('LEAD_SOURCE_GROUP') && <LeadSourceCard />}
```

### 5. Set Permissions After Login
In your login component:
```jsx
import { useAppContext } from '../AppContext';

const Login = () => {
  const { setPermissionsAfterLogin } = useAppContext();

  const handleLogin = async (credentials) => {
    const response = await login(credentials);
    if (response?.data?.success) {
      // Set permissions from API response
      setPermissionsAfterLogin(response.data.permissions);
      navigate('/dashboard');
    }
  };
};
```

## Available Functions

- `hasPermission(permissionName)` - Check single permission
- `hasAnyPermission(permissionNames)` - Check if user has any of the permissions
- `hasAllPermissions(permissionNames)` - Check if user has all permissions
- `canRead(resource)` - Check read access (e.g., 'LEAD')
- `canCreate(resource)` - Check create access
- `canUpdate(resource)` - Check update access
- `canDelete(resource)` - Check delete access
- `canCrud(resource)` - Check full CRUD access
- `canViewDashboardCard(cardName)` - Check dashboard card permission
- `canViewDashboard()` - Check general dashboard access

## Permission Naming Convention

- `{RESOURCE}_READ` - View access
- `{RESOURCE}_CREATE` - Create access
- `{RESOURCE}_UPDATE` - Update access
- `{RESOURCE}_DELETE` - Delete access
- `DASHBOARD_CARD_{NAME}` - Dashboard card access

Examples:
- `LEAD_READ`, `LEAD_CREATE`, `LEAD_UPDATE`, `LEAD_DELETE`
- `USER_READ`, `USER_CREATE`, `USER_UPDATE`, `USER_DELETE`
- `DASHBOARD_CARD_TOTAL_LEADS`

## Important Notes

- Permissions are NOT saved in localStorage (only in memory)
- Permissions are cleared on logout/page refresh
- Login component must call `setPermissionsAfterLogin()` after successful login
- Use permission checks before rendering UI elements