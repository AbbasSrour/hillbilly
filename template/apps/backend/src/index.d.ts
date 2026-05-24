/* @hillbilly-sync */
// TODO: Remove this once better-auth/* resolves without shim.
//       This is for rbac package, causing the the type of instance.api
//       to by any.
declare module 'better-auth/*' {
  export * from 'better-auth';
}
