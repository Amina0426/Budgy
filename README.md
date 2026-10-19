# Budgy — Personal Finance Tracker

<p align="center">
  <strong>Track your money. Manage your budget. Stay in control.</strong>
  <br />
  A simple, responsive personal finance tracker built with HTML, CSS, and Vanilla JavaScript.
  <br /><br />
  <a href="https://amina0426.githubio.com">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_Budgy-6366f1?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## About the Project

**Budgy** is a personal finance tracker designed to make managing everyday expenses and income simple. It allows users to record transactions, monitor their monthly spending, set a budget, and keep their financial data organized in one place.

The project originally used **browser localStorage** for data persistence. It was later upgraded to **Firebase Authentication and Cloud Firestore**, enabling account-based access and cloud storage across devices.

## Features

- **User Authentication** — Create an account and securely sign in.
- **Expense Tracking** — Add, update, and delete expenses with amounts, categories, and dates.
- **Income Tracking** — Record and manage income entries.
- **Monthly Budget** — Set a spending limit and track expenses against your budget.
- **Receipt Images** — Attach and view images for expenses.
- **Transaction Management** — Organize and review financial records.
- **Date-Based Tracking** — Keep track of transactions by date and monitor monthly spending.
- **Data Backup** — Export financial records as a JSON file.
- **Data Restore** — Restore records from a previously exported backup.
- **Progressive Web App (PWA)** — Supports installation on compatible devices.
- **Cloud Synchronization** — Access expenses, income, and budget data across devices when signed in to the same account.

## Tech Stack

| Technology              | Purpose                                                |
| ----------------------- | ------------------------------------------------------ |
| HTML5                   | Application structure                                  |
| CSS3                    | Styling and responsive interface                       |
| Vanilla JavaScript      | Application logic and interactivity                    |
| Browser localStorage    | Original local data storage and compatibility          |
| Firebase Authentication | User registration and sign-in                          |
| Cloud Firestore         | Cloud database for user profiles and financial records |
| IndexedDB               | Local storage for receipt image files                  |
| Service Workers         | PWA support and static asset caching                   |

## From localStorage to Firebase

Budgy started as a client-side application using HTML, CSS, Vanilla JavaScript, and `localStorage`. The application was then migrated to Firebase to support authenticated users and persistent cloud-based data.

**Before:** Financial records were stored in the browser's localStorage, making them local to that browser.

**After:** Firebase Authentication identifies each user, while Cloud Firestore stores their expenses, income entries, and monthly budget.

The migration also introduced user-specific database paths and Firestore security rules to prevent users from accessing other users' financial records.

Receipt images use IndexedDB rather than Firebase Storage. Firestore stores their image IDs, while the actual image files remain on the device where they were added.

## Data Storage

- **Cloud Firestore:** User profile, expenses, income entries, and monthly budget.
- **IndexedDB:** Actual receipt image files, stored locally on each device.
- **JSON backups:** Exported financial records that can be imported later.

> **Note:** Receipt image files are device-specific and are not synchronized across devices or included in JSON backups. Financial records and the monthly budget can sync through Firestore when using the same account.

## Getting Started

### Prerequisites

- A modern web browser.
- A Firebase project.
- Firebase Authentication and Cloud Firestore enabled.

### Setup

1. Clone or download this repository.
2. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
3. Enable the authentication method used by the application.
4. Create a Cloud Firestore database.
5. Add your Firebase web configuration to the application's Firebase configuration file.
6. Configure and publish the Firestore security rules required by the application.
7. Serve the project using a local development server that supports JavaScript modules.
8. Open the application and register an account to start tracking your finances.

**Important:** Never put Firebase Admin SDK credentials or service account private keys in frontend code. Configure Firestore security rules properly; authentication alone does not protect users' records.

## Security

Budgy uses Firebase Authentication and Firestore security rules to restrict access to user-owned data.

- Users must be authenticated to access their financial records.
- Database operations are scoped to the authenticated user's account.
- Security rules validate permitted fields and relevant data constraints.
- Client-side validation improves usability but does not replace server-enforced Firestore rules.

## Future Improvements

- More detailed spending analytics and visual reports.
- Additional budgeting and savings tools.
- Improved receipt management and cross-device image synchronization.
- More transaction filtering and reporting options.

## Project Goal

Budgy demonstrates the development of a client-side web application and its transition to a cloud-backed, authenticated application using Firebase.

It brings together frontend development, asynchronous JavaScript, cloud database operations, authentication, access control, browser storage, and PWA functionality in one practical project.

---

<p align="center">
  Made with 💜 for smarter money management.
  <br /><br />
  <a href="YOUR_LIVE_DEMO_URL">
    <img src="https://img.shields.io/badge/Try_Budgy-Live_Demo-6366f1?style=for-the-badge" alt="Try Budgy Live Demo" />
  </a>
</p>
