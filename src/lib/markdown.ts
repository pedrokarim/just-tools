import { Marked, type Tokens } from "marked";

/**
 * Le rendu Markdown de l'éditeur.
 *
 * Le résultat part dans `dangerouslySetInnerHTML`, et le texte peut venir d'un
 * fichier importé : un document reçu d'un inconnu ne doit pas pouvoir exécuter du
 * script sur le site. Le HTML brut est donc échappé, et seules les adresses
 * inoffensives deviennent des liens ou des images.
 */

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Vrai pour une adresse relative ou d'un protocole autorisé. Les caractères de
 * contrôle sont retirés d'abord, parce que le navigateur les ignore :
 * `java\nscript:` reste du JavaScript pour lui.
 */
function isSafeUrl(url: string, protocols: string[]) {
  // eslint-disable-next-line no-control-regex
  const cleaned = url.replace(/[\u0000- ]/g, "").toLowerCase();
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(cleaned)?.[1];
  return scheme === undefined || protocols.includes(scheme);
}

const LINK_PROTOCOLS = ["http", "https", "mailto"];
const IMAGE_PROTOCOLS = ["http", "https"];

const renderer = new Marked({
  gfm: true,
  async: false,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }: Tokens.Link) {
      const label = this.parser.parseInline(tokens);
      if (!isSafeUrl(href, LINK_PROTOCOLS)) return label;
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(href)}"${titleAttribute} target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
    image({ href, title, text }: Tokens.Image) {
      if (!isSafeUrl(href, IMAGE_PROTOCOLS)) return escapeHtml(text);
      const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute} loading="lazy" />`;
    },
  },
});

export function renderMarkdown(text: string): string {
  return renderer.parse(text, { async: false });
}
