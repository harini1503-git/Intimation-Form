const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    referenceNo: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, index: true, sparse: true },
    formType: { type: String, enum: ["GMC", "GPA"], required: true },
    intimationFor: {
      type: String,
      enum: ["Staff", "Marketing", "BrillexStaff", "GPABrillexStaff", "GPA"],
      required: true,
    },
    policyNumber: { type: String, required: true },
    employeeCode: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    surname: { type: String, required: true },
    mobile: { type: String, default: "" },
    email: { type: String, default: "" },
    patientName: { type: String, required: true },
    relationship: { type: String, required: true },
    diagnosis: { type: String, default: "" },
    treatmentNature: { type: String, default: "" },
    admissionDateTime: { type: String, default: "" },
    accidentLocation: { type: String, default: "" },
    accidentDescription: { type: String, default: "" },
    injuryDescription: { type: String, default: "" },
    accidentDateTime: { type: String, default: "" },
    firDetails: { type: String, default: "" },
    doctorName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String, required: true },
    pincode: { type: String, required: true },
    agree: { type: Boolean, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
