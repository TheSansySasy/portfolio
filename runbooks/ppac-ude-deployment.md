---
title: Dynamics 365 Finance and Operations on PPAC, with the Unified Developer Experience
subtitle: Deployment guide · April 2026 · PPAC-only deployment
slug: ppac-ude-deployment
---

## Context

Microsoft deprecated Lifecycle Services (LCS) for all new Dynamics 365 Finance and Operations implementations starting January 2026. All new deployments must use the Power Platform admin center (PPAC) exclusively. This document captures the complete end-to-end process, from initial environment provisioning through to a fully configured Unified Developer Experience (UDE) on a developer workstation.

Names in angle brackets, and `Contoso-FnO-Sandbox`, are placeholders for your own tenant, environment and paths.

## Document overview

| Phase | Description |
|---|---|
| Phase 1 · Prerequisites | Licence verification, capacity checks, role validation |
| Phase 2 · PPAC environment | Create the environment, install F&O via PowerShell (India region workaround) |
| Phase 3 · Azure DevOps setup | Create the organization, project, repo and folder structure |
| Phase 4 · UDE setup | Configure the developer workstation, connect Visual Studio 2022 to the UDE |
| Phase 5 · Post-deployment | Users, security groups, licence configuration, legal entity setup |

## Key lessons learned during deployment

> **Critical.** The "Automatically deploy these apps" dropdown must be left blank when creating an environment. Selecting Finance here causes a silent rollback, and the environment disappears after provisioning.

> **Warning.** The F&O Provisioning App does not appear in the tenant-level Dynamics 365 apps list for the India region, a known Microsoft UI limitation. PowerShell provisioning is the only reliable method for India region deployments.

> **Warning.** The environment name must be 19 characters or fewer for the hostname. The F&O runtime enforces this as a hard limit.

## Phase 1 · Prerequisites

Verify licences, capacity and roles before touching PPAC.

### 1.1 Licence verification

Navigate to Microsoft 365 admin center > Billing > Licenses and confirm that one of the following is assigned to the admin account:

| Licence | Notes |
|---|---|
| Dynamics 365 Operations Application Partner Sandbox | For partners and ISVs |
| Dynamics 365 Finance | For end-customer deployments |
| Dynamics 365 Supply Chain Management | Alternative for SCM-focused implementations |

> **Warning.** If the licence was recently assigned, wait up to 12 hours before the provisioning system recognizes it. There is a cache delay in Entra ID.

> **Info.** Users assigned the Power Platform Administrator or Dynamics 365 Administrator role in Entra ID do not require a full user licence to create environments or install apps.

### 1.2 Capacity check

Navigate to PPAC > Resources > Capacity and verify that each of these shows capacity available:

| Capacity type | Needed |
|---|---|
| Dataverse, database | Available |
| Operations, database | Available |
| Dataverse, file | Available |
| Log | Available |

> **Info.** Both Dataverse capacity and Operations database capacity must be available. A capacity shortage mid-provisioning causes silent environment deletion.

## Phase 2 · PPAC environment provisioning

Create the unified D365 F&O environment, by the India region PowerShell path.

### 2.1 Initial attempts: the UI path (failed for the India region)

Two UI-based approaches were attempted before the final successful method was found.

**Attempt 1, failed: auto-deploy Finance selected.**

> **Critical.** The "Automatically deploy these apps" dropdown was set to "Finance". This caused a silent rollback: the environment appeared to provision but disappeared from the environments list after about 1.5 hours.

**Attempt 2, failed: Provisioning App not visible in the India region.**

> **Critical.** Even with "Automatically deploy these apps" set to None and "Enable Dynamics 365 apps" toggled on, the Dynamics 365 Finance and Operations Provisioning App did not appear in either the environment-level app catalog or the tenant-level Dynamics 365 apps list when the region was set to India. This is a known Microsoft UI limitation for the India region.

### 2.2 Correct method: PowerShell provisioning

The PowerShell path bypasses the India region UI filtering entirely and talks directly to the provisioning API. This is the recommended and only reliable method for India region F&O deployments.

**Step 1 · Install the PowerShell module.** Open PowerShell as Administrator on any Windows machine:

```powershell
Install-Module -Name Microsoft.PowerApps.Administration.PowerShell -Force -AllowClobber
```

