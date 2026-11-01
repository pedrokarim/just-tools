import { Metadata } from "next";
import { Bug, Mail, Shield } from "lucide-react";
import {
  ReadingColumn,
  ReadingSection,
  SiteShell,
} from "@/components/site/site-shell";
import { PROJECT_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Comment joindre l'équipe de Just Tools : signaler un problème, proposer un outil, exercer tes droits sur tes données ou poser une question.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    Icon: Bug,
    title: "Un problème ou une idée",
    text: "Le plus rapide est d'ouvrir une issue sur GitHub : tout le monde peut la lire, et le suivi reste public.",
    label: "Ouvrir une issue",
    href: `${PROJECT_CONFIG.project.github}/issues`,
    external: true,
  },
  {
    Icon: Mail,
    title: "Une question",
    text: "Pour tout ce qui ne relève pas d'un problème technique, écris-nous directement.",
    label: PROJECT_CONFIG.contact.email,
    href: `mailto:${PROJECT_CONFIG.contact.email}`,
    external: false,
  },
  {
    Icon: Shield,
    title: "Tes données",
    text: "Pour exercer tes droits d'accès, de rectification ou d'effacement, écris à la même adresse en précisant ta demande.",
    label: "Politique de confidentialité",
    href: "/legal/privacy",
    external: false,
  },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <ReadingColumn
        title="Contact"
        lead="Just Tools est maintenu par une petite équipe. Voici le bon endroit pour chaque demande."
      >
        <ul className="divide-border border-border mb-10 divide-y border-y">
          {CHANNELS.map(({ Icon, title, text, label, href, external }) => (
            <li key={title} className="flex gap-4 py-5">
              <Icon
                size={18}
                className="text-link mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="text-fg text-[0.9375rem] font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="text-fg-muted text-[0.9375rem] leading-relaxed">
                  {text}
                </p>
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-link w-fit rounded-sm text-sm font-medium break-all underline-offset-4 hover:underline"
                >
                  {label}
                </a>
              </div>
            </li>
          ))}
        </ul>

        <ReadingSection id="qui-sommes-nous" title="Qui nous sommes">
          <p>
            Just Tools est développé par {PROJECT_CONFIG.creator.name} (
            {PROJECT_CONFIG.creator.alias}) pour {PROJECT_CONFIG.company.name}.
            Pour en savoir plus sur l&apos;entreprise et ses autres projets,
            rends-toi sur{" "}
            <a
              href={PROJECT_CONFIG.company.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              ascencia.re
            </a>
            .
          </p>
        </ReadingSection>
      </ReadingColumn>
    </SiteShell>
  );
}
