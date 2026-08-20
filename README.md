# ApplyIQ

### Smart Job & Internship Opportunity Intelligence Platform

ApplyIQ is a browser-based JavaScript application designed to help students and early-career developers manage their job and internship search in one place.

Instead of simply storing application records, ApplyIQ combines opportunity discovery, skill matching, application tracking, deadline awareness, and analytics to help users make better decisions during their job search.

---

## 📌 Problem Statement

Students applying for internships and entry-level jobs often manage opportunities across multiple websites, spreadsheets, notes, and bookmarks.

This makes it difficult to answer questions such as:

- Which opportunities have I already applied to?
- Which applications need my attention?
- How well do my current skills match a role?
- Which skills am I missing?
- Which applications are approaching their deadlines?
- How is my application pipeline progressing?

ApplyIQ brings these activities together into a single browser-based workspace.

---

## 🎯 Objectives

The main objectives of ApplyIQ are to:

- Organize job and internship applications.
- Discover job opportunities from an external jobs API.
- Compare personal skills with required job skills.
- Identify missing skills for each opportunity.
- Track application progress.
- Highlight upcoming deadlines.
- Provide application analytics.
- Persist user data using browser Local Storage.
- Provide a responsive and accessible interface.
- Apply JavaScript concepts learned throughout the internship to a practical project.

---

# ✨ Key Features

## 1. Personalized Workspace

On the first visit, users can create their personal ApplyIQ workspace.

The profile includes:

- Name
- Target role
- Experience level
- Preferred locations
- Personal skills

The profile is stored locally and used throughout the application.

> **Screenshot:** Add your **Create Workspace / Onboarding** screenshot here.

---

## 2. Personalized Dashboard

The dashboard provides an overview of the user's job search.

It displays:

- Total applications
- Applied applications
- Interviews
- Assessments
- Selected applications
- Rejected applications
- Average skill match
- Open opportunities
- Recent applications
- Skill readiness
- Important next actions

The dashboard is dynamically updated as the user interacts with the application.

> **Screenshot:** Add your **Dashboard** screenshot here.

---

## 3. Application Management

ApplyIQ provides complete CRUD functionality for managing applications.

Users can:

- Create applications
- View applications
- Edit applications
- Delete applications
- Track application status
- Set priority
- Add deadlines
- Add required skills
- Store application URLs
- Add notes

Supported application stages include:

- Wishlist
- Applied
- Online Assessment
- Interview
- Selected
- Rejected

> **Screenshot:** Add your **Applications page with multiple application cards** here.

---

## 4. Search, Filter and Sort

Applications can be searched and organized using multiple controls.

### Search

Users can search by:

- Company
- Role
- Location
- Skills
- Notes

### Filters

Applications can be filtered by:

- Status
- Priority
- Job type
- Location

### Sorting

Applications can be sorted based on available application information such as:

- Newest
- Oldest
- Deadline
- Match score

This allows users to quickly find the opportunities that require attention.

> **Screenshot:** Add your **Applications page showing search/filter/sort controls** here.

---

# 🔎 Discover Jobs

ApplyIQ includes a dedicated **Discover Jobs** section for finding real job opportunities.

Job listings are retrieved using the **Fetch API** from the public Arbeitnow Job Board API.

The application processes the returned JSON data and dynamically displays job cards.

Each job may include:

- Job title
- Company
- Location
- Remote status
- Job type
- Description
- Required tags/skills
- Original job URL

Users can search the retrieved opportunities without making a new API request for every search.

> **Screenshot:** Add your **Discover Jobs page showing live job cards** here.

---

## 🔗 Saving Discovered Jobs

A discovered opportunity can be saved directly into the user's ApplyIQ application tracker.

The flow is:
````text
Discover Job
     ↓
View Opportunity
     ↓
Save to ApplyIQ
     ↓
Application Record
     ↓
Skill Matching
     ↓
Dashboard & Analytics
````

Duplicate protection prevents the same opportunity from being added repeatedly.

> Screenshot: Add a screenshot showing "Save to ApplyIQ" / "Already saved" here.

## 🧠 Skill Matching

One of the main features of ApplyIQ is its rule-based skill matching system.

The user's personal skills are compared with the required skills of an opportunity.

For example:

### User Skills

* JavaScript
* HTML
* CSS
* Git

### Required Skills

* JavaScript
* HTML
* CSS
* React
* Git

