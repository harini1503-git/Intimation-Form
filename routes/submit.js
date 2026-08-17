const express = require("express");
const Submission = require("../models/Submission");
const Counter = require("../models/Counter");
const { sendSubmissionEmail } = require("../services/email");

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Sequential reference number: UNISON-001, UNISON-002, …             */
/* Uses an atomic findOneAndUpdate so concurrent requests never        */
/* produce the same number.                                            */
/* ------------------------------------------------------------------ */
async function generateReferenceNo() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "submission" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(3, "0");
  return `UNISON-${padded}`;
}

function validatePayload(payload) {
  const errors = {};
  const {
    intimationFor,
    formType,
    policyNumber,
    employeeCode,
    firstName,
    surname,
    mobile,
    patientName,
    relationship,
    doctorName,
    hospitalName,
    hospitalAddress,
    pincode,
    agree,
  } = payload;

  if (!intimationFor) errors.intimationFor = "Intimation type is required.";
  if (!formType || !["GMC", "GPA"].includes(formType)) {
    errors.formType = "Invalid form type.";
  }
  if (!policyNumber) errors.policyNumber = "Policy number is required.";
  if (!employeeCode || !/^\d+$/.test(employeeCode)) {
    errors.employeeCode = "Valid numeric employee code is required.";
  }
  if (!firstName) errors.firstName = "First name is required.";
  if (!surname) errors.surname = "Surname is required.";
  if (formType === "GPA" && (!mobile || !/^[6-9]\d{9}$/.test(mobile))) {
    errors.mobile = "Valid 10-digit mobile number is required for GPA claims.";
  }
  if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }
  if (!patientName) errors.patientName = "Patient name is required.";
  if (!relationship) errors.relationship = "Relationship is required.";
  if (!doctorName) errors.doctorName = "Doctor name is required.";
  if (!hospitalName) errors.hospitalName = "Hospital name is required.";
  if (!hospitalAddress) {
    errors.hospitalAddress = "Hospital address is required.";
  }
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    errors.pincode = "Valid 6-digit pincode is required.";
  }
  if (!agree) errors.agree = "Declaration agreement is required.";

  if (formType === "GMC") {
    if (!payload.diagnosis) errors.diagnosis = "Diagnosis is required.";
    if (!payload.treatmentNature) {
      errors.treatmentNature = "Nature of treatment is required.";
    }
    if (!payload.admissionDateTime) {
      errors.admissionDateTime = "Admission date and time is required.";
    }
  }

  if (formType === "GPA") {
    if (!payload.accidentLocation) {
      errors.accidentLocation = "Accident location is required.";
    }
    if (!payload.accidentDescription) {
      errors.accidentDescription = "Accident description is required.";
    } else {
      const words = payload.accidentDescription
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      if (words > 100) {
        errors.accidentDescription = "Maximum 100 words allowed.";
      }
    }
    if (!payload.injuryDescription) {
      errors.injuryDescription = "Injury description is required.";
    }
    if (!payload.accidentDateTime) {
      errors.accidentDateTime = "Accident date and time is required.";
    }
  }

  return errors;
}

router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const idempotencyKey = req.headers["x-idempotency-key"];

    if (idempotencyKey) {
      const existing = await Submission.findOne({ idempotencyKey });
      if (existing) {
        return res.status(200).json({
          success: true,
          referenceNo: existing.referenceNo,
          message: `Intimation already recorded under Policy #${existing.policyNumber}.`,
        });
      }
    }

    const errors = validatePayload(payload);
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, errors });
    }

    const referenceNo = generateReferenceNo();
    const submission = await Submission.create({
      referenceNo,
      idempotencyKey: idempotencyKey || undefined,
      submittedAt: new Date(),
      ...payload,
    });

    try {
      await sendSubmissionEmail(submission.toObject());
    } catch (mailErr) {
      console.error("Failed to send email notification:", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      referenceNo,
      message: `Intimation recorded successfully under Policy #${payload.policyNumber}.`,
    });
  } catch (err) {
    if (err.code === 11000) {
      const duplicate = await Submission.findOne({
        referenceNo: err.keyValue?.referenceNo,
      });
      if (duplicate) {
        return res.status(200).json({
          success: true,
          referenceNo: duplicate.referenceNo,
          message: `Intimation already recorded under Policy #${duplicate.policyNumber}.`,
        });
      }
    }

    console.error("Submission error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
