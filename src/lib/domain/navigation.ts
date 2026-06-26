export function getLoginRedirectPath(pathname: string) {
  return `/auth/login?redirect=${encodeURIComponent(pathname)}`;
}
