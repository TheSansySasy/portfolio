import { DocPipeline } from '../diagrams/DocPipeline'
import { CodeBlock } from '../ui/CodeBlock'
import { DossierBlock, DossierList, DossierMetrics, DossierStack } from './DossierShell'

export function AiDocumentPlatform() {
  return (
    <>
      <DossierBlock label="Context">
        <p>
          Corporate clients receive documents as files, not as data. Someone has to read each one
          and type it into the finance system, and that is the step everyone wants to delete. I
          built the service that does it, and the accounting that makes it billable.
        </p>
      </DossierBlock>

      <DossierBlock label="The problem">
        <DossierList
          items={[
            'Documents arrive in client SharePoint folders in whatever shape the sender used, and have to end up as structured records in Dynamics 365 Business Central.',
            'Every client authenticates differently. Cloud tenants use OAuth2, on-premises installations use NTLM, and some clients want files over SFTP instead.',
            'The service is sold by consumption, so extraction that cannot be counted cannot be invoiced.',
            'A language model is a variable cost. Without per-document token accounting, margin is a guess.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Architecture">
        <DocPipeline />
      </DossierBlock>

      <DossierBlock label="What I built">
        <DossierList
          items={[
            'A FastAPI service that polls each client SharePoint location, claims documents, and runs them through extraction with Gemini Flash against a schema per document type.',
            'A validation step before delivery, so totals and required fields are checked rather than trusted.',
            'Per-client connectors into Business Central covering cloud OAuth2 and on-premises NTLM, plus an SFTP delivery path for clients without an ERP endpoint.',
            'A metering layer that writes status, page count, row count and token usage per document to MySQL, which the billing portal reads directly.',
            'Deployment on Ubuntu virtual machines with per-client isolation, so one client is never able to see or exhaust another.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="Extraction is priced as it happens">
        <p>
          The shape below is the part worth copying: the model call and the accounting are one unit
          of work, so a document cannot be delivered without also being costed.
        </p>
        <CodeBlock
          title="extraction, simplified"
          language="python"
          lines={[
            { code: 'class InvoiceFields(BaseModel):', note: 'Extraction targets a schema, not free text' },
            { code: '    invoice_number: str' },
            { code: '    invoice_date: date' },
            { code: '    total: Decimal' },
            { code: '    lines: list[InvoiceLine]', note: 'Nested rows are what the ERP actually needs' },
            { code: '' },
            { code: 'async def extract(doc: Document) -> Extraction:' },
            { code: '    result = await model.parse(doc.bytes, schema=InvoiceFields)' },
            {
              code: '    usage = result.usage',
              note: 'Prompt and completion tokens come back with the response',
            },
            { code: '' },
            { code: '    await usage_repo.record(', note: 'Same transaction as the result itself' },
            { code: '        document_id=doc.id,' },
            { code: '        client_id=doc.client_id,' },
            { code: '        pages=doc.page_count,' },
            { code: '        rows=len(result.data.lines),', note: 'Rows are a billable unit, not a detail' },
            { code: '        input_tokens=usage.input,' },
            { code: '        output_tokens=usage.output,' },
            { code: '    )' },
            { code: '    return result' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Outcome">
        <DossierMetrics
          items={[
            { value: '26,000+', label: 'documents in 2026' },
            { value: '5', label: 'products live' },
            { value: '2', label: 'auth models supported' },
          ]}
        />
        <p>
          Production and UAT combined, across five products. Because every document carries its own
          status and cost, invoicing is a query rather than a reconciliation exercise.
        </p>
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={[
            'Python',
            'FastAPI',
            'Gemini Flash',
            'MySQL',
            'SharePoint',
            'Business Central',
            'SFTP',
            'Ubuntu',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="What I would do differently">
        <DossierList
          items={[
            "Put a durable queue between ingestion and extraction from the start. Polling worked, but a queue makes retries and backpressure a solved problem rather than mine.",
            'Version the extraction schemas explicitly, so a schema change is traceable against the documents that were processed under the old one.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
