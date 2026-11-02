/**
 * Durée de conservation des statistiques, annoncée dans la politique de
 * confidentialité. La réduire efface tout ce qui dépasse à la purge suivante.
 */
export const ANALYTICS_RETENTION_MONTHS = 25;

const IPV4_PATTERN = /^(?:::ffff:)?((?:\d{1,3}\.){2}\d{1,3})\.\d{1,3}$/i;
const IPV6_GROUP_PATTERN = /^[0-9a-f]{1,4}$/;
const IPV6_GROUP_COUNT = 8;
/** Les trois premiers groupes (/48) désignent un réseau, pas une machine. */
const IPV6_KEPT_GROUPS = 3;

/** Les huit groupes d'une adresse IPv6, ou `undefined` si elle n'en est pas une. */
function expandIpv6(address: string): string[] | undefined {
  const parts = address.toLowerCase().split("::");
  if (parts.length > 2) return undefined;

  const head = parts[0] ? parts[0].split(":") : [];
  const tail = parts[1] ? parts[1].split(":") : [];
  const missing = IPV6_GROUP_COUNT - head.length - tail.length;

  // Sans `::`, les huit groupes sont écrits ; avec, il en manque au moins un.
  if (parts.length === 1 ? missing !== 0 : missing < 1) return undefined;

  const groups = [...head, ...Array<string>(missing).fill("0"), ...tail];
  return groups.every((group) => IPV6_GROUP_PATTERN.test(group))
    ? groups
    : undefined;
}

/**
 * Retire d'une adresse IP ce qui désigne une machine : le dernier octet en IPv4,
 * tout ce qui suit le /48 en IPv6. Ce qui n'est pas une adresse n'est pas gardé.
 */
export function anonymizeIp(address: string): string | undefined {
  const value = address.trim();

  const ipv4 = value.match(IPV4_PATTERN);
  if (ipv4) return `${ipv4[1]}.0`;

  const groups = expandIpv6(value);
  return groups ? `${groups.slice(0, IPV6_KEPT_GROUPS).join(":")}::` : undefined;
}
