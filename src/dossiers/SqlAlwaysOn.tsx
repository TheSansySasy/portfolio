import { REPOS } from '../content/data/repos'
import { FlowDiagram } from '../diagrams/FlowDiagram'
import { CodeBlock } from '../ui/CodeBlock'
import { RepoCard } from '../ui/RepoCard'
import { DossierBlock, DossierList, DossierStack } from './DossierShell'

function KerberosPath() {
  return (
    <FlowDiagram
      label="Kerberos path"
      height={330}
      caption="KRB_AP_ERR_MODIFIED means the server could not open the ticket it was handed: the key the domain sealed it with did not match the key on the server. Anything in the bottom row can cause that, which is why the search runs along it."
      description="Clients ask a domain controller for a Kerberos ticket, then present it to the availability group listener, which routes to the primary node; the primary commits synchronously to the secondary. Tickets are sealed with the keys of computer accounts and service principal names in Active Directory. Cluster roles, including Cluster-Aware Updating, own computer objects of their own, and the offline Cluster-Aware Updating role was the cause."
      groups={[{ x: 12, y: 36, w: 676, h: 282, label: 'Azure virtual network · Active Directory domain' }]}
      boxes={[
        { x: 28, y: 60, w: 140, title: 'Clients', sub: 'apps and logins' },
        { x: 220, y: 60, w: 150, title: 'Listener', sub: 'one name, the primary', accent: true },
        { x: 420, y: 60, w: 120, title: 'Node 01', sub: 'primary' },
        { x: 560, y: 60, w: 112, title: 'Node 02', sub: 'secondary' },
        { x: 28, y: 236, w: 160, title: 'Domain ctrl', sub: 'issues tickets (KDC)' },
        { x: 230, y: 236, w: 190, title: 'Accounts and SPNs', sub: 'the keys tickets use' },
        { x: 462, y: 236, w: 210, title: 'Cluster roles', sub: 'CAU group offline', accent: true, dashed: true },
      ]}
      links={[
        { d: 'M168 88 L220 88', accent: true },
        { d: 'M370 88 L420 88', accent: true },
        { d: 'M540 88 L560 88', dashed: true },
        { d: 'M98 116 L98 236', dashed: true },
        { d: 'M188 264 L230 264' },
        { d: 'M462 264 L420 264', accent: true },
        { d: 'M480 116 L560 236' },
      ]}
      notes={[
        { x: 106, y: 180, text: '1  ask for a ticket' },
        { x: 194, y: 54, text: '2  present it', anchor: 'middle' },
        { x: 530, y: 180, text: 'roles run on the nodes' },
        { x: 441, y: 256, text: 'own', anchor: 'middle' },
        { x: 550, y: 54, text: 'sync', anchor: 'middle' },
      ]}
    />
  )
}

