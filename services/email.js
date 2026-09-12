const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function fmt(value) {
  return value && String(value).trim() ? String(value).trim() : "N/A";
}

function formatDateTime(raw) {
  if (!raw) return "N/A";
  try {
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return raw;
  }
}

/* ------------------------------------------------------------------ */
/* HTML email builder                                                   */
/* ------------------------------------------------------------------ */
function buildHtmlEmail(submission) {
  const {
    referenceNo,
    submittedAt,
    intimationFor,
    formType,
    policyNumber,
    employeeCode,
    firstName,
    middleName,
    surname,
    mobile,
    email,
    patientName,
    relationship,
    diagnosis,
    treatmentNature,
    admissionDateTime,
    accidentLocation,
    accidentDescription,
    injuryDescription,
    accidentDateTime,
    firDetails,
    doctorName,
    hospitalName,
    hospitalAddress,
    pincode,
  } = submission;

  const fullName = `${firstName}${middleName ? " " + middleName : ""} ${surname}`;
  const isGpa = formType === "GPA";

  /* colour palette */
  const brandBlue = "#1a3a6b";
  const accentTeal = "#0d9488";
  const lightBg = "#f8fafc";
  const borderColor = "#e2e8f0";
  const labelColor = "#64748b";
  const valueColor = "#1e293b";

  /* reusable row builder */
  function row(label, value) {
    return `
      <tr>
        <td style="padding:10px 16px; width:42%; color:${labelColor}; font-weight:600; font-size:13px; border-bottom:1px solid ${borderColor}; background:#f1f5f9; white-space:nowrap;">${label}</td>
        <td style="padding:10px 16px; color:${valueColor}; font-size:13px; border-bottom:1px solid ${borderColor};">${fmt(value)}</td>
      </tr>`;
  }

  /* section header */
  function sectionHeader(title, icon) {
    return `
      <tr>
        <td colspan="2" style="padding:14px 16px 10px; background:${brandBlue}; color:#ffffff; font-size:13px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;">
          ${icon}&nbsp;&nbsp;${title}
        </td>
      </tr>`;
  }

  const medicalRows = isGpa
    ? `
      ${sectionHeader("Accident Details", "&#128657;")}
      ${row("Location of Accident", accidentLocation)}
      ${row("Accident Description", accidentDescription)}
      ${row("Injury Description", injuryDescription)}
      ${row("Date &amp; Time of Accident", formatDateTime(accidentDateTime))}
      ${row("FIR Details", firDetails || "N/A")}`
    : `
      ${sectionHeader("Hospitalisation Details", "&#127973;")}
      ${row("Reason / Diagnosis", diagnosis)}
      ${row("Nature of Treatment", treatmentNature)}
      ${row("Date &amp; Time of Admission", formatDateTime(admissionDateTime))}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Intimation Submission Confirmation</title>
</head>
<body style="margin:0; padding:0; background:#e9eff6; font-family:Arial, Helvetica, sans-serif; color:#1e293b; font-size:14px; line-height:1.6;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9eff6; padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px; width:100%; border-radius:10px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header banner -->
          <tr>
            <td style="background:${brandBlue}; padding:28px 32px; text-align:center;">
              <p style="margin:0 0 4px; color:#93c5fd; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; font-weight:600;">Employee Benefits &amp; Insurance Desk</p>
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:700;">Intimation Submitted &#10003;</h1>
              <p style="margin:8px 0 0; color:#bfdbfe; font-size:13px;">Your claim intimation has been recorded successfully.</p>
            </td>
          </tr>

          <!-- Reference badge -->
          <tr>
            <td style="background:${accentTeal}; padding:14px 32px; text-align:center;">
              <span style="color:#ffffff; font-size:14px; font-weight:600; letter-spacing:0.06em;">
                Reference ID:&nbsp;&nbsp;<span style="font-size:16px; font-family:monospace; background:rgba(255,255,255,0.18); padding:3px 10px; border-radius:4px;">${fmt(referenceNo)}</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff; padding:24px 32px 8px;">
              <p style="margin:0 0 6px; color:${labelColor}; font-size:12px;">Submitted on</p>
              <p style="margin:0 0 20px; color:${valueColor}; font-size:14px; font-weight:600;">${formatDateTime(submittedAt)}</p>
              <p style="margin:0; color:#475569; font-size:13px; line-height:1.6;">
                This email confirms receipt of your <strong>${fmt(intimationFor)}</strong> intimation under policy <strong>${fmt(policyNumber)}</strong>.
                The insurance desk will review your submission and reach out if further information is needed.
              </p>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="background:#ffffff; padding:16px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid ${borderColor}; border-radius:8px; overflow:hidden; border-collapse:collapse;">

                <!-- Claim Info -->
                ${sectionHeader("Claim Information", "&#128196;")}
                ${row("Reference Number", referenceNo)}
                ${row("Intimation Type", intimationFor)}
                ${row("Policy Number", policyNumber)}

                <!-- Employee Details -->
                ${sectionHeader("Employee Details", "&#128100;")}
                ${row("Employee Code", employeeCode)}
                ${row("Employee Name", fullName)}
                ${row("Mobile Number", mobile)}
                ${row("Email ID", email)}

                <!-- Patient Details -->
                ${sectionHeader("Patient Details", "&#129657;")}
                ${row("Patient Name", patientName)}
                ${row("Relationship to Employee", relationship)}

                <!-- Medical / Accident Details -->
                ${medicalRows}

                <!-- Hospital & Doctor -->
                ${sectionHeader("Hospital &amp; Doctor Details", "&#127973;")}
                ${row("Doctor's Name &amp; Degree", doctorName)}
                ${row("Hospital Name", hospitalName)}
                ${row("Hospital Address", hospitalAddress)}
                ${row("Pincode", pincode)}

              </table>
            </td>
          </tr>

          <!-- Notice -->
          <tr>
            <td style="background:${lightBg}; padding:20px 32px; border-top:1px solid ${borderColor};">
              <p style="margin:0 0 8px; color:${brandBlue}; font-size:13px; font-weight:700;">&#128204;&nbsp; Next steps</p>
              ${
                isGpa
                  ? `<p style="margin:0; color:#475569; font-size:12px; line-height:1.6;">
                      Submit the claim form with all original bills, pathology reports, radiology films, fitness certificate,
                      last 3 months' salary slip, PAN card, Aadhaar card (KYC), and a cancelled cheque within
                      <strong>10 days</strong> of the fitness certificate.
                    </p>`
                  : `<p style="margin:0; color:#475569; font-size:12px; line-height:1.6;">
                      Submit the claim form with all original bills, pathology reports, radiology films, discharge summary,
                      indoor case paper, PAN card, Aadhaar card (KYC), and a cancelled cheque within
                      <strong>20 days</strong> of discharge from hospital.
                    </p>`
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${brandBlue}; padding:18px 32px; text-align:center;">
              <p style="margin:0; color:#93c5fd; font-size:11px; line-height:1.6;">
                This is an automated email from the Employee Benefits &amp; Insurance Desk.<br/>
                For assistance, please contact your HR representative.<br/>
                Please retain a photocopy of every submitted document until final claim approval.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`.trim();
}

