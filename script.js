(() => {
  'use strict';

  /* ============================================================
     Hero carousel
     ============================================================ */
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const dots = Array.from(document.querySelectorAll('.hero__dot'));
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  let slideIndex = 0;
  let slideTimer = null;

  function goToSlide(i) {
    slideIndex = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === slideIndex));
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === slideIndex));
  }

  function startAutoplay() {
    stopAutoplay();
    slideTimer = setInterval(() => goToSlide(slideIndex + 1), 5500);
  }

  function stopAutoplay() {
    if (slideTimer) clearInterval(slideTimer);
  }

  if (slides.length) {
    prevBtn.addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoplay(); });
    nextBtn.addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoplay(); });
    dots.forEach((d, idx) => d.addEventListener('click', () => { goToSlide(idx); startAutoplay(); }));
    document.getElementById('heroCarousel').addEventListener('mouseenter', stopAutoplay);
    document.getElementById('heroCarousel').addEventListener('mouseleave', startAutoplay);
    startAutoplay();
  }

  /* ============================================================
     Claim flow configuration
     ============================================================ */
  const FLOWS = {
    Staff: {
      policy: 'GMC/STAFF/2026/00417',
      label: 'Group Mediclaim — Staff',
      sections: ['type', 'employee', 'patient', 'mediclaim', 'hospital', 'declaration']
    },
    Marketing: {
      policy: 'GMC/MKT/2026/00417',
      label: 'Group Mediclaim — Marketing',
      sections: ['type', 'employee', 'patient', 'mediclaim', 'hospital', 'declaration']
    },
    GPA: {
      policy: 'GPA/CORP/2026/00417',
      label: 'Group Personal Accident',
      sections: ['type', 'employee', 'patient', 'gpa', 'hospital', 'declaration']
    }
  };

  const SECTION_LABELS = {
    type: 'Claim type & policy',
    employee: 'Employee details',
    patient: 'Patient details',
    mediclaim: 'Hospitalisation details',
    gpa: 'Accident details',
    hospital: 'Hospital & doctor',
    declaration: 'Checklist & declaration'
  };

  const REQUIRED_FIELDS = {
    type: ['intimationFor', 'policyNumber'],
    employee: ['employeeCode', 'firstName', 'surname', 'email'],
    patient: ['patientName', 'relationship'],
    mediclaim: ['diagnosis', 'treatmentNature', 'admissionDateTime'],
    gpa: ['accidentLocation', 'accidentDescription', 'injuryDescription', 'accidentDateTime'],
    hospital: ['doctorName', 'hospitalName', 'hospitalAddress', 'pincode'],
    declaration: ['agree']
  };

  const RELATIONSHIPS = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Father-in-law', 'Mother-in-law'];

  const form = document.getElementById('intimationForm');
  const railList = document.getElementById('railList');
  const railProgress = document.getElementById('railProgress');
  const railBarFill = document.getElementById('railBarFill');
  const formHint = document.getElementById('formHint');
  const submitBtn = document.getElementById('submitBtn');

  const relationshipSelect = document.getElementById('relationship');
  RELATIONSHIPS.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    relationshipSelect.appendChild(opt);
  });

  let currentFlow = null;
  let revealedSections = ['type'];
  const completedSections = new Set();

  /* ---------------- Rail rendering ---------------- */
  function renderRail() {
    const sections = currentFlow ? currentFlow.sections : ['type'];
    railList.innerHTML = '';
    sections.forEach(key => {
      const li = document.createElement('li');
      li.textContent = SECTION_LABELS[key];
      li.dataset.section = key;
      if (completedSections.has(key)) li.classList.add('is-complete');
      else if (key === revealedSections[revealedSections.length - 1]) li.classList.add('is-active');
      railList.appendChild(li);
    });
    const pct = sections.length ? Math.round((completedSections.size / sections.length) * 100) : 0;
    railProgress.textContent = pct + '%';
    railBarFill.style.width = pct + '%';
  }

  /* ---------------- Field validation ---------------- */
  function fieldEl(name) {
    return form.elements[name];
  }

  function fieldWrapper(name) {
    const el = fieldEl(name);
    return el ? el.closest('.field') : null;
  }

  function setError(name, message) {
    const wrap = fieldWrapper(name);
    if (!wrap) return;
    const errEl = wrap.querySelector(`[data-error-for="${name}"]`);
    if (message) {
      wrap.classList.add('has-error');
      wrap.classList.remove('is-valid');
      if (errEl) errEl.textContent = message;
    } else {
      wrap.classList.remove('has-error');
      wrap.classList.add('is-valid');
      if (errEl) errEl.textContent = '';
    }
  }

  function validateField(name) {
    const el = fieldEl(name);
    if (!el) return true;
    const value = (el.value || '').trim();

    switch (name) {
      case 'agree':
        if (!el.checked) { setError(name, 'Please confirm before submitting.'); return false; }
        break;
      case 'employeeCode':
        if (!value) { setError(name, 'Employee code is required.'); return false; }
        if (!/^\d+$/.test(value)) { setError(name, 'Numbers only, please.'); return false; }
        break;
      case 'mobile':
        if (value && !/^\d{10}$/.test(value)) { setError(name, 'Enter a valid 10-digit number.'); return false; }
        break;
      case 'email':
        if (!value) { setError(name, 'Email address is required.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setError(name, 'Enter a valid email address.'); return false; }
        break;
      case 'pincode':
        if (!value) { setError(name, 'Pincode is required.'); return false; }
        if (!/^\d{6}$/.test(value)) { setError(name, 'Enter a valid 6-digit pincode.'); return false; }
        break;
      case 'accidentDescription': {
        if (!value) { setError(name, 'Please describe what happened.'); return false; }
        const words = value.split(/\s+/).filter(Boolean).length;
        if (words > 100) { setError(name, 'Keep the description to 100 words or fewer.'); return false; }
        break;
      }
      default:
        if (REQUIRED_FIELDS[currentSectionOf(name)] && REQUIRED_FIELDS[currentSectionOf(name)].includes(name) && !value) {
          setError(name, 'This field is required.');
          return false;
        }
    }
    setError(name, '');
    return true;
  }

  function currentSectionOf(name) {
    for (const key in REQUIRED_FIELDS) {
      if (REQUIRED_FIELDS[key].includes(name)) return key;
    }
    return null;
  }

  function validateContactPair() {
    const mobileReq = document.getElementById('mobileReq');
    if (mobileReq) mobileReq.hidden = true;
    // Email is always required; validate both fields independently
    const mobileValid = validateField('mobile');
    const emailValid  = validateField('email');
    return mobileValid && emailValid;
  }

  function validateSection(key) {
    let ok = true;
    (REQUIRED_FIELDS[key] || []).forEach(name => {
      if (!validateField(name)) ok = false;
    });
    if (key === 'employee') {
      if (!validateContactPair()) ok = false;
    }
    return ok;
  }

  /* ---------------- Progressive disclosure ---------------- */
  function revealNext() {
    if (!currentFlow) return;
    const sections = currentFlow.sections;
    const lastRevealed = revealedSections[revealedSections.length - 1];
    const lastValid = validateSection(lastRevealed);

    if (lastValid) {
      completedSections.add(lastRevealed);
      const idx = sections.indexOf(lastRevealed);
      const nextKey = sections[idx + 1];
      if (nextKey && !revealedSections.includes(nextKey)) {
        revealedSections.push(nextKey);
        const nextSection = document.getElementById('section-' + nextKey);
        nextSection.classList.remove('is-hidden');
        window.requestAnimationFrame(() => {
          nextSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    } else {
      completedSections.delete(lastRevealed);
    }
    renderRail();
    updateFooterState();
  }

  function updateFooterState() {
    const sections = currentFlow ? currentFlow.sections : [];
    const allDone = sections.length > 0 && sections.every(s => completedSections.has(s));
    submitBtn.disabled = !allDone;
    if (!currentFlow) {
      formHint.textContent = 'Select an intimation type above to begin.';
    } else if (!allDone) {
      const remaining = sections.filter(s => !completedSections.has(s));
      formHint.textContent = `Complete "${SECTION_LABELS[remaining[0]]}" to continue.`;
    } else {
      formHint.textContent = 'All set — review your details and submit when ready.';
    }
  }

  /* ---------------- Type selection ---------------- */
  const intimationForSelect = document.getElementById('intimationFor');
  const policyNumberInput = document.getElementById('policyNumber');
  const mediclaimSection = document.getElementById('section-mediclaim');
  const gpaSection = document.getElementById('section-gpa');
  const mediclaimNotice = document.getElementById('mediclaimNotice');
  const gpaNotice = document.getElementById('gpaNotice');

  intimationForSelect.addEventListener('change', () => {
    const type = intimationForSelect.value;
    const flow = FLOWS[type];
    currentFlow = flow;
    policyNumberInput.value = flow.policy;
    setError('intimationFor', '');
    setError('policyNumber', '');

    // Reset all downstream sections
    ['employee', 'patient', 'mediclaim', 'gpa', 'hospital', 'declaration'].forEach(key => {
      const sec = document.getElementById('section-' + key);
      if (sec) sec.classList.add('is-hidden');
    });
    revealedSections = ['type'];
    completedSections.clear();

    // Toggle mediclaim vs gpa specific blocks
    const isGpa = type === 'GPA';
    mediclaimSection.classList.toggle('is-hidden', isGpa);
    gpaSection.classList.toggle('is-hidden', !isGpa);
    mediclaimNotice.classList.toggle('is-hidden', isGpa);
    gpaNotice.classList.toggle('is-hidden', !isGpa);

    renderRail();
    revealNext();
  });

  /* ---------------- Live validation + progressive reveal wiring ---------------- */
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!name) return;
    if (name === 'accidentDescription') updateWordCounter();
    if (name === 'mobile' || name === 'email') validateContactPair();
    else validateField(name);
  });

  form.addEventListener('change', (e) => {
    const name = e.target.name;
    if (!name || name === 'intimationFor') return;
    revealNext();
  });

  form.addEventListener('focusout', (e) => {
    const name = e.target.name;
    if (!name || name === 'intimationFor') return;
    revealNext();
  });

  /* ---------------- Word counter ---------------- */
  const accidentDescription = document.getElementById('accidentDescription');
  const wordCounter = document.getElementById('wordCounter');

  function updateWordCounter() {
    const words = (accidentDescription.value || '').trim().split(/\s+/).filter(Boolean).length;
    wordCounter.textContent = `${words} / 100 words`;
    wordCounter.classList.toggle('is-over', words > 100);
  }
  if (accidentDescription) accidentDescription.addEventListener('input', updateWordCounter);

  /* ---------------- Pincode → city / state auto-fill ---------------- */
  const pincodeInput = document.getElementById('pincode');
  const cityInput    = document.getElementById('city');
  const stateInput   = document.getElementById('state');
  let pincodeTimer   = null;

  async function lookupPincode(pin) {
    cityInput.placeholder  = 'Looking up…';
    stateInput.placeholder = 'Looking up…';
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (
        Array.isArray(data) &&
        data[0].Status === 'Success' &&
        data[0].PostOffice &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        cityInput.value    = po.District || po.Name || '';
        stateInput.value   = po.State    || '';
        cityInput.placeholder  = 'Auto-filled from pincode';
        stateInput.placeholder = 'Auto-filled from pincode';
      } else {
        cityInput.value    = '';
        stateInput.value   = '';
        cityInput.placeholder  = 'Pincode not found';
        stateInput.placeholder = 'Pincode not found';
      }
    } catch {
      cityInput.placeholder  = 'Lookup failed';
      stateInput.placeholder = 'Lookup failed';
    }
  }

  pincodeInput.addEventListener('input', () => {
    const pin = pincodeInput.value.trim();
    /* Clear previous auto-fill whenever user edits */
    cityInput.value  = '';
    stateInput.value = '';
    clearTimeout(pincodeTimer);
    if (/^\d{6}$/.test(pin)) {
      /* Debounce 400 ms so we don't fire on every keystroke */
      pincodeTimer = setTimeout(() => lookupPincode(pin), 400);
    } else {
      cityInput.placeholder  = 'Auto-filled from pincode';
      stateInput.placeholder = 'Auto-filled from pincode';
    }
  });

  /* ---------------- Doctor name prefix guard ---------------- */
  const doctorNameInput = document.getElementById('doctorName');
  const DR_PREFIX = 'Dr. ';

  doctorNameInput.addEventListener('input', () => {
    if (!doctorNameInput.value.startsWith(DR_PREFIX)) {
      /* Restore the prefix, keep whatever the user typed after it */
      const stripped = doctorNameInput.value.replace(/^Dr\.?\s*/i, '');
      doctorNameInput.value = DR_PREFIX + stripped;
    }
  });

  /* Also guard against select-all + delete via keydown */
  doctorNameInput.addEventListener('keydown', (e) => {
    const val = doctorNameInput.value;
    const selStart = doctorNameInput.selectionStart;
    const selEnd   = doctorNameInput.selectionEnd;

    const deletesPrefix =
      (e.key === 'Backspace' && selStart <= DR_PREFIX.length && selStart !== selEnd && selEnd > 0) ||
      (e.key === 'Delete'    && selStart < DR_PREFIX.length);

    if (deletesPrefix) {
      e.preventDefault();
      /* Move cursor to end of prefix */
      doctorNameInput.setSelectionRange(DR_PREFIX.length, DR_PREFIX.length);
    }
  });

  /* On focus, always place cursor at end of prefix if field only has prefix */
  doctorNameInput.addEventListener('focus', () => {
    if (doctorNameInput.value === DR_PREFIX) {
      doctorNameInput.setSelectionRange(DR_PREFIX.length, DR_PREFIX.length);
    }
  });

  /* ---------------- Submission ---------------- */
  const successModal = document.getElementById('successModal');
  const errorModal = document.getElementById('errorModal');
  const referenceLine = document.getElementById('referenceLine');

  function openModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  function generateReference(type) {
    // Reference number is now generated server-side as UNISON-001, UNISON-002, etc.
    // This fallback is only used if the backend is unreachable.
    const prefix = type === 'GPA' ? 'GPA' : 'GMC';
    const now = new Date();
    return `${prefix}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function validateAll() {
    if (!currentFlow) return false;
    let ok = true;
    currentFlow.sections.forEach(key => {
      if (!validateSection(key)) ok = false;
    });
    renderRail();
    updateFooterState();
    return ok;
  }

  /* ============================================================
     EmailJS — custom HTML table email sent directly from the
     browser. No backend relay, no SMTP credentials needed.

     ONE-TIME SETUP (takes ~5 min):
       1. Sign up free → https://www.emailjs.com
          Free tier: 200 emails / month, no credit card.
       2. Email Services → Add Service → connect Gmail
          Copy the Service ID  (looks like "service_xxxxxxx")
       3. Email Templates → Create Template
          • "To Email" field  → harinimudaliar1503@gmail.com
          • "Subject" field   → {{subject}}
          • Switch to HTML tab, paste ONLY this one line:
              {{{html_content}}}
            (triple braces tells EmailJS not to escape the HTML)
          • Save → copy the Template ID (e.g. "template_xxxxxxx")
       4. Account → General → API Keys → copy Public Key
       5. Paste the three values below and restart the server.
     ============================================================ */
  const EMAILJS_PUBLIC_KEY      = 'uISUyCh2L13RCJtA9';
  const EMAILJS_SERVICE_ID      = 'service_qzhzz19';
  const EMAILJS_TEMPLATE_ID     = 'template_9egpfbf';  // desk notification template
  const EMAILJS_USER_TEMPLATE_ID = 'template_zvjipww'; // ← replace with your USER confirmation template ID

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  /* ── helpers ── */
  function esc(v) {
    return (v == null || String(v).trim() === '') ? '—' : String(v).trim();
  }

  function fmtDate(raw) {
    if (!raw) return '—';
    try {
      return new Date(raw).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return raw; }
  }

  /* ── HTML table builder ── */
  function buildHtmlTable(payload, ref, isGpa) {
    const fullName = [
      payload.firstName,
      payload.middleName,
      payload.surname
    ].filter(Boolean).join(' ');

    const submittedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const S = {
      wrapper: 'margin:0;padding:25px 0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;',
      card: 'width:100%;max-width:650px;margin:0 auto;background:#ffffff;border:1px solid #d9dee5;border-radius:4px;overflow:hidden;border-collapse:collapse;',
      header: 'background:#17365d;padding:24px 30px;text-align:left;',
      ref: 'background:#eaf0f7;padding:12px 30px;border-bottom:1px solid #d9dee5;',
      intro: 'background:#ffffff;padding:22px 30px 15px;',
      tableWrap: 'background:#ffffff;padding:10px 30px 25px;',
      inner: 'width:100%;border-collapse:collapse;border:1px solid #d9dee5;',
      secHead: 'padding:10px 13px;background:#17365d;color:#ffffff;font-size:11px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase;',
      labelCell: 'padding:9px 13px;width:40%;background:#f5f7fa;color:#4b5563;font-size:12px;font-weight:bold;border-bottom:1px solid #d9dee5;vertical-align:top;',
      valueCell: 'padding:9px 13px;color:#1f2937;font-size:12px;border-bottom:1px solid #d9dee5;vertical-align:top;',
      nextSteps: 'background:#f7f9fb;padding:18px 30px;border-top:1px solid #d9dee5;',
      footer: 'background:#17365d;padding:15px 30px;text-align:center;'
    };

    const row = (label, value) => `
    <tr>
      <td style="${S.labelCell}">${label}</td>
      <td style="${S.valueCell}">${esc(value || '—')}</td>
    </tr>
  `;

    const sec = (title) => `
    <tr>
      <td colspan="2" style="${S.secHead}">${title}</td>
    </tr>
  `;

    const detailRows = isGpa ? `
    ${sec('ACCIDENT DETAILS')}
    ${row('Accident Location', payload.accidentLocation)}
    ${row('Accident Description', payload.accidentDescription)}
    ${row('Injury Description', payload.injuryDescription)}
    ${row('Date & Time', fmtDate(payload.accidentDateTime))}
    ${row('FIR Details', payload.firDetails)}
  ` : `
    ${sec('HOSPITALISATION DETAILS')}
    ${row('Reason / Diagnosis', payload.diagnosis)}
    ${row('Nature of Treatment', payload.treatmentNature)}
    ${row('Date of Admission', fmtDate(payload.admissionDateTime))}
  `;

    const nextStepsTxt = isGpa
      ? `Please submit the completed claim form along with the original bills, pathology reports, radiology films, fitness certificate, last 3 months' salary slips, PAN card, Aadhaar card (KYC) and cancelled cheque within <strong>10 days</strong> from the date of the fitness certificate.`
      : `Please submit the completed claim form along with the original bills, pathology reports, radiology films, discharge summary, indoor case papers, PAN card, Aadhaar card (KYC) and cancelled cheque within <strong>20 days</strong> from the date of discharge.`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Claim Intimation Confirmation</title>
</head>

<body style="${S.wrapper}">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:25px 0;">
<tr>
<td align="center">

<table cellpadding="0" cellspacing="0" style="${S.card}">

  <!-- HEADER -->
  <tr>
    <td style="${S.header}">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">
        Claim Intimation Confirmation
      </h1>

      <p style="margin:7px 0 0;color:#dbe5ef;font-size:12px;">
        Your intimation has been successfully registered.
      </p>
    </td>
  </tr>

  <!-- INTRODUCTION -->
  <tr>
    <td style="${S.intro}">

      <p style="margin:0 0 4px;color:#6b7280;font-size:11px;">
        Date of Submission
      </p>

      <p style="margin:0 0 16px;color:#111827;font-size:13px;font-weight:bold;">
        ${submittedOn}
      </p>

      <p style="margin:0;color:#374151;font-size:12px;line-height:1.7;">
        Dear ${esc(fullName)},
        <br><br>

        This is to confirm that your
        <strong>${esc(FLOWS[payload.intimationFor]?.label || payload.intimationFor)}</strong>
        intimation under policy number
        <strong>${esc(payload.policyNumber)}</strong>
        has been received and registered successfully.
      </p>

    </td>
  </tr>

  <!-- DETAILS -->
  <tr>
    <td style="${S.tableWrap}">

      <table cellpadding="0" cellspacing="0" style="${S.inner}">

        ${sec('CLAIM INFORMATION')}
        ${row('Reference Number', ref)}
        ${row('Intimation Type', FLOWS[payload.intimationFor]?.label || payload.intimationFor)}
        ${row('Policy Number', payload.policyNumber)}

        ${sec('EMPLOYEE DETAILS')}
        ${row('Employee Code', payload.employeeCode)}
        ${row('Employee Name', fullName)}
        ${row('Mobile Number', payload.mobile)}
        ${row('Email ID', payload.email)}

        ${sec('PATIENT DETAILS')}
        ${row('Patient Name', payload.patientName)}
        ${row('Relationship', payload.relationship)}

        ${detailRows}

        ${sec('HOSPITAL & DOCTOR DETAILS')}
        ${row('Doctor Name & Degree', payload.doctorName)}
        ${row('Hospital Name', payload.hospitalName)}
        ${row('Hospital Address', payload.hospitalAddress)}
        ${row('City', payload.city)}
        ${row('State', payload.state)}
        ${row('Pincode', payload.pincode)}

      </table>

    </td>
  </tr>

  <!-- NEXT STEPS -->
  <tr>
    <td style="${S.nextSteps}">
      <h2 style="margin:0 0 8px;color:#17365d;font-size:14px;font-weight:bold;">RAVI MUDALIAR</h2>
      <h4>UNISON PHARMACEUTICALS PVT.LTD </h4>
      <p style="margin:0 0 8px;color:#17365d;font-size:12px;font-weight:bold;">
        “Unison House”, Near Prernatirth Derasar,
Jodhpur, Satellite, Ahmedabad-380015
Mob: No. 9979894549  (O) 9909006464-65-66
Website: <a>www.unisonpharmaceuticals.com</a>
      </p>

      <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.7;">
        <strong><u>Disclaimer:</u></strong> The contents of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information and may be legally protected from disclosure. If you are not the intended recipient of this message or their agent, or if this message has been addressed to you in error, please immediately alert the sender by reply email and then delete this message and any attachments. If you are not the intended recipient, you are hereby notified that any use, dissemination, copying, or storage of this message or its attachments is strictly prohibited. 
      </p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="${S.footer}">

      <p style="margin:0;color:#dbe5ef;font-size:10px;line-height:1.7;">
        This is an automated email from the Employee Benefits & Insurance Desk.<br>
        For any assistance, please contact your HR representative.
      </p>

      <p style="margin:8px 0 0;color:#b8c7d9;font-size:10px;">
        Please retain copies of all documents submitted until final claim settlement.
      </p>

    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
  }

  // const DESK_RECIPIENTS = [
  //   'harinimudaliar1503@gmail.com',
  //   'harini.mudaliar@uffizio.com'
  // ];

  const DESK_RECIPIENTS = [
    'ravi@unisonpharmaceuticals.com',
    'bhautikpatel@unisonpharmaceuticals.com'
  ];

  async function sendNotificationEmail(payload, ref, isGpa) {
    const fullName = [payload.firstName, payload.middleName, payload.surname].filter(Boolean).join(' ');
    const subject  = `[${isGpa ? 'GPA' : 'GMC'}] Intimation Received \u2014 ${fullName} (${ref})`;
    const html     = buildHtmlTable(payload, ref, isGpa);

    /* Fire one send per desk recipient in parallel */
    const sends = DESK_RECIPIENTS.map(email =>
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email:     email,
        subject,
        html_content: html
      })
    );

    const results = await Promise.allSettled(sends);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Desk email to ${DESK_RECIPIENTS[i]} failed:`, r.reason);
      }
    });

    /* Succeed as long as at least one desk email went through */
    const anyOk = results.some(r => r.status === 'fulfilled' && r.value.status === 200);
    if (!anyOk) throw new Error('All desk notification emails failed.');
    return results;
  }

  /* ── PDF asset paths — absolute so email clients can fetch them ── */
  const BASE_URL = window.location.origin;
  const PDF_ASSETS = {
    mediclaim: `${BASE_URL}/assets/VOLO%20Claim%20forms.%20(1).pdf`,
    gpa:       `${BASE_URL}/assets/Orient-Personal%20Accident%20Claim%20Form.pdf`
  };

  /* ── User-facing confirmation email HTML ── */
  function buildUserConfirmationHtml(payload, ref, isGpa) {
    const fullName   = [payload.firstName, payload.middleName, payload.surname].filter(Boolean).join(' ');
    const claimLabel = FLOWS[payload.intimationFor]?.label || payload.intimationFor;
    const pdfUrl     = isGpa ? PDF_ASSETS.gpa : PDF_ASSETS.mediclaim;
    const pdfName    = isGpa
      ? 'Personal Accident Claim Form'
      : 'Mediclaim Claim Form';

    const submittedOn = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const nextSteps = isGpa
      ? `Submit the completed claim form along with original bills, pathology reports, radiology films,
         fitness certificate, last 3&nbsp;months' salary slips, PAN card, Aadhaar card (KYC) and a
         cancelled cheque within <strong>10 days</strong> of the fitness certificate.`
      : `Submit the completed claim form along with original bills, pathology reports, radiology films,
         discharge summary, indoor case papers, PAN card, Aadhaar card (KYC) and a cancelled cheque
         within <strong>20 days</strong> of discharge from hospital.`;

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Claim Intimation Received</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:30px 0;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" width="600"
       style="max-width:600px;width:100%;background:#ffffff;border-radius:6px;
              overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);border-collapse:collapse;">

  <!-- HEADER -->
  <tr>
    <td style="background:#17365d;padding:30px 32px;text-align:center;">
      <p style="margin:0 0 6px;color:#a8c4e0;font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:bold;">
        Employee Benefits &amp; Insurance Desk
      </p>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">
        Your Intimation is Registered ✓
      </h1>
    </td>
  </tr>

  <!-- GREETING -->
  <tr>
    <td style="padding:28px 32px 0;color:#1f2937;font-size:14px;line-height:1.7;">
      Dear <strong>${esc(fullName)}</strong>,
      <br/><br/>
      Your <strong>${esc(claimLabel)}</strong> intimation has been successfully registered.
      Please keep the reference number below for all future correspondence.
    </td>
  </tr>

  <!-- REFERENCE BADGE -->
  <tr>
    <td style="padding:20px 32px;">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="background:#eaf2fb;border:1px solid #b8d4ec;border-radius:6px;
                     padding:16px 20px;text-align:center;">
            <p style="margin:0 0 4px;color:#4b6e91;font-size:11px;text-transform:uppercase;
                      letter-spacing:.08em;font-weight:bold;">Reference ID</p>
            <p style="margin:0;color:#17365d;font-size:22px;font-weight:bold;
                      font-family:monospace;letter-spacing:.05em;">${esc(ref)}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:11px;">Submitted on ${submittedOn}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SUMMARY TABLE -->
  <tr>
    <td style="padding:0 32px 24px;">
      <p style="margin:0 0 10px;color:#17365d;font-size:12px;font-weight:bold;
                text-transform:uppercase;letter-spacing:.06em;">Submission Summary</p>
      <table cellpadding="0" cellspacing="0" width="100%"
             style="border-collapse:collapse;border:1px solid #dde3ea;border-radius:4px;overflow:hidden;">

        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-bottom:1px solid #dde3ea;width:42%;">Intimation Type</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-bottom:1px solid #dde3ea;">${esc(claimLabel)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-bottom:1px solid #dde3ea;">Policy Number</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-bottom:1px solid #dde3ea;">${esc(payload.policyNumber)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-bottom:1px solid #dde3ea;">Employee Code</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-bottom:1px solid #dde3ea;">${esc(payload.employeeCode)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-bottom:1px solid #dde3ea;">Patient Name</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-bottom:1px solid #dde3ea;">${esc(payload.patientName)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;">Relationship</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;">
            ${esc(payload.relationship)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-top:1px solid #dde3ea;border-bottom:1px solid #dde3ea;">Hospital Name</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-top:1px solid #dde3ea;border-bottom:1px solid #dde3ea;">${esc(payload.hospitalName)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;border-bottom:1px solid #dde3ea;">City</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;
                     border-bottom:1px solid #dde3ea;">${esc(payload.city)}</td>
        </tr>
        <tr>
          <td style="padding:9px 14px;background:#f5f7fa;color:#4b5563;font-size:12px;
                     font-weight:bold;">State</td>
          <td style="padding:9px 14px;color:#1f2937;font-size:12px;">
            ${esc(payload.state)}</td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- DOWNLOAD BUTTON -->
  <tr>
    <td style="padding:0 32px 28px;text-align:center;">
      <p style="margin:0 0 14px;color:#374151;font-size:13px;line-height:1.6;">
        Download and fill the <strong>${pdfName}</strong> and submit it along with
        the required documents.
      </p>
      <a href="${pdfUrl}"
         style="display:inline-block;background:#17365d;color:#ffffff;font-size:13px;
                font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:5px;
                letter-spacing:.03em;">
        ↓ &nbsp; Download ${pdfName}
      </a>
    </td>
  </tr>

  <!-- NEXT STEPS -->
  <tr>
    <td style="background:#f7f9fb;border-top:1px solid #dde3ea;padding:20px 32px;">
      <p style="margin:0 0 8px;color:#17365d;font-size:12px;font-weight:bold;
                text-transform:uppercase;letter-spacing:.05em;">Next Steps</p>
      <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.7;">${nextSteps}</p>
    </td>
  </tr>

  <!-- SIGNATURE -->
  <tr>
    <td style="padding:20px 32px;border-top:1px solid #dde3ea;">
      <p style="margin:0 0 2px;color:#17365d;font-size:13px;font-weight:bold;">RAVI MUDALIAR</p>
      <p style="margin:0 0 2px;color:#374151;font-size:12px;">UNISON PHARMACEUTICALS PVT. LTD.</p>
      <p style="margin:0 0 2px;color:#6b7280;font-size:11px;line-height:1.6;">
        "Unison House", Near Prernatirth Derasar, Jodhpur, Satellite, Ahmedabad - 380015<br/>
        Mob: 9979894549 &nbsp;|&nbsp; Office: 9909006464 / 65 / 66
      </p>
      <p style="margin:6px 0 0;">
        <a href="http://www.unisonpharmaceuticals.com"
           style="color:#17365d;font-size:11px;">www.unisonpharmaceuticals.com</a>
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#17365d;padding:16px 32px;text-align:center;">
      <p style="margin:0;color:#a8c4e0;font-size:10px;line-height:1.7;">
        This is an automated confirmation from the Employee Benefits &amp; Insurance Desk.<br/>
        Please do not reply to this email. Contact your HR representative for assistance.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body></html>`;
  }

  async function sendUserConfirmationEmail(payload, ref, isGpa) {
    const fullName = [payload.firstName, payload.middleName, payload.surname].filter(Boolean).join(' ');
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_USER_TEMPLATE_ID,
      {
        to_email:     payload.email,
        subject:      `Intimation Registered — ${fullName} (${ref})`,
        html_content: buildUserConfirmationHtml(payload, ref, isGpa)
      }
    );
    if (result.status !== 200) {
      throw new Error(`EmailJS user email error: status ${result.status}`);
    }
    return result;
  }

  /* ------------------------------------------------------------
     Backend storage — saves the raw submission to your own API.
     Runs in parallel with the email so a hiccup in one doesn't
     block the other.
     ------------------------------------------------------------ */
  async function saveToBackend(payload, ref, idempotencyKey) {
    const response = await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({ ...payload, referenceNo: ref })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Backend responded with an error.');
    }
    return data;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      const firstError = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
      if (firstError) {
        firstError.closest('.fieldset').classList.remove('is-hidden');
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus({ preventScroll: true });
      }
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    const type = intimationForSelect.value;
    const isGpa = type === 'GPA';

    const payload = {
      formType: isGpa ? 'GPA' : 'GMC',
      intimationFor: type,
      policyNumber: form.elements['policyNumber'].value.trim(),
      employeeCode: form.elements['employeeCode'].value.trim(),
      firstName: form.elements['firstName'].value.trim(),
      middleName: (form.elements['middleName'].value || '').trim(),
      surname: form.elements['surname'].value.trim(),
      mobile: (form.elements['mobile'].value || '').trim(),
      email: (form.elements['email'].value || '').trim(),
      patientName: form.elements['patientName'].value.trim(),
      relationship: form.elements['relationship'].value,
      doctorName: form.elements['doctorName'].value.trim(),
      hospitalName: form.elements['hospitalName'].value.trim(),
      hospitalAddress: form.elements['hospitalAddress'].value.trim(),
      pincode: form.elements['pincode'].value.trim(),
      city: (form.elements['city'].value || '').trim(),
      state: (form.elements['state'].value || '').trim(),
      agree: form.elements['agree'].checked
    };

    if (isGpa) {
      payload.accidentLocation = form.elements['accidentLocation'].value.trim();
      payload.accidentDescription = form.elements['accidentDescription'].value.trim();
      payload.injuryDescription = form.elements['injuryDescription'].value.trim();
      payload.accidentDateTime = form.elements['accidentDateTime'].value;
      payload.firDetails = (form.elements['firDetails'].value || '').trim();
    } else {
      payload.diagnosis = form.elements['diagnosis'].value.trim();
      payload.treatmentNature = form.elements['treatmentNature'].value.trim();
      payload.admissionDateTime = form.elements['admissionDateTime'].value;
    }

    const ref = generateReference(type);  // fallback only
    const idempotencyKey = `${payload.employeeCode}-${Date.now()}`;

    /* Save to backend first to get the real UNISON-XXX reference number */
    let finalRef = ref;
    let backendOk = false;

    try {
      const data = await saveToBackend(payload, ref, idempotencyKey);
      finalRef = data.referenceNo || ref;
      backendOk = true;
    } catch (err) {
      console.warn('Backend save failed:', err);
    }

    /* Fire both emails in parallel using the real reference number */
    const [emailOutcome, userEmailOutcome] = await Promise.allSettled([
      sendNotificationEmail(payload, finalRef, isGpa),
      sendUserConfirmationEmail(payload, finalRef, isGpa)
    ]);

    submitBtn.classList.remove('is-loading');

    const emailOk     = emailOutcome.status     === 'fulfilled';
    const userEmailOk = userEmailOutcome.status === 'fulfilled';

    if (!emailOk)     console.warn('Desk notification failed:',  emailOutcome.reason);
    if (!userEmailOk) console.warn('User confirmation failed:',  userEmailOutcome.reason);

    if (backendOk || emailOk) {
      referenceLine.textContent = `Reference ID: ${finalRef}`;

      let message = 'Your form has been recorded';
      if (emailOk && userEmailOk) {
        message += `. A confirmation email with your claim form has been sent to ${payload.email}.`;
      } else if (emailOk && !userEmailOk) {
        message += '. The desk was notified, but your confirmation email could not be sent.';
      } else {
        message += ' and the desk was notified.';
      }
      document.getElementById('successMessage').textContent = message;
      openModal(successModal);
    } else {
      submitBtn.disabled = false;
      document.getElementById('errorMessage').textContent =
        'Could not save or email your submission. Please check your connection and try again.';
      openModal(errorModal);
    }
  });

  document.getElementById('successCloseBtn').addEventListener('click', () => {
    closeModal(successModal);
    form.reset();
    currentFlow = null;
    revealedSections = ['type'];
    completedSections.clear();
    ['employee', 'patient', 'mediclaim', 'gpa', 'hospital', 'declaration'].forEach(key => {
      const sec = document.getElementById('section-' + key);
      if (sec) sec.classList.add('is-hidden');
    });
    document.querySelectorAll('.field').forEach(f => f.classList.remove('has-error', 'is-valid'));
    policyNumberInput.value = '';
    doctorNameInput.value = DR_PREFIX;
    cityInput.value  = '';
    stateInput.value = '';
    updateWordCounter();
    renderRail();
    updateFooterState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('errorCloseBtn').addEventListener('click', () => closeModal(errorModal));
  document.getElementById('errorRetryBtn').addEventListener('click', () => {
    closeModal(errorModal);
    form.requestSubmit();
  });

  /* ---------------- Init ---------------- */
  renderRail();
  updateFooterState();
  updateWordCounter();
})();