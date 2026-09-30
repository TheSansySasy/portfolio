import { FlowDiagram } from '../diagrams/FlowDiagram'
import { CodeBlock } from '../ui/CodeBlock'
import { DossierBlock, DossierList, DossierMetrics, DossierStack } from './DossierShell'

function ChainOfCommand() {
  return (
    <FlowDiagram
      label="Chain of Command"
      height={300}
      caption="Chain of Command wraps a standard method without copying it. Code before next runs first, code after next sees the result, and Microsoft's method is never edited, so platform updates still apply cleanly."
      description="A caller, such as a form, a service or a batch job, calls a standard method. The call enters my extension class first, which runs its code before next, then calls next. Next passes through any other extensions in the chain and reaches Microsoft's standard method, which is never edited. The result returns through each wrapper, so my code after next can add checks or adjust the result before it reaches the caller."
      boxes={[
        { x: 16, y: 60, w: 190, title: 'Caller', sub: 'form, service or job' },
        { x: 256, y: 60, w: 200, title: 'My extension', sub: 'code before next', accent: true },
        { x: 506, y: 60, w: 178, title: 'Other wrappers', sub: 'any order, if any' },
        { x: 506, y: 200, w: 178, title: 'Standard method', sub: "Microsoft's, untouched" },
        { id: 'after', x: 256, y: 200, w: 200, title: 'My extension', sub: 'code after next', accent: true },
        { id: 'result', x: 16, y: 200, w: 190, title: 'Caller', sub: 'gets the result' },
      ]}
      links={[
        { d: 'M206 88 L256 88', accent: true },
        { d: 'M456 88 L506 88', accent: true },
        { d: 'M595 116 L595 200', accent: true },
        { d: 'M506 228 L456 228' },
        { d: 'M256 228 L206 228' },
      ]}
      notes={[
        { x: 481, y: 80, text: 'next', anchor: 'middle' },
        { x: 603, y: 162, text: 'next' },
        { x: 481, y: 248, text: 'result', anchor: 'middle' },
        { x: 231, y: 248, text: 'result', anchor: 'middle' },
      ]}
    />
  )
}

export function D365Extensions() {
  return (
    <>
      <DossierBlock label="Context" heading="Learning, said plainly">
        <p>
          F&amp;O development is not my day job, and I would rather say so than let a page imply it.
          My time at Tectura was functional training, and it earned me MB-310, the Dynamics 365
          Finance functional certification. The technical side I am learning on my own time: X++
          extensions across thirteen modules in an environment I provisioned through the Power
          Platform admin center. MB-500, the developer exam, is my target for November 2026.
        </p>
        <p>
          One piece of work here was a real engagement for someone else: enabling Microsoft Copilot
          across a Finance and Operations environment. It is written up at the end.
        </p>
      </DossierBlock>

      <DossierBlock label="The extensions program">
        <DossierList
          items={[
            'Table and form extensions, extended data types and enums: adding to standard objects without overlaying them.',
            'Form data source and control event handlers, for behaviour that belongs to the form rather than the data.',
            'Chain of Command with next-chaining, to wrap standard methods and keep their behaviour intact.',
            'validateField post-handlers, for field-format validation that runs wherever the field is edited.',
            'Set-based database work: insert_recordset, delete_from and RecordInsertList, instead of one round trip per row.',
            'Classes with two entry points through Args.parm(), so the same logic runs from a menu item or from code.',
            'Date-driven line generation: building a schedule of lines from a start and end date in one pass.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Architecture">
        <ChainOfCommand />
      </DossierBlock>

      <DossierBlock label="Annotated code" heading="Two patterns from the program">
        <p>
          Written for this page to show the patterns, with a made-up table and field names. X++ has
          no highlighter here, so the notes do the work.
        </p>
        <CodeBlock
          title="chain of command, simplified"
          language="x++"
          lines={[
            { code: '[ExtensionOf(tableStr(CustTable))]', note: 'Wraps the standard table; never edits it' },
            { code: 'final class CustTable_SR_Extension' },
            { code: '{' },
            { code: '    public boolean validateField(FieldId _fieldIdToCheck)' },
            { code: '    {' },
            {
              code: '        boolean ret = next validateField(_fieldIdToCheck);',
              note: 'Standard validation runs first, untouched',
            },
            { code: '' },
            { code: '        if (ret && _fieldIdToCheck == fieldNum(CustTable, VATNum)' },
            {
              code: "            && strLen(strKeep(this.VATNum, '0123456789')) < 8)",
              note: 'My rule only adds to the standard one',
            },
            { code: '        {' },
            { code: '            ret = checkFailed("Tax number needs at least 8 digits.");' },
            { code: '        }' },
            { code: '        return ret;' },
            { code: '    }' },
            { code: '}' },
          ]}
        />
        <CodeBlock
          title="set-based line generation, simplified"
          language="x++"
          lines={[
            { code: 'public static void main(Args _args)', note: 'Entry point one: a menu item' },
            { code: '{' },
            {
              code: '    SRScheduleGenerator::generate(_args.parm());',
              note: 'The menu item passes the schedule ID',
            },
            { code: '}' },
            { code: '' },
            { code: 'public static void generate(SRScheduleId _scheduleId)', note: 'Entry point two: from code' },
            { code: '{' },
            { code: '    SRSchedule      schedule = SRSchedule::find(_scheduleId);' },
            { code: '    SRScheduleLine  line;' },
            { code: '    RecordInsertList lines = new RecordInsertList(tableNum(SRScheduleLine));' },
            { code: '    TransDate       day;' },
            { code: '' },
            {
              code: '    delete_from line where line.ScheduleId == _scheduleId;',
              note: 'One set-based statement, not a loop of deletes',
            },
            { code: '' },
            { code: '    for (day = schedule.FromDate; day <= schedule.ToDate; day = day + 1)' },
            { code: '    {' },
            { code: '        line.clear();' },
            { code: '        line.ScheduleId = _scheduleId;' },
            { code: '        line.TransDate  = day;' },
            { code: '        lines.add(line);', note: 'Collected in memory' },
            { code: '    }' },
            { code: '    lines.insertDatabase();', note: 'Written in as few round trips as possible' },
            { code: '}' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="The Copilot rollout" heading="A real engagement">
        <DossierList
          items={[
            'Enabled Microsoft Copilot across a commercial cloud Finance and Operations environment, through Power Platform admin center settings and Feature Management.',
            'Verified the Copilot sidecar live in the environment, rather than stopping at a settings screen.',
            'Wrote the steps up as a reusable rollout runbook, so the next environment is a checklist rather than a search.',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Where it stands">
        <DossierMetrics
          items={[
            { value: '13', label: 'modules, self-study' },
            { value: 'MB-310', label: 'certified' },
            { value: 'Nov 2026', label: 'MB-500 target' },
          ]}
        />
      </DossierBlock>

      <DossierBlock label="Stack">
        <DossierStack
          items={[
            'X++',
            'Visual Studio',
            'Chain of Command',
            'Data entities',
            'Power Platform admin center',
            'Lifecycle Services',
            'Feature Management',
            'Microsoft Copilot',
            'Azure DevOps',
            'Git',
          ]}
        />
      </DossierBlock>

      <DossierBlock label="What comes next">
        <DossierList
          items={[
            'MB-500 in November 2026, and development work on a real project once I have it.',
            'Data entities and integration patterns next: they are where F&O meets the Business Central and Python integration work I already do.',
          ]}
        />
      </DossierBlock>
    </>
  )
}
