/* ============================================================
   Studio Ezube — lead form submission (Aajneeti CRM)
   Wires the site's lead forms to the lead-save API.
   ============================================================ */

/* -------- Config: confirm these before going live -------- */
const LEAD_PAGE_URL = "https://studioezube.com";                 // TODO: live domain of this site
const LEAD_PROJECT_NAME = "studioezube";                         // TODO: confirm CRM project key with Aajneeti
const LEAD_API_URL = "https://apiv2.aajneetiadvertising.com/lead/save";
const LEAD_THANKYOU_URL = "/thankyou.html";
/* -------------------------------------------------------- */

let isFormSubmitted = false;
let isFormDirty = false;

function handleFormSubmit(formId) {
  const form = document.getElementById(formId);
  if (!form) {
    // Not every page has every form — silently skip if it's absent.
    return;
  }

  // Phone field: allow digits only, cap at 10 (strips letters, spaces, pastes).
  const phoneInput = form.querySelector('[name="phone"]');
  if (phoneInput) {
    phoneInput.setAttribute("maxlength", "10");
    phoneInput.addEventListener("input", function () {
      const digits = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      if (phoneInput.value !== digits) phoneInput.value = digits;
    });
    // Block non-digit key presses on desktop (control/navigation keys still work).
    phoneInput.addEventListener("keypress", function (e) {
      if (e.key.length === 1 && !/\d/.test(e.key)) e.preventDefault();
    });
  }

  // Detect typing (dirty state) so we can warn before an accidental unload.
  form.addEventListener("input", function (e) {
    const field = e.target.closest(".field");
    if (field) field.classList.remove("invalid"); // clear error styling as user fixes it

    const hasValue = Array.from(form.elements).some(
      (el) =>
        el.tagName !== "BUTTON" &&
        el.type !== "hidden" &&
        el.value &&
        el.value.trim() !== ""
    );
    isFormDirty = hasValue;
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data (site field names)
    const name = form.querySelector('[name="name"]')?.value.trim() || "";
    const phoneRaw = form.querySelector('[name="phone"]')?.value.trim() || "";
    const phone = phoneRaw.replace(/\D/g, "");
    const type = form.querySelector('[name="type"]')?.value.trim() || "";
    const area = form.querySelector('[name="area"]')?.value.trim() || "";

    // Mark invalid fields inline (matches the site's .field.invalid styling)
    const markBad = (fieldName) => {
      const el = form.querySelector('[name="' + fieldName + '"]');
      const field = el ? el.closest(".field") : null;
      if (field) field.classList.add("invalid");
    };

    // Validation for required fields (name, phone, home type)
    let missingFields = [];
    if (!name) { missingFields.push("Full name"); markBad("name"); }
    if (!phone) { missingFields.push("Phone"); markBad("phone"); }
    if (!type) { missingFields.push("Home type"); markBad("type"); }
    if (!area) { missingFields.push("Locality"); markBad("area"); }

    if (missingFields.length > 0) {
      Swal.fire({
        title: "Missing details",
        text: `Please fill out: ${missingFields.join(", ")}`,
        icon: "warning",
        confirmButtonText: "Close",
      });
      return;
    }

    // Validate phone number length (10-digit Indian mobile)
    if (!/^\d{10}$/.test(phone)) {
      markBad("phone");
      Swal.fire({
        title: "Invalid phone number",
        text: "Please enter a valid 10-digit mobile number.",
        icon: "error",
        confirmButtonText: "Close",
      });
      return;
    }

    // Show waiting indicator
    Swal.fire({
      title: "Submitting...",
      text: "Please wait while we process your request.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const payload = {
      page_url: LEAD_PAGE_URL,
      project_name: LEAD_PROJECT_NAME,
      form_name: name,
      form_mobile: phone,
      form_city: area,
      form_select: type,
      doc_url: document.URL,
      doc_ref: document.referrer,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload),
    };

    try {
      const response = await fetch(LEAD_API_URL, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      isFormSubmitted = true;
      await response.json().catch(() => ({})); // response body isn't needed

      // Redirect to the thank-you page after a successful submission.
      window.location.href = LEAD_THANKYOU_URL;
    } catch (error) {
      console.error("Lead submission error:", error);

      Swal.fire({
        title: "Something went wrong",
        text: "There was an error submitting the form. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  });
}

// Warn if the user tries to leave with an unsent, partly-filled form.
window.addEventListener("beforeunload", function (e) {
  if (isFormDirty && !isFormSubmitted) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Initialize every lead form on the page.
function initLeadForms() {
  handleFormSubmit("heroForm");    // hero consultation form
  handleFormSubmit("contactForm"); // contact-section quote form
  handleFormSubmit("modalForm");   // pop-up lead modal
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLeadForms);
} else {
  initLeadForms();
}