**Step 2 · Authenticate to Power Platform.** Sign in with the tenant's administrator account when prompted:

```powershell
Add-PowerAppsAccount
```

**Step 3 · Build the template metadata.** This controls which optional features are included in the deployment:

```powershell
$json = @"
{
  "PostProvisioningPackages": [
    {
      "applicationUniqueName": "msdyn_FinanceAndOperationsProvisioningAppAnchor",
      "parameters": "DevToolsEnabled=true|DemoDataEnabled=true"
    }
  ]
}
"@ | ConvertFrom-Json
```

> **Info.** `DevToolsEnabled=true` is required for UDE development. `DemoDataEnabled=true` loads Contoso demo data (set it to false for production).

**Step 4 · Provision the environment.**

```powershell
New-AdminPowerAppEnvironment `
  -DisplayName "Contoso-FnO-Sandbox" `
  -EnvironmentSku Sandbox `
  -Templates "D365_FinOps_Finance" `
  -TemplateMetadata $json `
  -LocationName "india" `
  -ProvisionDatabase
```

- This single command creates the environment and installs Platform Tools and the Provisioning App in one shot.
- Wait approximately 1.5 to 2 hours for full completion.
- Other available templates: `D365_FinOps_SCM`, `D365_FinOps_ProjectOperations`.

### 2.3 Verification: post-provisioning checks

Once provisioning completes, verify the following in PPAC > Environments > your environment:

| Field | Expected value |
|---|---|
| State | Ready |
| Environment URL (CE/Dataverse) | `<environment>.crm8.dynamics.com` |
| Finance and Operations URL | `https://<environment>.operations.dynamics.com` |
| Region | India |
| Type | Sandbox |
| Dataverse | Yes |

> **Warning.** Both URLs must be present and accessible. If the Finance and Operations URL is missing, the F&O runtime did not deploy correctly and PowerShell provisioning must be re-run.

## Phase 3 · Azure DevOps organization and project setup

Source control, repo structure, and the artifacts feed.

### 3.1 Create the organization

1. Go to dev.azure.com and sign in with the administrator account.
2. Click "Create new organization".
3. Choose the organization name, which gives `dev.azure.com/<your-org>`.
4. Region: match the PPAC environment's region.
5. Complete the captcha and click Continue.

### 3.2 Create the project

1. Click New Project inside the organization.
2. Project name: the environment's name.
3. Visibility: Private.
4. Version control: Git. TFVC is legacy, and YAML pipelines require Git.
5. Work item process: Agile.
6. Click Create.

### 3.3 Repository structure

Go to Repos and click Initialize, with a README and the VisualStudio `.gitignore` template. Create the following folder structure:

```text
/Metadata          X++ model source code
/Projects          Visual Studio solution files
/Pipelines         YAML pipeline definitions
.gitignore         VisualStudio template (auto-generated)
```

> **Info.** The Metadata folder is where all X++ customization code lives and gets committed. This is what developers clone locally.

### 3.4 Artifacts feed (optional, for CI/CD pipelines)

If and when CI/CD pipelines are configured, an Artifacts NuGet feed is required to store the X++ compiler packages. This step can be deferred until pipelines are needed.

| Detail | Value |
|---|---|
| Feed name | D365-NuGet |
| Scope | Project |
| Cost | Free up to 2 GB; the F&O NuGet packages are about 4 GB in total |
| Packages to push | `Microsoft.Dynamics.AX.Platform.CompilerPackage` and three others |
| Source path | `%LOCALAPPDATA%\Microsoft\Dynamics365\<version>\PackagesLocalDirectory` |

## Phase 4 · Unified Developer Experience setup

Connect the developer workstation to the cloud UDE, which replaces the old cloud-hosted VM.

### 4.1 Architecture shift: old and new

| Old model (LCS and cloud-hosted VM) | New model (PPAC and UDE) |
|---|---|
| RDP into an Azure VM for development | Develop on the local machine in Visual Studio 2022 |
| F&O runtime on the VM (localhost) | F&O runtime in the cloud UDE |
| Build on the VM | Build locally using downloaded binaries |
| Deploy via an LCS deployable package | Deploy via Extensions > Deploy Models to Online Environment |
| Pay per VM hour | Capacity-based, with no hourly VM cost |
| One VM is the dev, build and test environment | The local machine is dev; the cloud UDE is runtime and test |
| Provision via an LCS project | Provision via PPAC or PowerShell |