/* ------------------------------------------------------------------ */
/* Plain-text fallback                                                  */
/* ------------------------------------------------------------------ */
function buildTextEmail(submission) {
  const {
    referenceNo, submittedAt, intimationFor, formType, policyNumber,
    employeeCode, firstName, middleName, surname, mobile, email,
    patientName, relationship, diagnosis, treatmentNature, admissionDateTime,
    accidentLocation, accidentDescription, injuryDescription, accidentDateTime,
    firDetails, doctorName, hospitalName, hospitalAddress, pincode,
  } = submission;

  const fullName = `${firstName}${middleName ? " " + middleName : ""} ${surname}`;
  const isGpa = formType === "GPA";

  const medicalSection = isGpa
    ? `Accident Location    : ${fmt(accidentLocation)}
Accident Description : ${fmt(accidentDescription)}
Injury Description   : ${fmt(injuryDescription)}
Date of Accident     : ${formatDateTime(accidentDateTime)}
FIR Details          : ${fmt(firDetails)}`
    : `Reason / Diagnosis   : ${fmt(diagnosis)}
Treatment Nature     : ${fmt(treatmentNature)}
Admission Date & Time: ${formatDateTime(admissionDateTime)}`;

  return `
INTIMATION CLAIM SUBMISSION CONFIRMATION
=========================================
Reference Number : ${fmt(referenceNo)}
Submitted On     : ${formatDateTime(submittedAt)}
Intimation Type  : ${fmt(intimationFor)}
Policy Number    : ${fmt(policyNumber)}

--- EMPLOYEE DETAILS ---
Employee Code    : ${fmt(employeeCode)}
Employee Name    : ${fullName}
Mobile Number    : ${fmt(mobile)}
Email ID         : ${fmt(email)}

--- PATIENT DETAILS ---
Patient Name     : ${fmt(patientName)}
Relationship     : ${fmt(relationship)}

--- ${isGpa ? "ACCIDENT" : "HOSPITALISATION"} DETAILS ---
${medicalSection}

--- HOSPITAL & DOCTOR DETAILS ---
Doctor Name      : ${fmt(doctorName)}
Hospital Name    : ${fmt(hospitalName)}
Hospital Address : ${fmt(hospitalAddress)}
Pincode          : ${fmt(pincode)}
=========================================
`.trim();
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */
async function sendSubmissionEmail(submission) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(
      "Email credentials not configured. Submission saved to database only."
    );
    return false;
  }

  const recipient =
    process.env.RECIPIENT_EMAIL || "harinimudaliar1503@gmail.com";

  const fullName = `${submission.firstName}${
    submission.middleName ? " " + submission.middleName : ""
  } ${submission.surname}`;

  const subject = `[${submission.formType}] Intimation Received — ${fullName} (${submission.referenceNo})`;

  await transporter.sendMail({
    from: `"Employee Benefits & Insurance Desk" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject,
    text: buildTextEmail(submission),
    html: buildHtmlEmail(submission),
  });

  console.log(`Confirmation email sent to ${recipient} — ref: ${submission.referenceNo}`);
  return true;
}

module.exports = { sendSubmissionEmail };
