import { FlowDiagram } from '../diagrams/FlowDiagram'
import { RUNBOOKS } from '../content/data/runbooks'
import { CodeBlock } from '../ui/CodeBlock'
import { RunbookList } from '../ui/RunbookList'
import { DossierBlock, DossierList, DossierMetrics, DossierStack } from './DossierShell'

function Migration() {
  return (
    <FlowDiagram
      label="Migration and deployment"
      height={340}
      caption="The move and the pipeline were one piece of work. Databases went to managed Azure services; applications went to Azure servers that a GitHub Actions pipeline deploys to and PM2 keeps running."
      description="On GCP, SQL databases, MongoDB and application servers. SQL moved to Azure Managed SQL and MongoDB to Azure Cosmos DB; the applications moved to Azure virtual machines where PM2 runs the Node.js and Next.js frontends and backends. A GitHub Actions workflow in each private repository builds on every push and deploys to those machines, and Azure Storage holds files."
      groups={[
        { x: 12, y: 36, w: 196, h: 292, label: 'GCP, before' },
        { x: 262, y: 36, w: 426, h: 292, label: 'Azure, after' },
      ]}
      boxes={[
        { x: 28, y: 60, w: 164, title: 'SQL', sub: 'relational data' },
        { x: 28, y: 156, w: 164, title: 'MongoDB', sub: 'document data' },
        { x: 28, y: 252, w: 164, title: 'App servers', sub: 'Node.js and Next.js' },
        { x: 278, y: 60, w: 186, title: 'Azure Managed SQL', sub: 'from SQL' },
        { x: 278, y: 156, w: 186, title: 'Cosmos DB', sub: 'from MongoDB' },
        { x: 278, y: 252, w: 186, title: 'Azure VMs', sub: 'Node.js, Next.js on PM2', accent: true },
        { x: 490, y: 60, w: 182, title: 'Azure Storage', sub: 'new storage layout' },
        { x: 490, y: 156, w: 182, title: 'Private repos', sub: 'frontend and backend' },
        { x: 490, y: 252, w: 182, title: 'GitHub Actions', sub: 'deploy.yml', accent: true },
      ]}
      links={[
        { d: 'M192 88 L278 88', dashed: true },
        { d: 'M192 184 L278 184', dashed: true },
        { d: 'M192 280 L278 280', dashed: true },
        { d: 'M581 212 L581 252' },
        { d: 'M490 280 L464 280', accent: true },
      ]}
      notes={[
        { x: 235, y: 80, text: 'migrate', anchor: 'middle' },
        { x: 589, y: 236, text: 'on push' },
        { x: 477, y: 246, text: 'deploy', anchor: 'middle' },
      ]}
    />
  )
}

export function GcpToAzure() {
  return (
    <>
      <DossierBlock label="Context">
        <p>
          At Runtime Solutions I was the DevOps engineer, from July 2025 to February 2026. The job
          was to move the company's workloads off GCP and onto Azure, and to make deployments
          fast and automatic.
        </p>
      </DossierBlock>

      <DossierBlock label="The problem">
        <DossierList
          items={[
            'Five or more database environments, MySQL and MongoDB among them, to be moved without losing data or trust.',
            'Deployments were slow, and slow deployments hold releases back.',
            'Node.js and Next.js servers did not come back on their own after a crash or a reboot.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Architecture">
        <Migration />
      </DossierBlock>

      <DossierBlock label="What I built">
        <DossierList
          items={[
            'The Azure infrastructure itself: servers, storage and networking for five-plus database environments.',
            'The migration: SQL databases to Azure Managed SQL, MongoDB to Cosmos DB.',
            'A GitHub Actions deploy.yml for the private repositories, so a push to the main branch builds and deploys the frontend and backend.',
            'PM2 with autostart for the Node.js and Next.js applications, so a crash is a restart and a reboot brings everything back.',
            'Documentation for knowledge transfer and maintenance, so the setup outlived my time there.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="A release is a push">
        <p>The shape of the workflow and the process manager, simplified.</p>
        <CodeBlock
          title=".github/workflows/deploy.yml"
          language="yaml"
          lines={[
            { code: 'on:' },
            { code: '  push:' },
            { code: '    branches: [main]', note: 'Merging is releasing' },
            { code: 'jobs:' },
            { code: '  deploy:' },
            { code: '    runs-on: ubuntu-latest' },
            { code: '    steps:' },
            { code: '      - uses: actions/checkout@v4' },
            { code: '      - uses: actions/setup-node@v4' },
            { code: '        with: { node-version: lts/* }' },
            { code: '      - run: npm ci && npm run build', note: 'A failed build never reaches a server' },
            { code: '      - name: Ship and reload' },
            { code: '        run: ./scripts/deploy.sh', note: 'Copies the build over SSH, key from secrets' },
            { code: '        env:' },
            { code: '          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}' },
          ]}
        />
        <CodeBlock
          title="on each server, once"
          language="bash"
          lines={[
            { code: 'pm2 start ecosystem.config.js', note: 'Frontend and backend as named processes' },
            { code: 'pm2 save', note: 'Remember exactly what is running' },
            { code: 'pm2 startup systemd', note: 'Restore it on every boot' },
            { code: '' },
            { code: 'pm2 reload ecosystem.config.js', note: 'What each deployment runs: reload, not stop and start' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Runbook" heading="Scaling without a person in the loop">
        <p>
          A document from my Azure work: an App Service plan that moves up a tier when it is
          busy and back down when it is not, with client details taken out.
        </p>
        <RunbookList items={[RUNBOOKS.appServiceScaling]} />
      </DossierBlock>

      <DossierBlock label="Outcome">
        <DossierMetrics
          items={[
            { value: '60%', label: 'faster deployments' },
            { value: '99.9%', label: 'uptime held' },
            { value: '80%', label: 'less downtime with PM2' },
          ]}
        />
        <p>
          Across five-plus database environments, and the same figures as on the resume.
        </p>
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={[
            'Azure VMs',
            'Azure Managed SQL',
            'Cosmos DB',
            'Azure Storage',
            'GitHub Actions',
            'PM2',
            'Node.js',
            'Next.js',
            'MySQL',
            'MongoDB',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="What I would do differently">
        <DossierList
          items={[
            'Describe the Azure resources in Terraform or Bicep from the first day, so the environment could be rebuilt from the repository rather than from my notes.',
            'Move the applications to containers, so a deployment ships an image instead of running commands on a long-lived server.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
