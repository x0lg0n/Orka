# Authentication Experience

Document ID: UI-000
Priority: P0
Status: MVP

---

# Purpose

Authentication allows users to securely access Orka.

The experience should be fast, trustworthy, and minimal.

Users should be able to sign in within 30 seconds.

---

# Supported Methods

Primary

✓ Continue with Google

✓ Continue with Email

Secondary

✓ Continue with Freighter Wallet

---

# Routes

/login

/signup

/forgot-password

/verify-email

/reset-password

---

# Design Language

Reference

Stripe

Linear

Clerk

Supabase Auth

Do NOT design like

Crypto wallets

Exchange login pages

---

# Layout

Desktop

Two-column layout.

--------------------------------------------------------

Left (45%)

Brand Section

Right (55%)

Authentication Card

--------------------------------------------------------

Mobile

Single centered card.

---

# Left Panel

Background

Dark Navy (#0F172A)

Logo

ORKA

Headline

The Financial OS for Modern Service Businesses

Description

Manage proposals, contracts, escrow and payments in one place.

Footer

Powered by AI

Built on Stellar

Optional Illustration

Workspace mockup

Gradient

Abstract blobs

Nothing flashy

---

# Right Panel

Centered Card

Width

480px

Padding

32px

Radius

24px

Background

White

Border

Gray-200

---

# Login Screen

Header

Welcome back 👋

Subtitle

Sign in to continue to your workspace.

Buttons

Continue with Google

Continue with Freighter

Divider

OR

Email

Password

Forgot Password

Primary Button

Sign In

Footer

Don't have an account?

Create one

---

# Signup Screen

Header

Create your account

Subtitle

Start managing projects on Orka.

Buttons

Continue with Google

Continue with Freighter

Divider

OR

Fields

Full Name

Email

Password

Confirm Password

Checkbox

Agree to Terms

Primary Button

Create Account

Footer

Already have an account?

Sign In

---

# Password Rules

Minimum

8 characters

Contains

Uppercase

Lowercase

Number

Special character

Live validation

Yes

---

# Forgot Password

Email

↓

Send Link

↓

Confirmation

↓

Reset Password

↓

Success

---

# Email Verification

Create Account

↓

Verification Email

↓

Verify

↓

Workspace Selector

---

# Google Login

Click

↓

OAuth

↓

Profile Created (if new)

↓

Workspace Selector

---

# Freighter Login

Click

↓

Connect Wallet

↓

Wallet Approved

↓

Existing User?

YES

↓

Workspace Selector

NO

↓

Complete Profile

↓

Workspace Selector

---

# Empty State

No Workspaces

↓

Create Workspace

---

# Components

shadcn/ui

Card

Button

Input

Label

Checkbox

Separator

Alert

Password Input

Toast

Dialog

Skeleton

---

# Loading States

Signing In...

Creating Account...

Connecting Wallet...

Verifying Email...

---

# Error States

Invalid Email

Wrong Password

Email Already Exists

Wallet Rejected

Network Error

---

# Success States

Account Created

Signed In

Password Reset

Email Verified

---

# Accessibility

Keyboard Navigation

ARIA Labels

Visible Focus Ring

Minimum Touch Target 44px

---

# Animation

Card Fade

150ms

Button Hover

200ms

Input Focus

150ms

No heavy animations.

---

# Product Decisions

Users authenticate before selecting a workspace.

Authentication is independent of Stellar.

Wallet connection is optional.

Every user has an Orka account.

One user can belong to multiple workspaces.