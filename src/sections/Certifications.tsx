import { CERTIFICATIONS } from '../content/data/certifications'
import { SECTION_META, SITE } from '../content/data/site'
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
                  <a href={cert.url} className="mono-label mt-3 inline-block text-accent-text">
                    Verify on Credly
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {SITE.credly ? null : (
        <p className="mono-label mt-6 text-muted">
          Verification links go here once the Credly badge URL is in place.
        </p>
      )}
    </Section>
  )
}