### 4.2 Developer machine prerequisites

| Component | Notes |
|---|---|
| Operating system | Windows 10 or Windows 11 |
| Visual Studio 2022 Professional | Version 17.14 (March 2026) |
| SQL Server Management Studio | Version 22, required for the local cross-reference database |
| .NET desktop development workload | Installed via the Visual Studio Installer |
| Modeling SDK (individual component) | Installed via the Visual Studio Installer |
| DGML editor (individual component) | Installed via the Visual Studio Installer |
| Microsoft Reporting Services Projects 2022 | Installed via the Visual Studio Marketplace |
| Power Platform Tools for Visual Studio | Installed via the Visual Studio Marketplace |
| D365 F&O Tools VSIX | Downloaded and installed automatically: `Microsoft.Dynamics.FinOps.ToolsVS2022.vsix` |

### 4.3 Power Platform Tools configuration

In Visual Studio 2022: Tools > Options > Power Platform Tools > General. Enable "Enable auto setup for Dynamics 365 when using the Unified environment" and click OK.

### 4.4 Verify the local database

Open SSMS and connect with these settings:

```text
Server type:      Database Engine
Server name:      (localdb)\MSSQLLocalDB
Authentication:   Windows Authentication
```

Confirm the connection succeeds: Object Explorer shows Databases, Security and so on. This local database stores the cross-reference data and metadata indexes for X++ development.

### 4.5 Connect Visual Studio to the UDE environment

**Tools > Connect to Dataverse.**

1. Deployment type: Office 365 (not On-premises).
2. Uncheck "Sign in as current user".
3. Check "Display list of available organizations".
4. Click Login; a browser opens for authentication. Sign in with the administrator account.
5. Select the environment from the list.
6. Select the non-Default solution when prompted.
7. Click Done.

**Download the F&O assets.** Visual Studio prompts: "Proceed with downloading the metadata, F&O VS extension and other assets for the version ...?"

1. Click Yes.
2. The download takes 10 to 30 minutes depending on internet speed.
3. Do not close Visual Studio during this process.
4. Monitor progress in the Output window (View > Output).

> **Warning.** If the VSIX installer does not run automatically after the download, run it manually: `%LOCALAPPDATA%\Microsoft\Dynamics365\<version>\Microsoft.Dynamics.FinOps.ToolsVS2022.vsix`

### 4.6 Configure metadata paths

In Visual Studio: Extensions > Dynamics 365 > Configure Metadata (it appears after the VSIX install).

```text
Cross reference DB server:    (LocalDB)\MSSQLLocalDB
Cross reference DB name:      SampleXRef
Application version:          <version>
Custom metadata folder:       C:\Repos\<project>\Metadata
Reference metadata folder:    %LOCALAPPDATA%\Microsoft\Dynamics365\<version>\PackagesLocalDirectory
```

> **Warning.** Both paths must exist on disk before clicking Save. A red highlight means the folder does not exist. Create the custom metadata folder manually first.

> **Info.** The custom metadata folder points to the cloned repo's Metadata subfolder. The reference metadata folder holds Microsoft's downloaded platform binaries, the same for all projects.

### 4.7 Verify the complete UDE setup

After configuration, restart Visual Studio and reconnect to Dataverse. Verify:

| Check | Expected result |
|---|---|
| Power Platform Explorer | Shows the environment with Tables, Choices, Processes and so on |
| Application Explorer (View > Application Explorer) | Shows the full F&O AOT: Tables, Classes, Forms, Enums |
| Extensions menu | Shows a "Dynamics 365" submenu with Model Management, Build Models, Deploy and so on |
| Status bar | Shows "Ready" and the environment name |
| F&O URL in the browser | `https://<environment>.operations.dynamics.com` loads D365 Finance |

## Phase 5 · Post-deployment configuration

Security, users, licence configuration and the legal entity.

### 5.1 Security group assignment

A new environment has no security group assigned, so any licensed user in the tenant can access it.

1. Create a security group in Microsoft Entra ID (Azure portal > Entra ID > Groups > New group).
2. Add the intended users to the group.
3. In PPAC > your environment > Settings > Users + permissions > Security groups, assign the group. Access is immediately restricted to group members only.

> **Warning.** Assign the security group before sharing environment access with any team members. Without it, all licensed tenant users can access the environment.

