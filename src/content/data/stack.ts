export type StackItem = {
  name: string
  /** One line of lived experience, shown on the sphere tile in Phase 3. */
  note: string
}

export type StackGroup = {
  group: string
  lens: 'D365' | 'Engineering' | 'Cloud'
  items: StackItem[]
}

export const STACK: StackGroup[] = [
  {
    group: 'Dynamics 365',
    lens: 'D365',
    items: [
      {
        name: 'Business Central',
        note: 'In production: per-client connectors, OData and REST, OAuth2 and NTLM',
      },
      {
        name: 'D365 F&O (functional)',
        note: 'MB-310 certified: general ledger, payables, receivables, fixed assets, budgeting',
      },
      {
        name: 'X++ (self-study)',
        note: 'Extensions, chain of command, event handlers, set-based operations',
      },
      {
        name: 'Power Platform Admin',
        note: 'Environment provisioning, feature management, Copilot enablement',
      },
      { name: 'Lifecycle Services', note: 'Environment administration and deployment' },
    ],
  },
  {
    group: 'Languages',
    lens: 'Engineering',
    items: [
      { name: 'Python', note: 'Daily driver: services, pipelines, automation' },
      { name: 'SQL', note: 'MySQL, PostgreSQL and T-SQL across production systems' },
      { name: 'PowerShell', note: 'Windows automation, alerting and failover scripts' },
      { name: 'TypeScript', note: 'This site, and Node services in production' },
      { name: 'C#', note: 'Alongside X++ in the Dynamics stack' },
      { name: 'Bash', note: 'Linux administration and deployment' },
    ],
  },
  {
    group: 'Backend and APIs',
    lens: 'Engineering',
    items: [
      { name: 'FastAPI', note: 'The document platform and its billing portal' },
      { name: 'REST and OData', note: 'Per-client connectors into Business Central' },
      { name: 'JWT auth', note: 'HttpOnly cookie sessions, admin and client roles' },
      { name: 'Alembic', note: 'Schema migrations on PostgreSQL and MySQL' },
      { name: 'Nginx', note: 'Reverse proxy and TLS termination' },
    ],
  },
  {
    group: 'AI and agents',
    lens: 'Engineering',
    items: [
      { name: 'Gemini Flash', note: 'Document extraction at 26,000+ documents and counting' },
      { name: 'Claude API', note: 'Powers the bot-training module in the billing portal' },
      { name: 'Claude Code', note: 'Spec-driven development, including this site' },
      { name: 'Token accounting', note: 'Per-document cost tracking that feeds billing' },
      { name: 'MCP servers', note: 'Tooling around agentic workflows' },
      { name: 'Microsoft Copilot', note: 'Enabled and verified across an F&O environment' },
    ],
  },
  {
    group: 'Cloud',
    lens: 'Cloud',
    items: [
      { name: 'Azure VMs', note: 'Windows and Linux, including the SQL cluster nodes' },
      { name: 'Azure SQL', note: 'Managed SQL after migrating off GCP' },
      { name: 'Virtual Network', note: 'Subnets, load balancers, VPN gateway' },
      { name: 'Cosmos DB', note: 'Migration target for MongoDB workloads' },
      { name: 'AWS', note: 'EC2 and S3, alongside the Azure work' },
      { name: 'GCP', note: 'The platform I migrated databases off, to Azure' },
      { name: 'GitHub Actions', note: 'Pipelines that cut deploy time by 60 percent' },
      { name: 'Docker', note: 'Containerised services and local parity' },
      { name: 'Terraform', note: 'Infrastructure as code' },
    ],
  },
  {
    group: 'Data',
    lens: 'Engineering',
    items: [
      { name: 'SQL Server', note: 'Always On availability groups on failover clustering' },
      { name: 'MySQL', note: 'Billing, document status and token usage' },
      { name: 'PostgreSQL', note: 'The retail ERP deployment' },
      { name: 'Redis', note: 'Caching and queues' },
      { name: 'MongoDB', note: 'Managed before the Cosmos DB migration' },
    ],
  },
  {
    group: 'Operations',
    lens: 'Cloud',
    items: [
      { name: 'Always On', note: 'Two-node cluster, listener, designed failover' },
      { name: 'Grafana', note: 'Dashboards over production metrics' },
      { name: 'Prometheus', note: 'Metrics collection' },
      { name: 'Zabbix', note: 'Host and service monitoring' },
      { name: 'Certbot', note: 'TLS across self-hosted services' },
      { name: 'systemd', note: 'Service supervision on Ubuntu' },
    ],
  },
]
