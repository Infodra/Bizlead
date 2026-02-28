# Signup Flow Visual Guide

## Complete Signup Journey

```
┌─────────────────────────────────────────────────────────────┐
│                   USER VISITS APP                            │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              IS USER LOGGED IN?                              │
└────────────────┬──────────────────────────────────────────────┘
        NO       │       YES
        │        └────────────────────┐
        │                             ▼
        ▼                    [SHOW DASHBOARD]
    [/signup]                
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│   STEP 1: ACCOUNT DETAILS                       [1][2][3]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  First Name: [_____________]                                │
│  Last Name:  [_____________]                                │
│  Email:      [_____________]                                │
│  Password:   [_____________]                                │
│  Confirm:    [_____________]                                │
│                                                              │
│  [Back]                    [Continue to Plans]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│   STEP 2: PLAN SELECTION                       [1][2][3]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   FREE      │  │  STARTER    │  │PROFESSIONAL│         │
│  │   $0/mo     │  │   $29/mo    │  │   $99/mo   │         │
│  │  50 leads   │  │ 500 leads   │  │ 2000 leads │         │
│  │             │  │ ✓ Selected  │  │            │         │
│  │ ✓ Selected  │  │             │  │            │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│       ✓ Basic Info         ✓ All Free features              │
│       ✓ Manual search      ✓ Advanced filters               │
│                            ✓ CSV export                      │
│                                                              │
│  [Back]                    [Continue]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    FREE PLAN         PAID PLAN
        │                 │
        ▼                 ▼
    [SKIP]            ┌─────────────────────────────┐
        │             │   STEP 3: PAYMENT          │
        │             ├─────────────────────────────┤
        │             │                             │
        │             │ Plan: Starter               │
        │             │ Leads: 500/month            │
        │             │ Price: $29/month            │
        │             │                             │
        │             │ Payment Method: [Stripe]    │
        │             │ Card: [________________]    │
        │             │                             │
        │             │ [Back] [Pay Now]            │
        │             │                             │
        │             └─────────────────────────────┘
        │                 │
        │                 ▼ (Payment Processing)
        │             ┌─────────────────────────────┐
        │             │ Processing payment...       │
        │             │ ⟳ Please wait              │
        │             └─────────────────────────────┘
        │                 │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────────────────────────────────────────┐
        │   STEP 4: CONFIRMATION                [1][2][3]    │
        ├─────────────────────────────────────────────────────┤
        │                                                      │
        │                      ✓                               │
        │                   Welcome!                           │
        │                                                      │
        │   Your account has been created successfully.       │
        │   Plan: Starter | Leads: 500/month                 │
        │                                                      │
        │   Redirecting to dashboard...                       │
        │                                                      │
        └─────────────────────────────────────────────────────┘
                 │
                 ▼
        [DASHBOARD - USER LOGGED IN]
```

## Request/Response Flow

```
FRONTEND                          BACKEND
   │                                 │
   ├─ User fills account details     │
   │                                 │
   ├─ User selects plan              │
   │                                 │
   ├─ User completes payment ────────┤
   │  (optional for free)             │
   │                                 │
   └─ POST /api/v1/auth/signup ─────>│
      {                              │
        email: "user@example.com"   │
        password: "securepass123"  │
        first_name: "John"         │
        last_name: "Doe"           │
        plan: "starter"            │
      }                             │
                                    ├─ Validate plan
                                    ├─ Hash password
                                    ├─ Check email exists
                                    ├─ Create User
                                    ├─ Create Subscription
                                    ├─ Generate JWT
                                    │
   <────────────────────────────────┤
   {                                │
     access_token: "jwt_token"    │
     token_type: "bearer"         │
     user: {                       │
       id: "uuid"                 │
       email: "user@example.com" │
       first_name: "John"        │
       last_name: "Doe"          │
       plan: "starter"           │
       created_at: "2026-01-25"  │
     }                            │
     expires_in: 3600            │
   }                              │
   │                              │
   ├─ Store token in localStorage
   ├─ Store user in Zustand store
   └─ Redirect to /dashboard
```

