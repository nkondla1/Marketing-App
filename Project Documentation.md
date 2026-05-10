# Project Documentation — CareConnect Healthcare Management System

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Objectives](#2-objectives)
- [3. User Roles](#3-user-roles)
- [4. Functional Requirements](#4-functional-requirements)
  - [4.1 Dashboard](#41-dashboard)
  - [4.2 Patient Management](#42-patient-management)
  - [4.3 Appointment Management](#43-appointment-management)
  - [4.4 Medical Records](#44-medical-records)
  - [4.5 Prescriptions](#45-prescriptions)
  - [4.6 Lab Results](#46-lab-results)
  - [4.7 Billing & Invoicing](#47-billing--invoicing)
  - [4.8 Inventory Management](#48-inventory-management)
  - [4.9 Staff Management](#49-staff-management)
  - [4.10 Notifications](#410-notifications)
- [5. Non-Functional Requirements](#5-non-functional-requirements)
- [6. Data Requirements](#6-data-requirements)
- [7. UI/UX Requirements](#7-uiux-requirements)
- [8. Out of Scope](#8-out-of-scope)
- [9. Assumptions & Constraints](#9-assumptions--constraints)
- [10. Future Enhancements](#10-future-enhancements)

---

## 1. Project Overview

**Product Name:** CareConnect  
**Type:** Healthcare Patient Management System (Single-Page Web Application)  
**Target Users:** Clinical staff at small-to-medium medical practices — doctors, nurses, receptionists, lab technicians, pharmacists, and administrators.

CareConnect provides a unified digital workspace for managing the full lifecycle of patient care: from scheduling appointments and maintaining medical records, to handling prescriptions, lab results, billing, and medical supply inventory. The system replaces disconnected paper-based or siloed workflows with a single, role-aware interface accessible from any modern browser.

---

## 2. Objectives

| # | Objective |
|---|---|
| O-1 | Reduce appointment scheduling errors by enforcing conflict detection across doctors and patients. |
| O-2 | Centralize patient health records so any authorized staff member can access up-to-date information instantly. |
| O-3 | Streamline billing by digitizing invoice creation, payment tracking, and insurance claim management. |
| O-4 | Prevent medication and supply stockouts by tracking inventory levels against configurable minimum thresholds. |
| O-5 | Improve patient communication by surfacing timely appointment reminders and clinical alerts. |
| O-6 | Provide management with at-a-glance KPI metrics and trend charts without requiring a separate reporting tool. |

---

## 3. User Roles

| Role | Description | Key Permissions |
|---|---|---|
| **Doctor** | Licensed physician assigned to patients | View/edit own patients, create medical records, write prescriptions, update appointment status |
| **Nurse** | Clinical support staff | View patient records, record vital signs, manage lab results, send appointment reminders |
| **Receptionist** | Front-desk staff | Schedule/cancel appointments, register patients, process payments |
| **Lab Technician** | Diagnostic specialist | Add and update lab results, manage related inventory items |
| **Pharmacist** | Medication specialist | View and fulfill prescriptions, manage medication inventory |
| **Admin** | Practice administrator | Full access to all modules including staff management and financial reports |

> **Current state:** Role-based access control is planned but not yet implemented. All routes are accessible to any user.

---

## 4. Functional Requirements

### 4.1 Dashboard

**Purpose:** Provide an at-a-glance operational overview for clinical and administrative staff.

| ID | Requirement | Status |
|---|---|---|
| D-1 | Display the count of appointments scheduled for today. | Implemented |
| D-2 | Display the total number of registered patients. | Implemented |
| D-3 | Display the count of active staff members. | Implemented |
| D-4 | Display the count of pending invoices. | Implemented |
| D-5 | Show a pie chart breaking down appointments by status (Scheduled, In Progress, Completed, Cancelled, No-Show). | Implemented |
| D-6 | Show a bar chart of appointment volume by staff department/specialty. | Implemented |
| D-7 | List the most recent appointments from the last 7 days with patient name, doctor, and status. | Implemented |
| D-8 | Show the count of unread notifications with a link to the notification panel. | Implemented |

---

### 4.2 Patient Management

**Purpose:** Maintain a complete and accurate registry of all patients.

#### 4.2.1 Patient List

| ID | Requirement | Status |
|---|---|---|
| PM-1 | Display all registered patients in a tabular list. | Implemented |
| PM-2 | Allow searching patients by name, email address, or phone number. | Implemented |
| PM-3 | Allow filtering patients by gender (Male, Female, Other). | Implemented |
| PM-4 | Allow filtering patients by blood type (A+, A-, B+, B-, AB+, AB-, O+, O-). | Implemented |
| PM-5 | Allow sorting the list by patient name (A–Z), registration date, or age. | Implemented |
| PM-6 | Each row links to the patient's full detail page. | Implemented |
| PM-7 | Provide a button to register a new patient. | Planned |

#### 4.2.2 Patient Detail

| ID | Requirement | Status |
|---|---|---|
| PM-8 | Display all personal information: name, date of birth, gender, blood type, contact details, address. | Implemented |
| PM-9 | Display emergency contact details (name, relationship, phone). | Implemented |
| PM-10 | Display insurance information (provider, policy number, group number, expiry). | Implemented |
| PM-11 | Display the patient's full medical history: allergies, chronic conditions, previous surgeries, family history. | Implemented |
| PM-12 | Display the assigned primary doctor's name. | Implemented |
| PM-13 | List all medical records associated with the patient, ordered by date. | Implemented |
| PM-14 | List all appointments associated with the patient. | Implemented |
| PM-15 | List all prescriptions associated with the patient. | Implemented |
| PM-16 | Provide a link to generate a printable patient health report. | Implemented |

#### 4.2.3 Patient Report

| ID | Requirement | Status |
|---|---|---|
| PM-17 | Generate a printable summary of the patient's full health record. | Implemented |
| PM-18 | Include personal info, medical history, vital signs, prescriptions, and appointments in the report. | Implemented |
| PM-19 | Report must be optimized for print with non-essential UI elements hidden. | Implemented |
| PM-20 | Provide a one-click Print button. | Implemented |
| PM-21 | Provide an Export button (PDF export). | Planned |

#### 4.2.4 Patient Registration

| ID | Requirement | Status |
|---|---|---|
| PM-22 | Provide a form to register a new patient with all required fields. | Planned |
| PM-23 | Validate required fields before allowing submission. | Planned |
| PM-24 | Allow editing an existing patient's information. | Planned |
| PM-25 | Allow deleting a patient record (with confirmation prompt). | Planned |

---

### 4.3 Appointment Management

**Purpose:** Schedule, track, and manage the full lifecycle of patient appointments.

#### 4.3.1 Appointment List

| ID | Requirement | Status |
|---|---|---|
| AP-1 | Display all appointments in a tabular list. | Implemented |
| AP-2 | Allow filtering appointments by status (All, Scheduled, In Progress, Completed, Cancelled, No-Show). | Implemented |
| AP-3 | Allow searching appointments by patient name, doctor name, or appointment reason. | Implemented |
| AP-4 | Display status with color-coded badges for quick scanning. | Implemented |
| AP-5 | Allow inline status updates directly from the list view. | Implemented |
| AP-6 | Provide a link to create a new appointment. | Implemented |

#### 4.3.2 Appointment Calendar

| ID | Requirement | Status |
|---|---|---|
| AP-7 | Display appointments on a monthly calendar grid. | Implemented |
| AP-8 | Allow navigating to previous and next months. | Implemented |
| AP-9 | Allow clicking a day to view all appointments for that date in a sidebar. | Implemented |
| AP-10 | Show appointment count indicators on calendar days. | Implemented |
| AP-11 | Color-code appointments on the calendar by status. | Implemented |

#### 4.3.3 Appointment Form (Create / Edit)

| ID | Requirement | Status |
|---|---|---|
| AP-12 | Allow selecting a patient from the registered patient list. | Implemented |
| AP-13 | Allow selecting a doctor from staff with the Doctor role. | Implemented |
| AP-14 | Allow setting appointment date, time, duration (in minutes), type, and reason. | Implemented |
| AP-15 | Allow setting an optional room assignment and notes. | Implemented |
| AP-16 | Detect and block scheduling if the selected doctor already has an overlapping appointment. | Implemented |
| AP-17 | Detect and block scheduling if the selected patient already has an overlapping appointment. | Implemented |
| AP-18 | Support edit mode — pre-populate the form with existing appointment data when editing. | Implemented |
| AP-19 | Validate all required fields before allowing submission. | Implemented |

#### 4.3.4 Appointment Scheduler

| ID | Requirement | Status |
|---|---|---|
| AP-20 | Allow selecting a doctor and date to view available time slots. | Implemented |
| AP-21 | Generate 30-minute time slots between 9:00 AM and 5:00 PM. | Implemented |
| AP-22 | Mark slots as unavailable when an existing appointment overlaps them. | Implemented |
| AP-23 | Allow selecting an available slot to pre-populate a new appointment form. | Implemented |

#### 4.3.5 Appointment Reminders

| ID | Requirement | Status |
|---|---|---|
| AP-24 | List upcoming appointments within a configurable lookahead window (1, 3, 7, 14, or 30 days). | Implemented |
| AP-25 | Allow sending a reminder notification for a single appointment. | Implemented |
| AP-26 | Allow sending bulk reminders for all of today's appointments at once. | Implemented |
| AP-27 | Reminder delivery creates an in-app notification entry. | Implemented |
| AP-28 | Label appointments as "Today," "Tomorrow," or by specific date. | Implemented |

#### 4.3.6 Appointment Detail

| ID | Requirement | Status |
|---|---|---|
| AP-29 | Display all appointment fields in a read-only detail view. | Implemented |
| AP-30 | Allow changing appointment status from the detail view. | Implemented |
| AP-31 | Provide Edit and Delete buttons with a confirmation step for deletion. | Implemented |

---

### 4.4 Medical Records

**Purpose:** Document clinical encounters including diagnosis, treatment plans, and vital signs.

| ID | Requirement | Status |
|---|---|---|
| MR-1 | Display a searchable list of all medical records. | Planned |
| MR-2 | Allow creating a new medical record linked to a patient, doctor, and optionally an appointment. | Planned |
| MR-3 | Record fields: date, diagnosis, symptoms, treatment plan, notes, follow-up date. | Planned |
| MR-4 | Capture vital signs: blood pressure, heart rate, temperature, weight, height, O₂ saturation, respiratory rate. | Planned |
| MR-5 | Link associated lab results and prescriptions to a medical record. | Planned |
| MR-6 | Allow editing an existing medical record. | Planned |
| MR-7 | Display medical records within the Patient Detail view. | Implemented |

---

### 4.5 Prescriptions

**Purpose:** Manage medication orders from creation through fulfillment.

| ID | Requirement | Status |
|---|---|---|
| RX-1 | Display a list of all prescriptions with patient, medication, and status. | Planned |
| RX-2 | Allow creating a prescription with: drug name, dosage, frequency, duration, refills allowed, notes. | Planned |
| RX-3 | Track refill usage (refills used vs. refills allowed). | Planned |
| RX-4 | Track prescription status: Active, Completed, Cancelled, On Hold. | Planned |
| RX-5 | Track prescription and expiry dates. | Planned |
| RX-6 | Display prescriptions within the Patient Detail view. | Implemented |
| RX-7 | Allow updating prescription status (e.g., marking as completed or cancelled). | Planned |

---

### 4.6 Lab Results

**Purpose:** Record and review diagnostic test results.

| ID | Requirement | Status |
|---|---|---|
| LR-1 | Display all lab results extracted from medical records. | Implemented |
| LR-2 | Allow searching results by test name or result value. | Implemented |
| LR-3 | Allow filtering results by status: Normal, Abnormal, Critical, Pending. | Implemented |
| LR-4 | Display status with color-coded badges (green/yellow/red/blue). | Implemented |
| LR-5 | Show reference range and unit for each result. | Implemented |
| LR-6 | Allow adding a new lab result linked to a medical record. | Planned |

---

### 4.7 Billing & Invoicing

**Purpose:** Create, track, and manage patient invoices and insurance claims.

| ID | Requirement | Status |
|---|---|---|
| BI-1 | Display a list of all invoices with patient name, total, status, and due date. | Implemented |
| BI-2 | Allow creating a new invoice with one or more line items (service description, quantity, unit price). | Implemented |
| BI-3 | Automatically calculate subtotal, apply tax percentage, and apply a flat discount. | Implemented |
| BI-4 | Track the amount paid and derive the outstanding balance. | Implemented |
| BI-5 | Support invoice statuses: Pending, Paid, Overdue, Insurance Claim, Partially Paid, Waived. | Implemented |
| BI-6 | Allow attaching insurance claim details (provider, claim number, claimed amount, claim status). | Implemented |
| BI-7 | Allow editing an existing invoice. | Implemented |
| BI-8 | Allow deleting an invoice. | Implemented |
| BI-9 | Display status with color-coded badges. | Implemented |
| BI-10 | Export invoices as PDF for patient billing. | Planned |

---

### 4.8 Inventory Management

**Purpose:** Track medical supplies, equipment, and medications to prevent stockouts and overstocking.

| ID | Requirement | Status |
|---|---|---|
| IN-1 | Display all inventory items in a searchable list. | Implemented |
| IN-2 | Categorize items as: Medication, Medical Supply, Equipment, Consumable. | Implemented |
| IN-3 | Track current quantity, unit of measure, minimum stock threshold, and maximum capacity. | Implemented |
| IN-4 | Track cost price and selling price per item. | Implemented |
| IN-5 | Track supplier, batch number, expiry date, and storage location. | Implemented |
| IN-6 | Flag items as low stock when quantity falls below the minimum threshold. | Implemented |
| IN-7 | Flag items as overstocked when quantity exceeds the maximum capacity. | Implemented |
| IN-8 | Allow Stock In and Stock Out transactions, updating quantity automatically. | Implemented |
| IN-9 | Allow manual stock adjustments and return transactions. | Implemented |
| IN-10 | Maintain a full transaction history per inventory item. | Implemented |
| IN-11 | Allow adding, editing, and deleting inventory items. | Implemented |

---

### 4.9 Staff Management

**Purpose:** Maintain a directory of clinical and administrative personnel.

| ID | Requirement | Status |
|---|---|---|
| ST-1 | Display a list of all staff members with name, role, and specialty. | Planned |
| ST-2 | Support staff roles: Doctor, Nurse, Receptionist, Lab Technician, Pharmacist, Admin. | Planned |
| ST-3 | Store staff details: license number, qualifications, biography, contact info. | Planned |
| ST-4 | Store and display each staff member's weekly schedule. | Planned |
| ST-5 | Allow adding, editing, and deactivating staff records. | Planned |
| ST-6 | Filter available doctors in appointment and scheduler views (already uses staff store). | Implemented |

---

### 4.10 Notifications

**Purpose:** Surface time-sensitive clinical and operational alerts to staff.

| ID | Requirement | Status |
|---|---|---|
| NT-1 | Display a notification bell icon in the top navigation bar. | Implemented |
| NT-2 | Show a badge with the count of unread notifications on the bell icon. | Implemented |
| NT-3 | Display a dropdown list of all notifications when the bell is clicked. | Implemented |
| NT-4 | Support notification types: appointment, prescription, lab, billing, general. | Implemented |
| NT-5 | Allow marking a single notification as read. | Implemented |
| NT-6 | Allow clearing all notifications at once. | Implemented |
| NT-7 | Show an empty state message when there are no notifications. | Implemented |
| NT-8 | Appointment reminders automatically create notification entries. | Implemented |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NF-1 | Performance | The application must load and become interactive in under 3 seconds on a standard broadband connection. |
| NF-2 | Responsiveness | All pages must be usable on desktop screens (1024px and above). Mobile responsiveness is a future enhancement. |
| NF-3 | Persistence | All application state must survive page refresh via localStorage persistence. |
| NF-4 | Type Safety | All domain data must be fully typed in TypeScript. No use of `any` type in production code. |
| NF-5 | Browser Support | The application must function correctly in the latest versions of Chrome, Firefox, Safari, and Edge. |
| NF-6 | Print Support | Patient health reports must render correctly when printed using the browser's native print dialog. |
| NF-7 | Accessibility | Interactive elements must have appropriate ARIA labels and keyboard navigation support. |
| NF-8 | Data Integrity | The appointment conflict detection must prevent double-booking a doctor or patient in overlapping time slots. |
| NF-9 | Maintainability | All domain types must be defined in a single file (`src/types/index.ts`) and all state mutations must go through the Zustand store. |

---

## 6. Data Requirements

### Mandatory Fields by Entity

| Entity | Required Fields |
|---|---|
| Patient | First name, last name, date of birth, gender, blood type, email, phone, address |
| Appointment | Patient, doctor, date, time, duration, type, reason, status |
| Medical Record | Patient, doctor, date, diagnosis, treatment plan |
| Prescription | Patient, doctor, drug name, dosage, frequency, start date, status |
| Lab Result | Test name, result value, unit, date, status |
| Invoice | Patient, date, due date, at least one line item, status |
| Inventory Item | Name, category, quantity, unit, minimum stock, cost price, supplier |
| Staff | First name, last name, role, email, phone |
| Notification | Type, title, message, timestamp |

### Data Retention

- No data is deleted on logout (localStorage persists across sessions).
- Soft delete is preferred over hard delete for patient and medical records to preserve audit history.

### Sample / Seed Data

The store is pre-seeded with demo data for development and demonstration purposes:
- 3 patients, 4 staff members, 3 appointments, 2 medical records, 3 prescriptions, 2 invoices, 2 notifications.

---

## 7. UI/UX Requirements

| ID | Requirement |
|---|---|
| UX-1 | The application must have a persistent top navigation bar accessible from every page. |
| UX-2 | The active navigation item must be visually distinguished from inactive items. |
| UX-3 | All status values (appointment, invoice, lab result) must use consistent color coding across the entire application. |
| UX-4 | Destructive actions (delete, cancel) must display a confirmation prompt before executing. |
| UX-5 | Forms must validate all required fields and display inline error messages before submission. |
| UX-6 | Empty states (no patients, no appointments, etc.) must display a descriptive message and a call-to-action. |
| UX-7 | Search fields must filter results in real time as the user types (no submit button required). |
| UX-8 | Tables with more than 10 rows should support pagination or scrolling without breaking the page layout. |
| UX-9 | The notification dropdown must close when the user clicks outside it. |
| UX-10 | All buttons must have visible hover and focus states for accessibility. |

---

## 8. Out of Scope

The following items are explicitly not part of the current version:

- **Authentication & authorization** — no login, session management, or role-based route protection.
- **Backend API** — all data is stored in `localStorage`. No network calls to a server.
- **Real-time collaboration** — no WebSocket or live updates between multiple users.
- **Email / SMS delivery** — appointment reminders are in-app only; no external message delivery.
- **Telemedicine / video** — no video consultation or remote care features.
- **Mobile / responsive layout** — the UI is optimized for desktop (≥ 1024px) only.
- **Audit logging** — no tamper-evident record of who changed what and when.
- **HIPAA compliance** — the current architecture (plaintext localStorage) does not meet HIPAA technical safeguard requirements.
- **PDF generation** — export buttons exist in the UI but PDF generation is not yet wired up.
- **Reporting & analytics exports** — dashboard charts are view-only; no CSV/Excel export.

---

## 9. Assumptions & Constraints

| # | Assumption / Constraint |
|---|---|
| A-1 | A single practice location is assumed. Multi-site or multi-tenant support is out of scope. |
| A-2 | All users share the same browser session and the same localStorage instance (no user isolation). |
| A-3 | Appointment slots are 30 minutes minimum; the scheduler generates 30-minute intervals from 9 AM to 5 PM. |
| A-4 | Client-side ID generation (`Math.random`) is sufficient for the current frontend-only architecture. |
| A-5 | Date and time values are stored as strings (ISO 8601 for dates, `HH:mm` for times) and formatted for display using `date-fns`. |
| A-6 | The application is deployed as a static site (no Node.js server runtime required). |
| A-7 | All monetary values are stored as numbers in USD with no multi-currency support. |

---

## 10. Future Enhancements

### Phase 2 — Complete Core Modules

- Implement the Medical Records full UI (MR-1 through MR-6).
- Implement the Prescriptions manager (RX-1 through RX-7).
- Implement the Staff Management directory (ST-1 through ST-5).
- Implement the Patient Registration form (PM-22 through PM-25).

### Phase 3 — Backend Integration

- Replace Zustand localStorage store with REST API calls (or GraphQL).
- Add JWT-based authentication with role-based route protection.
- Server-side ID generation (UUID v4).
- Encrypted data at rest and in transit (HTTPS, AES-256).

### Phase 4 — Compliance & Security

- HIPAA technical safeguard compliance: access controls, audit logs, automatic session timeout.
- Role-based access control enforced on both client and server.
- Tamper-evident audit trail for all patient record modifications.

### Phase 5 — Advanced Features

- Real-time appointment updates via WebSockets.
- Email and SMS appointment reminders via a notification service (SendGrid, Twilio).
- PDF generation for invoices and patient reports.
- CSV/Excel export for billing and inventory reports.
- Mobile-responsive layout.
- Telemedicine module with embedded video consultations.
- HL7 FHIR R4 compatibility for interoperability with EHR systems.
