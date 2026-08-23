/**
 * Le layout `/admin` ne garde rien.
 *
 * Le garde vit dans `(panel)/layout.tsx`, qui ne couvre que les écrans
 * protégés. Celui-ci s'applique aussi à `/admin/login` et
 * `/admin/access-denied` — deux pages qu'on doit pouvoir atteindre justement
 * quand on n'a pas le droit d'entrer.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
