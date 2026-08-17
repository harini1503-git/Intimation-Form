Build a complete, responsive **“Intimation Form Under GMC / GPA”** web form for handling insurance/accident intimation.

## 1. Form Type Selection

At the top, create a required dropdown:

**Intimation For**

* Group Mediclaim - Staff
* Group Mediclaim - Marketing
* Group Personal Accident

The form must dynamically display fields based on the selected option.

---

# A. GROUP MEDICLAIM — STAFF / MARKETING

When either **Group Mediclaim - Staff** or **Group Mediclaim - Marketing** is selected, show:

### Employee Details

1. **Policy Number** — Required
2. **Employee Code** — Required, Number
3. **Employee Name** — Required

   * First Name
   * Middle Name
   * Surname
4. **Mobile No**
5. **Email ID**

### Patient Details

6. **Patient Name** — Required
7. **Patient Relationship** — Required dropdown

   * Self
   * Spouse
   * Son
   * Daughter

### Hospitalization Details

8. **Reason for Hospitalization / Diagnosis** — Required
9. **Nature of Treatment** — Required
10. **Date of Admission** — Required date + time picker
11. **Doctor’s Name & Degree** — Required
12. **Name of Hospital** — Required
13. **Hospital Address with Pincode** — Required

### Mediclaim Notes

Display the following note when either Mediclaim option is selected:

> Submission of claim form with all Original bills, pathology reports, radiology films, discharge summary, indoor case paper, PAN card, Aadhaar card (KYC), and a cancelled cheque within 20 days of discharge from hospital. (Download Claim Form)

Also display:

> **Document Retention:** Keep a Xerox of every submitted document until the final claim approval.

Then show a required checkbox:

**☐ I agree**

The Submit button must remain disabled until the required fields and agreement checkbox are completed.

---

# B. GROUP PERSONAL ACCIDENT

When **Group Personal Accident** is selected, show:

### Employee Details

1. **Policy Number** — Required
2. **Employee Code** — Required, Number
3. **Employee Name** — Required

   * First Name
   * Middle Name
   * Surname
4. **Mobile No** — Required
5. **Email ID**

### Patient Details

6. **Patient Name** — Required
7. **Patient Relationship** — Required dropdown

   * Self
   * Spouse

### Accident Details

8. **Location of Accident** — Required
9. **Description of Accident** — Required

   * Textarea
   * Maximum 100 words
   * Display a live word counter such as `0 / 100 words`
10. **Describe the Injury** — Required
11. **Date of Accident** — Required date + time picker
12. **FIR No., Date & Police Station** — Optional
13. **Doctor’s Name & Degree** — Required
14. **Name of Hospital** — Required
15. **Hospital Address with Pincode** — Required

### GPA Notes

Display:

> **Only For Group Personal Accident**

Then:

> Submission of claim form with all Original bills, pathology reports, radiology films, fitness certificate, last 3 months salary slip, PAN card, Aadhaar card (KYC), and a cancelled cheque within 10 days of Fitness Certificate. (Download Claim Form)

Also display:

> **Document Retention:** Keep a Xerox of every submitted document until the final claim approval.

Then show:

**☐ I agree**

This checkbox must be required before submission.

---

# Form Behaviour

Implement proper frontend validation.

### Required fields

Every field marked **Required** or `*` must be validated.

### Conditional rendering

* Do not show Mediclaim fields when Group Personal Accident is selected.
* Do not show GPA fields when either Mediclaim option is selected.
* Policy Number should be based on the onchange of the dropdown selected beside the dropdown selected
* Reset/clear conditional fields when the user switches between form types to prevent stale data from being submitted.
* Store the Data in the Database.

### Validation

Implement:

* Employee Code → numbers only
* Mobile Number → valid Indian 10-digit mobile number
* Email → valid email format
* Pincode → valid 6-digit Indian pincode
* Date/time → valid date and time
* Description of Accident → maximum 100 words
* Required fields → cannot be empty
* Agreement checkbox → mandatory
* Show clear inline validation messages below invalid fields.

---

# UI / UX

Create a professional corporate insurance form.

Requirements:

* Responsive design for desktop, tablet and mobile
* Clean professional layout
* Form divided into logical sections
* Clear labels
* Required fields marked with `*`
* Consistent spacing
* Accessible form controls
* Date/time picker
* Dropdowns
* Textareas
* Proper error states
* Loading state while submitting
* Success confirmation after successful submission
* Error message if submission fails
* Prevent duplicate submissions
* Scroll to the first invalid field after validation failure

Use a clean corporate visual style rather than an overly decorative design.

---

# Submission

On successful submission, send the completed form details by email to:

[harinimudaliar1503@gmail.com](mailto:harinimudaliar1503@gmail.com)

The email should contain:

**Subject:**
`GMC/GPA Intimation - [Employee Name] - [Form Type]`

The email body should clearly organize the submitted information into sections such as:

### Employee Details

* Employee Code
* Employee Name
* Mobile
* Email
* Policy Number

### Patient Details

* Patient Name
* Relationship

### Medical / Accident Details

Include the relevant fields depending on the selected form type.

### Hospital Details

* Doctor
* Hospital
* Hospital Address

Do not expose email credentials or SMTP secrets in frontend code.

Use a secure backend/API endpoint for sending emails. Environment variables must be used for credentials and other secrets.

---

# Technical Requirements

Build this as a production-quality form.

Structure the project cleanly into:

* Form UI
* Reusable form components
* Validation
* API/backend submission
* Email service
* Error handling

Keep the code modular and maintainable.

Do not hardcode sensitive credentials.

Make sure the final implementation is fully functional rather than just creating a static UI.

Before finishing, test:

1. Staff Mediclaim flow
2. Marketing Mediclaim flow
3. Personal Accident flow
4. Required field validation
5. 100-word accident description limit
6. Mobile/email/pincode validation
7. Switching between form types
8. Agreement checkbox
9. Successful email submission
10. Failed submission handling
11. Mobile responsiveness
12. Duplicate-submit prevention

Provide the complete implementation and explain how to run it locally and configure the email credentials.

---

# Setup & Run (Local Development)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy the example env file and edit it:

```bash
copy .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `EMAIL_USER` | SMTP sender email (optional) |
| `EMAIL_PASS` | SMTP app password (optional) |
| `RECIPIENT_EMAIL` | Notification recipient |

**Local MongoDB example:**

```
MONGODB_URI=mongodb://127.0.0.1:27017/intimation-form
```

**MongoDB Atlas example:**

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/intimation-form
```

## 3. Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend structure

```
server.js              # Express entry point
config/database.js     # MongoDB connection
models/Submission.js   # Mongoose schema
routes/submit.js       # POST /api/submit
services/email.js      # Nodemailer email service
```

Submissions are stored in MongoDB. Email notifications are sent when `EMAIL_USER` and `EMAIL_PASS` are configured; otherwise submissions are saved to the database only.

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/submit` | Submit intimation form |

## Email setup (Gmail)

1. Enable 2-Step Verification on your Google account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set `EMAIL_USER` and `EMAIL_PASS` in `.env`.