export function SqlAlwaysOn() {
  return (
    <>
      <DossierBlock label="Context">
        <p>
          At EBT I administer the SQL Server cluster under production: a two-node Always On
          availability group on Azure virtual machines, running on Windows Server failover
          clustering. The document platform and its billing portal both sit on top of it, so when
          it misbehaves, everything above it does too.
        </p>
      </DossierBlock>

      <DossierBlock label="The problem">
        <p>
          A production login started failing with a Kerberos error, KRB_AP_ERR_MODIFIED. The error
          says the server was handed a ticket it could not decrypt. The availability group itself
          looked healthy, which made it easy to look in the wrong place.
        </p>
        <DossierList
          items={[
            'The usual cause is a service principal name registered on the wrong account, or on two accounts at once.',
            'The next most common is a computer account whose password changed in the domain but not on the machine.',
            'Neither was the problem here.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Architecture">
        <KerberosPath />
      </DossierBlock>

      <DossierBlock label="What I found" heading="An idle role is not a harmless role">
        <p>
          The cluster had a Cluster-Aware Updating resource group sitting offline. Cluster roles
          like that one own computer objects in Active Directory, so an offline role is not just a
          feature nobody is using: its account state can drift away from what the domain expects.
          Bringing it back and correcting the account state fixed authentication, and the
          availability group stayed healthy throughout.
        </p>
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="Ruling out the usual suspects">
        <p>
          The order of the search, written as the commands that answer each question. Simplified,
          with the names generalised.
        </p>
        <CodeBlock
          title="the checks, in order"
          language="powershell"
          lines={[
            { code: 'setspn -X', note: 'Duplicate SPNs across the domain: the classic cause' },
            { code: 'setspn -L <sql-service-account>', note: 'What the SQL account actually owns' },
            {
              code: 'Test-ComputerSecureChannel -Verbose',
              note: "Is this node's machine password in step with the domain?",
            },
            { code: '' },
            {
              code: "Get-ClusterGroup | Where-Object State -ne 'Online'",
              note: 'Anything in the cluster that is not running',
            },
            {
              code: "Get-ClusterResource | Where-Object OwnerGroup -like '*CAU*'",
              note: 'The one that mattered: the updating role, offline',
            },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Afterwards" heading="The alerting I wished had existed">
        <DossierList
          items={[
            'Disk thresholds that warn before a volume fills, rather than after the database stops writing.',
            'CPU-triggered failover, so the listener moves before the primary becomes unusable, not after.',
            'Monitoring across Grafana, Prometheus and Zabbix, so the cluster is watched from more than one place.',
          ]}
        />
        <CodeBlock
          title="cpu-triggered failover, simplified"
          language="powershell"
          lines={[
            {
              code: "$load = (Get-Counter '\\Processor(_Total)\\% Processor Time' `",
              note: 'Sampled over two minutes, so a spike never moves the cluster',
            },
            { code: '    -SampleInterval 15 -MaxSamples 8).CounterSamples |' },
            { code: '    Measure-Object CookedValue -Average' },
            { code: 'if ($load.Average -lt $Threshold) { return }' },
            { code: '' },
            { code: '$lagging = Invoke-Sqlcmd -ServerInstance $Secondary -Query @"' },
            { code: 'SELECT COUNT(*) AS n FROM sys.dm_hadr_database_replica_states' },
            {
              code: "WHERE is_local = 1 AND synchronization_state_desc <> 'SYNCHRONIZED'",
              note: 'Only fail over to a secondary that has every commit',
            },
            { code: '"@' },
            {
              code: "if ($lagging.n -gt 0) { Send-Alert 'CPU high, secondary behind'; return }",
              note: 'Otherwise a person decides',
            },
            { code: '' },
            {
              code: 'Switch-SqlAvailabilityReplica `',
              note: 'Run against the target secondary; the listener follows',
            },
            { code: '    -Path "SQLSERVER:\\SQL\\$Secondary\\DEFAULT\\AvailabilityGroups\\$AG"' },
          ]}
        />
        <p>
          The simulation in the Operations section walks through the same failover, including what
          quorum and the witness are for.
        </p>
      </DossierBlock>

      <DossierBlock label="Code" heading="The runbook, in a repository">
        <p>
          The cluster as code, the procedures for building it and failing it over, the scripts
          above in full, and this troubleshooting guide. Written fresh, with nothing from a
          client environment.
        </p>
        <RepoCard repo={REPOS.sqlAg} />
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={[
            'SQL Server',
            'Always On',
            'WSFC',
            'Windows Server',
            'Azure VMs',
            'Active Directory',
            'Kerberos',
            'PowerShell',
            'Grafana',
            'Prometheus',
            'Zabbix',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="What I would do differently">
        <DossierList
          items={[
            'Alert on the state of every cluster resource, not only on disk and CPU. An offline role was the whole problem, and nothing was watching for it.',
            'Keep a written map of which cluster roles own which directory objects, so the next person does not have to rediscover it under pressure.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