## Feature Access Decision Tree

```
┌─────────────────────────────┐
│  User tries to access       │
│  feature (e.g., CSV export) │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Check usePlanFeatures      │
│  hook for feature access    │
└────────────┬────────────────┘
             │
      ┌──────┴──────┐
      │             │
   YES │             │ NO
      │             │
      ▼             ▼
  [SHOW]      [FEATURE GATE]
  Feature        │
                 ▼
           ┌──────────────────┐
           │ 🔒 Feature       │
           │ Locked on        │
           │ Free Plan        │
           │                  │
           │ [Upgrade ↗]      │
           └──────────────────┘
```

## Plan Features Comparison

```
╔═════════════════╦═══════╦══════════╦══════════════╗
║ Feature         ║ Free  ║ Starter  ║ Professional ║
╠═════════════════╬═══════╬══════════╬══════════════╣
║ Price           ║ $0    ║ $29/mo   ║ $99/mo       ║
╠═════════════════╬═══════╬══════════╬══════════════╣
║ Leads/month     ║ 50    ║ 500      ║ 2000         ║
╠═════════════════╬═══════╬══════════╬══════════════╣
║ Basic Info      ║ ✓     ║ ✓        ║ ✓            ║
║ Advanced Filter ║ ✗     ║ ✓        ║ ✓            ║
║ CSV Export      ║ ✗     ║ ✓        ║ ✓            ║
║ Analytics       ║ ✗     ║ ✗        ║ ✓            ║
║ API Access      ║ ✗     ║ ✗        ║ ✓            ║
║ Custom Segments ║ ✗     ║ ✗        ║ ✓            ║
╚═════════════════╩═══════╩══════════╩══════════════╝
```

## Component Interaction

```
┌──────────────────────────────────────────────────┐
│           SignupPage Component                    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 1: AccountForm                      │    │
│  │ - Email, Password, Name                 │    │
│  │ - Validation                            │    │
│  │ - Navigate to Step 2                    │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 2: PlanSelector                    │    │
│  │ - Show 3 plans                          │    │
│  │ - Select plan                           │    │
│  │ - Navigate to Step 3 (or skip payment)  │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 3: PaymentProcessor                │    │
│  │ - Display amount                        │    │
│  │ - Process payment                       │    │
│  │ - Navigate to Step 4                    │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
│  ┌─────────────────────────────────────────┐    │
│  │ Step 4: Confirmation                    │    │
│  │ - Show success message                  │    │
│  │ - Redirect to dashboard                 │    │
│  └─────────────────────────────────────────┘    │
│                                                   │
└──────────────────────────────────────────────────┘
         │
         │ Uses
         ▼
    useAuthStore()
    - login(token, user)
    - Token persisted in localStorage
    - User includes plan info
```

## Payment Validation Timeline

```
Timeline                     Status          Action
────────────────────────────────────────────────────
Signup initiated             pending         Create user with pending status
                                              
Payment processing           processing      Backend awaits Stripe webhook
                                              
Payment webhook received     completed       Update user.payment_status
                                              
User login attempt           ✓ verified      Grant access with plan features
                                              
Feature access               enforced        Use usePlanFeatures hook
                                              
Subscription renewal         check date      Trigger renewal if expired
```

## Error Handling Flow

```
User Action → Input Validation → API Call → Backend Check → Response
                     │                            │
                  Invalid?                   Database error?
                     │                            │
                  ▼                              ▼
              Show Error                    Show Error
              Toast                         Toast
              (Stay on form)                (Retry)
                                             
Example Errors:
─────────────
"Email already registered"
"Invalid plan selected"
"Password too short"
"Payment failed"
"Subscription not found"
```

This visual guide shows the complete signup flow from user perspective through backend processing.