The system identifies:

### Matched Skills

* ✓ JavaScript
* ✓ HTML
* ✓ CSS
* ✓ Git

### Missing Skills

* ○ React

A match percentage is then calculated based on the available skill information.

This helps users understand whether they are already prepared for an opportunity or whether they should focus on specific skills first.

> Screenshot: Add your Skill Match / Missing Skills / Readiness screenshot here.

## 📊 Analytics

The Analytics section provides insights into the user's application pipeline.

It includes information such as:

* Application status distribution
* Average skill match
* Interview conversion
* Selection rate
* Skill gaps
* Application trends
* Performance insights

The analytics are calculated from the user's existing application data.

> Screenshot: Add your Analytics page screenshot here.

## ⏰ Deadline Awareness

Applications can contain deadlines and due dates.

ApplyIQ identifies different deadline conditions such as:

* Overdue
* Due soon
* Upcoming

This helps users prioritize applications and assessments that require immediate attention.

> Screenshot: Add your application cards showing deadline indicators here.

## 👤 Profile and Settings

Users can update their profile from the Settings section.

The profile includes:

* Name
* Target role
* Experience level
* Preferred locations
* Personal skills

Changes are immediately reflected throughout the application.

The application also calculates a profile readiness percentage based on the completeness of the user's profile.

> Screenshot: Add your Settings / Profile page screenshot here.

## 💾 Local Data Persistence

ApplyIQ uses the browser's localStorage API to persist application and profile information.

This allows data to remain available after:

* Page refresh
* Navigation
* Closing and reopening the browser

The application uses its existing state structure to manage:

* Profile
* Applications
* Skills
* Preferences

No backend database is required for the current version.

## 📤 CSV Export

Application data can be exported as a CSV file.

The exported data can include information such as:

* Company
* Role
* Location
* Status
* Priority
* Job type
* Application date
* Deadline
* Match score

This allows users to keep an external copy of their application information.

> Screenshot: Add your CSV export result / downloaded spreadsheet screenshot here if you want to demonstrate this feature.

## 🌙 Theme Support

ApplyIQ supports light and dark themes.

The interface is designed to maintain readability and usability across both themes.

## 📱 Responsive Design

The application is responsive and adapts to different screen sizes.

It supports:

* Desktop
* Tablet
* Mobile

The layout includes responsive navigation, forms, cards, grids, and job listings.

> Screenshot: Add one mobile/responsive screenshot here.

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript (ES6+)
* Browser APIs
* DOM API
* Local Storage API
* Fetch API

### Data

* JSON
* Arbeitnow Job Board API

### Development

* Git
* GitHub
* VS Code
* Node.js

## 🧩 JavaScript Concepts Applied

ApplyIQ was developed as the final independent project after completing the JavaScript internship tasks.

The project applies the concepts learned throughout the tasks.

| Concept                | Application in ApplyIQ                         |
| ---------------------- | ---------------------------------------------- |
| Variables              | Application and UI state                       |
| Data Types             | Strings, numbers, booleans, arrays and objects |
| Operators              | Statistics and match calculations              |
| Conditional Statements | Validation, deadlines and recommendations      |
| Switch Statement       | Job type normalization                         |
| Loops / Array Methods  | Processing applications, skills and API data   |
| Functions              | Reusable application and UI logic              |
| Arrays                 | Applications, skills and job listings          |
| Strings                | Search and skill normalization                 |
| Objects                | Application and job records                    |
| DOM Manipulation       | Dynamic interface rendering                    |
| Events                 | Forms, buttons, search and navigation          |
| Form Validation        | Application and profile forms                  |
| Callbacks              | Event handlers and array methods               |
| Promises               | Fetch API operations                           |
| Async/Await            | Asynchronous job retrieval                     |
| Fetch API              | Discover Jobs                                  |
| JSON                   | Processing API responses                       |
| CRUD                   | Application management                         |
| Local Storage          | Persistent browser data                        |
| Responsive Design      | Mobile and desktop layouts                     |

## 🔄 Application Architecture

The application follows a client-side architecture.

```text
                    APPLYIQ
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Profile      Applications    Discover Jobs
        │              │              │
        │         CRUD + Search       │
        │              │              │
        └──────────────┼──────────────┘
                       │
                 Application State
                       │
            ┌──────────┴──────────┐
            │                     │
       Skill Matching        Analytics
            │
            │
       Local Storage
```
