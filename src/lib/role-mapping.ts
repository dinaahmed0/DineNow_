// export const ROLE_ID_TO_NAME: Record<string, string> = {
//   // From your backend JWT RoleId claim
//   '45560f97-1db2-454f-b581-84de9ce92d49': 'superadmin',
//   'afbbfed4-b1c0-4046-8a75-9fee76a76eaa': 'user',
// };

// Remove the GUID mapping - backend sends role names directly
// export const ROLE_ID_TO_NAME: Record<string, string> = {
//   // Your backend sends actual role names like:
//   'superadmin': 'superadmin',
//   'Manager': 'Manager',
//   'Staff': 'Staff',
//   'user': 'user',
//   'User': 'User',
// };

// Or if you want to normalize roles:
// export const ROLE_ID_TO_NAME: Record<string, string> = {
//   'superadmin': 'superadmin',
//   'Manager': 'manager',  // normalize to lowercase if needed
//   'Staff': 'staff',
//   'user': 'user',
//   'User': 'user',
// };

// export const ROLE_ID_TO_NAME: Record<string, string> = {
//   'SuperAdmin': 'SuperAdmin',   // ← ADD THIS (PascalCase from .NET Identity)
//   'superadmin': 'SuperAdmin',   // normalize lowercase variant too
//   'Manager': 'Manager',
//   'Staff': 'Staff',
//   'User': 'User',
//   'user': 'User',
// };

export const ROLE_ID_TO_NAME: Record<string, string> = {
  '45560f97-1db2-454f-b581-84de9ce92d49': 'SuperAdmin',
  '8d247fac-8c0b-437d-8c4b-02ff18556df2': 'Manager',
  '13b22137-1854-44f3-9f6c-5cc78a9a667f': 'Staff',
  'afbbfed4-b1c0-4046-8a75-9fee76a76eaa': 'User',

  SuperAdmin: 'SuperAdmin',
  Manager: 'Manager',
  Staff: 'Staff',
  User: 'User',
};

