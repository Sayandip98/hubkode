const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  ADMIN: "admin",
};

const PERMISSION_LEVELS = {
  [PERMISSIONS.READ]: 1,
  [PERMISSIONS.WRITE]: 2,
  [PERMISSIONS.ADMIN]: 3,
};

const hasPermission = (userPermission, requiredPermission) => {
  const userLevel = PERMISSION_LEVELS[userPermission] ?? 0;
  const requiredLevel = PERMISSION_LEVELS[requiredPermission] ?? 0;
  return userLevel >= requiredLevel;
};

export { PERMISSIONS, PERMISSION_LEVELS, hasPermission };