### 5.2 Add users inside F&O

1. Open F&O at `https://<environment>.operations.dynamics.com`.
2. Navigate to System administration > Users > Users.
3. Click New and search for the user by email.
4. Assign the appropriate security roles (for example System administrator or Accounting manager).
5. Save.

> **Info.** PPAC access and F&O access are separate. A user must be added in both PPAC (via the security group) and inside F&O (via user provisioning) to fully access the system.

### 5.3 Licence configuration inside F&O

1. Navigate to System administration > Setup > License configuration.
2. Enable the licence keys for the modules the customer will use. Finance: General ledger, Accounts payable, Accounts receivable, Fixed assets. Supply chain: Inventory, Procurement, Production.
3. Click Apply. The system will prompt for maintenance mode.

> **Warning.** Enabling maintenance mode locks out all users except system administrators. Schedule this during off-hours.

### 5.4 Legal entity setup

1. Navigate to Organization administration > Organizations > Legal entities > New.
2. Company account: a short code for the customer.
3. Name: the customer's legal name.
4. Country/region and currency: the customer's own.
5. Configure the address, contact information and fiscal year.
6. Save, and switch to the new legal entity using the company picker at the top right.

> **Info.** The default DAT company is a blank shell used for system administration only. All customer data and configuration goes into the new legal entity.

## Developer workflow reference

Day-to-day X++ development in the UDE model.

### The development loop

| Step | Action |
|---|---|
| 1. Open Visual Studio and connect | Tools > Connect to Dataverse, and select the environment |
| 2. Create or open a model | Extensions > Dynamics 365 > Model Management > Create Model (layer: ISV or USR) |
| 3. Create a project | File > New > Project > Finance Operations, and select the model |
| 4. Write X++ code | Add tables, classes, forms and extensions; IntelliSense works against the UDE metadata |
| 5. Build | Extensions > Dynamics 365 > Build Models, and select the model |
| 6. Deploy to the UDE | Extensions > Dynamics 365 > Deploy > Deploy Models to Online Environment |
| 7. Test | In the browser, at the environment's F&O URL |
| 8. Commit | Commit the Metadata folder's changes and push to the repo |

### Explorer reference

| Explorer | Purpose |
|---|---|
| Power Platform Explorer | The Dataverse side: Tables, Choices, Processes, Plug-in Assemblies, Custom APIs. Used for Power Platform and CE development |
| Application Explorer (AOT) | The F&O and X++ side: the full AOT with Tables, Classes, Forms, Enums, Menu Items. Used for all X++ customization work |

### Key file paths

| Path | Purpose |
|---|---|
| `C:\Repos\<project>\Metadata` | Custom X++ model code, committed to the repo |
| `%LOCALAPPDATA%\Microsoft\Dynamics365\<version>\PackagesLocalDirectory` | Microsoft's F&O platform binaries: reference only, not committed |
| `%LOCALAPPDATA%\Microsoft\Dynamics365\<version>\DYNAMICSXREFDB.bak` | Cross-reference database backup |
| `%LOCALAPPDATA%\Microsoft\Dynamics365\Logs` | Visual Studio connection and deployment logs |

## Completion checklist

| Task | Where it stood at hand-over |
|---|---|
| Licence verification | Complete |
| Capacity verification | Complete |
| PPAC environment creation | Complete: India region, Sandbox type |
| F&O deployment (PowerShell) | Complete: DevTools and demo data enabled |
| Environment URLs verified | Complete: Dataverse URL and F&O URL both live |
| Azure DevOps organization, project and repo | Complete: private, Git, Metadata / Projects / Pipelines folders |
| Visual Studio 2022 configured | Complete: all workloads, components and extensions installed |
| SSMS installed and verified | Complete: `(localdb)\MSSQLLocalDB` confirmed working |
| UDE connection established | Complete: Visual Studio connected via Dataverse |
| F&O metadata downloaded | Complete |
| Metadata paths configured | Complete: custom and reference paths set and saved |
| Security group assignment | Pending: to be done before team onboarding |
| F&O user provisioning | Pending: add developers and consultants with roles |
| Licence configuration | Pending: enable module licence keys |
| Legal entity creation | Pending: create the customer's legal entity |
| CI/CD pipelines | Deferred: to be set up when active X++ development begins |
