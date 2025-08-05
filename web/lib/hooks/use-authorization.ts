import { useAuth } from '@/lib/auth-context';
import { UserRole, ROLE_CONFIG } from '@/lib/types';

export function useAuthorization() {
  const { userRole, hasPermission, profile } = useAuth();

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  // Verificar si el usuario tiene al menos uno de los roles especificados
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  // Verificar si el usuario tiene todos los roles especificados
  const hasAllRoles = (roles: UserRole[]): boolean => {
    return userRole ? roles.every((role) => userRole === role) : false;
  };

  // Obtener información del rol actual
  const getRoleInfo = () => {
    if (!userRole) return null;
    return ROLE_CONFIG[userRole];
  };

  // Verificar si el usuario puede acceder al panel de administración
  const canAccessAdmin = (): boolean => {
    // Verificar tanto el rol del contexto como el del perfil
    const contextRole = userRole;
    const profileRole = profile?.role as UserRole;

    const isAdmin =
      (contextRole && ['admin', 'superadmin'].includes(contextRole)) ||
      (profileRole && ['admin', 'superadmin'].includes(profileRole));

    console.log('🔍 Auth Debug - canAccessAdmin:', {
      contextRole,
      profileRole,
      isAdmin,
      profile: profile ? { id: profile.id, role: profile.role } : null,
    });

    return isAdmin;
  };

  // Verificar si el usuario puede gestionar usuarios
  const canManageUsers = (): boolean => {
    return hasRole('superadmin') || hasPermission('users:create');
  };

  // Verificar si el usuario puede gestionar productos
  const canManageProducts = (): boolean => {
    return hasAnyRole(['admin', 'superadmin']) || hasPermission('products:create');
  };

  // Verificar si el usuario puede gestionar pedidos
  const canManageOrders = (): boolean => {
    return hasAnyRole(['admin', 'superadmin']) || hasPermission('orders:update');
  };

  // Verificar si el usuario puede ver reportes
  const canViewReports = (): boolean => {
    return hasAnyRole(['admin', 'superadmin']) || hasPermission('reports:view');
  };

  // Verificar si el usuario puede configurar el sistema
  const canConfigureSystem = (): boolean => {
    return hasRole('superadmin') || hasPermission('system:configure');
  };

  // Obtener el nivel de acceso del usuario (número para comparaciones)
  const getAccessLevel = (): number => {
    switch (userRole) {
      case 'superadmin':
        return 3;
      case 'admin':
        return 2;
      case 'cliente':
        return 1;
      default:
        return 0;
    }
  };

  // Verificar si el usuario tiene un nivel de acceso mínimo
  const hasMinimumAccess = (level: number): boolean => {
    return getAccessLevel() >= level;
  };

  return {
    userRole,
    profile,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    getRoleInfo,
    canAccessAdmin,
    canManageUsers,
    canManageProducts,
    canManageOrders,
    canViewReports,
    canConfigureSystem,
    getAccessLevel,
    hasMinimumAccess,
  };
}
