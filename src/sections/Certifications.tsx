import { CERTIFICATIONS } from '../content/data/certifications'
import { SECTION_META } from '../content/data/site'
import { Section } from '../ui/Section'

export function Certifications() {
  return (
    <Section {...SECTION_META.certs}>
      <ul className="flex flex-col">
        {CERTIFICATIONS.map((cert) => (
          <li key={cert.code} className="border-t border-line py-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-3">
                <p className="font-display text-2xl font-extrabold">{cert.code}</p>
                <p
                  className={`mono-label mt-2 ${
                    cert.status === 'earned' ? 'text-accent-text' : 'text-muted'
                  }`}
                >
                  {cert.status}
                </p>
              </div>
              <div className="md:col-span-9">
                <p className="font-medium">{cert.name}</p>
                <p className="mt-2 text-muted">{cert.detail}</p>
                {cert.url ? (
                  <a
                    href={cert.url}
                    rel="noopener"
                    className="mono-label mt-3 inline-block border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent-text"
                  >
                    Verify on Microsoft Learn
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
