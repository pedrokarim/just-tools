/**
 * Charge un fichier de Prettier copié par `scripts/vendor-prettier.js`.
 *
 * L'`import()` reste natif, invisible du bundler : c'est tout l'intérêt, le
 * minifieur de Next cassant `plugins/babel`.
 */
export async function loadPrettierModule<T>(name: string): Promise<T> {
  const url = `/vendor/prettier/${name}.mjs`;
  const loaded = await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ url
  );
  return (loaded.default ?? loaded) as T;
}
