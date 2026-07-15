# Workspace Experience

Document ID: UI-001
Screen Type: Primary
Status: MVP
Priority: P0
Owner: Orka Team

---

# Purpose

The Workspace is the first authenticated experience inside Orka.

Every freelancer or agency works inside one or more Workspaces.

A Workspace represents a business.

Examples:

Acme Studio

Oreenza

Personal Freelance

Design Department

Every Project, Client, Invoice, Payment and Analytics record belongs to exactly one Workspace.

Users never work outside a Workspace.

---

# User Goal

Immediately after logging in, the user should be able to:

• Select an existing Workspace

or

• Create a new Workspace

in less than 30 seconds.

The Workspace screen should feel similar to Stripe, Linear and Supabase.

Fast.

Minimal.

Professional.

---

# User Flow

Landing

↓

Login

↓

Workspace Selector

↓

Select Workspace

↓

Workspace Dashboard

OR

↓

Create Workspace

↓

Workspace Dashboard

---

# Routes

/workspaces

Workspace Selector

/workspaces/new

Create Workspace

/workspaces/:workspaceId

Open Workspace

---

# Page Structure

The Workspace experience contains three pages.

1.

Workspace Selector

2.

Create Workspace

3.

Workspace Loading

---

# Design Language

Framework

shadcn/ui

Design Style

Enterprise SaaS

Reference Products

• Linear

• Stripe Dashboard

• Mercury

• Vercel

• Supabase Organizations

Do NOT use

Crypto wallet design

Glassmorphism

Heavy gradients

Neon UI

Complex illustrations

---

# Layout

Desktop

Centered container

Maximum width

1200px

Vertical spacing

32px

Card radius

16px

Card padding

24px

Gap

24px

Background

Light Gray (#F8FAFC)

Cards

White

Border

Gray-200

Shadow

Very subtle

---

# Top Navigation

Logo

ORKA

↓

Spacer

↓

User Avatar

↓

Logout

Minimal.

---

================================================

SCREEN 1

Workspace Selector

================================================

Purpose

Allow users to switch businesses.

---

Header

Title

Choose a Workspace

Subtitle

Select a workspace to continue or create a new one.

---

Actions

Search

Create Workspace Button

---

Workspace Grid

Responsive

Desktop

3 Columns

Tablet

2 Columns

Mobile

1 Column

---

Workspace Card

Contains

Workspace Logo

Workspace Name

Workspace Type

Owner Badge

Number of Projects

Number of Clients

Members

Last Active

Hover State

Border turns Purple

Cursor Pointer

Soft shadow

Click

Open Workspace

---

Example

────────────────────────

🟣

Oreenza

Agency

12 Projects

5 Clients

Owner

Last Active Today

────────────────────────

---

Footer

Can't find your workspace?

Create New Workspace

---

================================================

SCREEN 2

Create Workspace

================================================

Purpose

Create a new business.

---

Card Width

640px

Centered

---

Header

Title

Create Workspace

Subtitle

Your workspace is where you manage projects, clients and payments.

---

Form

Workspace Name

Required

Placeholder

Acme Studio

---

Workspace Type

Dropdown

Options

Freelancer

Agency

Studio

Consultancy

Startup

---

Workspace Logo

Optional

Upload

or

Generate Initial

---

Workspace Slug

Auto Generated

Editable

Example

orka.io/acme

---

Primary Button

Create Workspace

Secondary

Cancel

---

Success

Workspace Created

↓

Automatically redirect

↓

Workspace Dashboard

---

================================================

SCREEN 3

Workspace Loading

================================================

Purpose

Smooth transition.

---

Show

Logo

Workspace Name

Loading Spinner

Text

Preparing your workspace...

Duration

Less than one second

---

Then

↓

Dashboard

---

# Empty State

If no Workspace exists

Show illustration

Title

Welcome to Orka

Subtitle

Let's create your first workspace.

Button

Create Workspace

---

# Search

Search should filter

Workspace Name

Workspace Type

Owner

---

# Permissions

Owner

Can Edit

Can Delete

Can Invite

Admin

Can Edit

Can Invite

Cannot Delete

Member

Can Open

Cannot Edit

Viewer (Future)

Read Only

---

# Component List

shadcn/ui

Card

Button

Avatar

Dropdown Menu

Input

Badge

Dialog

Scroll Area

Skeleton

Separator

Command

Hover Card

Tooltip

Alert Dialog

---

# Keyboard Shortcuts

Future

⌘K

Workspace Switcher

Arrow Keys

Navigate

Enter

Open

Esc

Close

---

# Mobile Behaviour

Workspace cards become full width.

Search remains sticky.

Create Workspace button fixed at bottom.

---

# Loading States

Skeleton Cards

Skeleton Header

Skeleton Avatar

---

# Error States

Unable to load Workspace

Retry Button

Network Error

Workspace not found

Permission denied

---

# Success States

Workspace Created

Workspace Switched

Workspace Updated

---

# Accessibility

Keyboard navigation

Visible focus states

ARIA labels

Screen reader friendly

Minimum touch targets

44px

---

# Animation

Duration

200ms

Hover

Scale 1.01

Shadow Increase

Fade

150ms

Nothing flashy.

---

# Product Decisions

Workspace represents a business.

Projects belong to Workspaces.

Users may belong to multiple Workspaces.

Clients never create Workspaces.

Workspace selection always occurs before Dashboard.

Workspace switching should require one click.

---

# Future

Workspace Branding

Custom Domains

Billing

API Keys

Multiple Teams

Workspace Templates

Marketplace

Enterprise Permissions

Audit Logs

SSO
