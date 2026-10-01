---
title: Enabling Microsoft Copilot in Dynamics 365 Finance and Operations
subtitle: Step-by-step process record · Commercial cloud
slug: copilot-enablement-fo
---

## Overview

This document records the exact steps taken to enable Microsoft Copilot capabilities in a Dynamics 365 Finance and Operations commercial cloud environment. The process covers Power Platform prerequisites, tenant-level settings, app installations, and in-app feature management.

## Environment details and starting conditions

| Parameter | Value |
|---|---|
| Environment | Your Dynamics 365 F&O environment |
| Cloud type | Commercial (standard) |
| Copilot features targeted | Sidecar (chat pane) and AI summaries |
| Power Platform integration | Must already be enabled in Lifecycle Services |

## Phase 1: Power Platform admin center

All steps in this phase were performed in the Power Platform admin center (admin.powerplatform.microsoft.com).

### Step 1.1 · Verify and update the Dynamics 365 Copilot apps

Navigate to: Power Platform admin center > Environments > [Your Environment] > Resources > Dynamics 365 apps. Search for "Copilot".

| Item | Status | Notes |
|---|---|---|
| Business Copilot AI | Installed | No action needed |
| Copilot in Microsoft Dynamics 365 Finance | Installed | No action needed |
| Copilot in Microsoft Dynamics 365 Supply Chain Management | Updated | Had "Update available"; updated via the ... menu |
| FnOCopilot | Installed | No action needed |
| Power Apps App Copilot App | Installed | No action needed |

The SCM Copilot app update was triggered and completed within approximately 20 minutes.

### Step 1.2 · Enable "Publish Copilots with AI features" (tenant setting)

Navigate to: Power Platform admin center > Settings (left navigation, not the environment's settings).

1. Locate the row named "Publish Copilots with AI features".
2. Click it to open the side panel.
3. Toggle to Enabled.
4. Click Save.

Result: the Value column shows "Enabled" in the tenant settings list.

### Step 1.3 · Enable Bing Search (required for the sidecar)

On the same tenant settings page:

1. Locate the row named "Support Bing search solutions".
2. Click it and enable it.
3. Click Save.

Result: the Value column shows "Enabled". This is required for the Copilot sidecar to provide generative answers.

## Phase 2: Feature management in Finance and Operations

Navigate to: Finance and Operations > System administration > Feature management. Switch to the "All" tab to search across all features.

### Step 2.1 · Collections coordinator summary

Search term used: "Collections".

| Feature | Status | Notes |
|---|---|---|
| Collections coordinator summary | Already enabled | On by default in this version |
| Collections coordinator workspace | Already enabled | On by default in this version |

No action was needed. This feature was already active. It displays an AI-generated summary and draft email in the Collections coordinator workspace, including payment history, outstanding debt, and revenue data.

### Step 2.2 · Customer page summary

Search term used: "Customer".

| Feature | Status | Notes |
|---|---|---|
| Customer page summary | Already enabled | On by default in this version |

No action was needed. This feature was already active. It shows an AI-generated summary on customer records using invoices, payments, sales orders, overdue lines, and more.

### Step 2.3 · Generative help and guidance (sidecar)

Search terms tried: "Generative help", "AI summaries", "Copilot".

Result: no results in Feature management for any of these terms. This confirmed that the sidecar feature is controlled entirely by the FnOCopilot app installed in Power Platform (step 1.1), not by a Feature management toggle. No action was required here.

### Step 2.4 · Immersive Home (optional)

Search term used: "Immersive".

| Feature | Status | Notes |
|---|---|---|
| Immersive Home | Available, not yet enabled | Optional AI-first landing page |

This feature was found but not enabled during this session. It is optional and can be enabled at any time by clicking "Enable now" on the Immersive Home row in Feature management. It transforms the F&O home page into a modern AI-first layout.

## Phase 3: Verification

After completing all Power Platform steps, the F&O environment was opened to verify Copilot was live.

### Copilot sidecar: verified working

- Opened the F&O home page.
- The Copilot chat pane opened automatically on the right side of the screen.
- The pane displayed: "Have a question about this app? Ask Copilot."
- A chat input box was present and functional.
- The footer confirmed Bing Search is active: "This Copilot feature uses Bing Search".

### AI summaries: confirmed active

- Collections coordinator summary: active and on by default.
- Customer page summary: active and on by default.

## Final status summary

| Item | Status | Notes |
|---|---|---|
| All 5 Copilot apps in Power Platform | Installed | SCM app updated during this session |
| Publish Copilots with AI features | Enabled | Tenant-level setting saved |
| Bing Search support | Enabled | Required for sidecar generative answers |
| Copilot sidecar (chat pane) | Live | Verified working in F&O |
| Collections coordinator summary | Active | On by default in this version |
| Customer page summary | Active | On by default in this version |
| Immersive Home | Optional, pending | Available in Feature management to enable |

## Quick reference: where to find Copilot features

| Feature | Location in F&O |
|---|---|
| Copilot sidecar (chat) | Copilot icon in the top right of any F&O page |
| Collections coordinator summary | Accounts receivable > Collections > Collections coordinator workspace |
| Customer page summary | Any customer record in Accounts receivable |
| Immersive Home (if enabled) | Replaces the standard F&O home page |

## Notes

- Power Platform integration must be enabled in Lifecycle Services before starting this process.
- This process applies to standard commercial cloud environments. Developer environments deployed through Lifecycle Services are not supported.
- Copilot features do not have Feature management toggles in current environment builds; they are controlled through Power Platform app installation.
- The SCM Copilot app update typically takes approximately 20 minutes to complete.
- Cross-region data movement configuration may or may not be needed depending on your Dataverse region. Enabling Bing Search is sufficient for most regions.
