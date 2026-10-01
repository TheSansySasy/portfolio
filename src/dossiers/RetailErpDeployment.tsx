import { FlowDiagram } from '../diagrams/FlowDiagram'
import { CodeBlock } from '../ui/CodeBlock'
import { DossierBlock, DossierList, DossierStack } from './DossierShell'

function ErpServer() {
  return (
    <FlowDiagram
      label="Retail ERP server"
      height={360}
      caption="One server, one public port. Nginx terminates TLS and is the only thing listening on the internet; every service behind it listens where Nginx expects it and nowhere else."
      description="Point-of-sale and warehouse users reach the Ubuntu 22.04 server over HTTPS. Nginx, with a Certbot certificate, is the only public listener and routes to a Node.js 20 frontend and a Python 3.12 backend, each run by systemd. The backend uses PostgreSQL, migrated with Alembic, and Redis. Code is pulled from the Git host over SSH on port 443, because outbound port 22 was blocked."
      groups={[{ x: 196, y: 36, w: 492, h: 312, label: 'Ubuntu 22.04 VPS' }]}
      boxes={[
        { x: 16, y: 64, w: 150, title: 'POS, warehouse', sub: 'users over HTTPS' },
        { x: 16, y: 272, w: 150, title: 'Git host', sub: 'source repositories' },
        { x: 214, y: 64, w: 200, title: 'Nginx', sub: 'TLS via Certbot', accent: true },
        { x: 214, y: 168, w: 200, title: 'Frontend', sub: 'Node.js 20, systemd' },
        { x: 460, y: 168, w: 210, title: 'Backend', sub: 'Python 3.12, systemd' },
        { x: 214, y: 272, w: 200, title: 'Redis', sub: 'in-memory store' },
        { x: 460, y: 272, w: 210, title: 'PostgreSQL', sub: 'migrated with Alembic' },
      ]}
      links={[
        { d: 'M166 92 L214 92', accent: true },
        { d: 'M314 120 L314 168' },
        { d: 'M414 104 L565 168' },
        { d: 'M565 224 L565 272' },
        { d: 'M460 212 L414 284' },
        { d: 'M166 300 L196 300', dashed: true, accent: true },
      ]}
      notes={[
        { x: 190, y: 84, text: '443', anchor: 'middle' },
        { x: 322, y: 148, text: '/' },
        { x: 500, y: 130, text: '/api' },
        { x: 91, y: 262, text: 'SSH over 443, outbound', anchor: 'middle' },
      ]}
    />
  )
}

export function RetailErpDeployment() {
  return (
    <>
      <DossierBlock label="Context">
        <p>
          A retail client needed their ERP running: point of sale at the front and warehouse
          management behind it. At EBT I deployed the whole stack onto a single Ubuntu 22.04
          server, and I maintain it.
        </p>
      </DossierBlock>

      <DossierBlock label="The problem">
        <DossierList
          items={[
            'The server blocked outbound ports, so pulling code over SSH, the ordinary first step of any deployment, simply timed out.',
            'The stack has several moving parts: PostgreSQL, Redis, a Node.js 20 frontend and a Python 3.12 backend with Alembic migrations.',
            'Builds failed on the server, and services came up without listening where the web server expected them.',
            'A public address needed real TLS, not a self-signed warning page.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Architecture">
        <ErpServer />
      </DossierBlock>

      <DossierBlock label="What I built">
        <DossierList
          items={[
            'Git over SSH on port 443, which the network allowed, instead of port 22, which it did not.',
            'PostgreSQL and Redis on the same host, with the schema managed by Alembic migrations rather than by hand.',
            'Each application process as a systemd service, so it starts on boot, restarts on failure and logs to one place.',
            'Nginx as the single public entry, routing to the frontend and the backend, with TLS from Certbot.',
            'Fixes for the build failures and the service binding problems, so each service listens exactly where Nginx sends traffic.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="Two small files that unblocked the deployment">
        <p>Both simplified, with paths and names generalised.</p>
        <CodeBlock
          title="~/.ssh/config"
          language="ssh"
          lines={[
            { code: 'Host github.com', note: 'The name Git already uses; nothing else changes' },
            {
              code: '    HostName ssh.github.com',
              note: 'GitHub, for example, serves SSH on 443 at this host',
            },
            { code: '    Port 443', note: 'Outbound 22 was blocked; 443 was not' },
            { code: '    User git' },
          ]}
        />
        <CodeBlock
          title="the shape of each service"
          language="systemd"
          lines={[
            { code: '[Unit]' },
            {
              code: 'After=network-online.target postgresql.service redis-server.service',
              note: 'Starts after its dependencies, not in a race with them',
            },
            { code: 'Wants=network-online.target' },
            { code: '' },
            { code: '[Service]' },
            { code: 'User=erp', note: 'Never root' },
            { code: 'WorkingDirectory=/srv/erp/backend' },
            {
              code: 'ExecStart=/srv/erp/backend/.venv/bin/python -m app --host 127.0.0.1 --port 8000',
              note: 'Loopback only: Nginx is the one public listener',
            },
            { code: 'Restart=on-failure', note: 'A crash is a restart, not a phone call' },
            { code: '' },
            { code: '[Install]' },
            { code: 'WantedBy=multi-user.target', note: 'Comes back on its own after a reboot' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Outcome">
        <p>
          The ERP shipped on the server it was given, despite the blocked ports, and it runs as a
          set of ordinary services that restart themselves and survive a reboot. Nothing about it
          needs me to be logged in.
        </p>
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={[
            'Ubuntu 22.04',
            'Nginx',
            'Certbot',
            'systemd',
            'PostgreSQL',
            'Alembic',
            'Redis',
            'Node.js 20',
            'Python 3.12',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="What I would do differently">
        <DossierList
          items={[
            'Build in CI and ship artefacts, or containers, rather than building on the server, where a restricted network makes every failure slower to fix.',
            'Ask for the network rules before provisioning. A blocked port found on day one costs minutes; found mid-deployment it costs an afternoon.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
