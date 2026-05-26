const envBase = import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || "/";
const rawBase = envBase.endsWith("/") ? envBase : `${envBase}/`;
const trimmedBase = rawBase === "/" ? "" : rawBase.slice(0, -1);

export function routePath(path: string = "/") {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;

  if (!trimmedBase) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${trimmedBase}/`;
  }

  return `${trimmedBase}${normalizedPath}`;
}

export function assetPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");
  return trimmedBase ? `${trimmedBase}/${normalizedPath}` : `/${normalizedPath}`;
}
