
const plans = [
  { name: "Arcade", monthly: 9, yearly: 90 },
  { name: "Advanced", monthly: 12, yearly: 120 },
  { name: "Pro", monthly: 15, yearly: 150 }
];

const addons = [
  {
    id: "online",
    name: "Online service",
    monthly: 1,
    yearly: 10
  },
  {
    id: "storage",
    name: "Larger storage",
    monthly: 2,
    yearly: 20
  },
  {
    id: "profile",
    name: "Customizable Profile",
    monthly: 2,
    yearly: 20
  }
];

let currentStep = 1;
let selectedPlan = null;
let isYearly = false;

const selectedAddons = new Set();

const personalForm = document.getElementById("personal-form");

const stepElements = {
  2: document.getElementById("plan-step"),
  3: document.getElementById("addons-step"),
  4: document.getElementById("summary-step"),
  5: document.getElementById("thank-you-step")
};

const nameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");

const personalInputs = [nameInput, emailInput, phoneInput];

function price(amount) {
  return `$${amount}/${isYearly ? "yr" : "mo"}`;
}

function getPriceKey() {
  return isYearly ? "yearly" : "monthly";
}

function showError(input, message) {
  input.setCustomValidity(message);
  input.setAttribute("aria-invalid", "true");

  document.getElementById(`${input.name}-error`).textContent = message;
}

function clearError(input) {
  input.setCustomValidity("");
  input.removeAttribute("aria-invalid");

  document.getElementById(`${input.name}-error`).textContent = "";
}

function validatePersonalInfo() {
  // Clear stale custom errors first, so the browser evaluates
  // the current input values and their native validity rules.
  personalInputs.forEach(clearError);

  for (const input of personalInputs) {
    if (!input.checkValidity()) {
      const message = input.validity.valueMissing
        ? "This field is required"
        : input.validity.typeMismatch
          ? "Please enter a valid email address"
          : "Please enter a valid value";

      showError(input, message);
      input.reportValidity();
      input.focus();
      return false;
    }

    // Prevent names or phone numbers containing only whitespace.
    if (!input.value.trim()) {
      showError(input, "This field is required");
      input.reportValidity();
      input.focus();
      return false;
    }
  }

  return true;
}

personalInputs.forEach((input) => {
  input.addEventListener("input", () => {
    clearError(input);
  });
});

function updateStepIndicator() {
  document.querySelectorAll(".step-number").forEach((indicator) => {
    const number = Number(indicator.dataset.step);
    const active = number === currentStep;

    indicator.classList.toggle("active", active);

    if (active) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
  });
}

function renderPlanPrices() {
  const key = getPriceKey();

  document.querySelectorAll(".plan_card").forEach((card, index) => {
    const plan = plans[index];

    card.querySelector(".plan-price").textContent = price(plan[key]);
    card.querySelector(".yearly-benefit").hidden = !isYearly;
  });

  document.querySelectorAll(".addon_card").forEach((card) => {
    const id = card.querySelector('input[type="checkbox"]').value;
    const addon = addons.find((item) => item.id === id);

    card.querySelector(".addon-price").textContent = `+${price(addon[key])}`;
  });
}

function renderBillingToggle() {
  const toggle = document.getElementById("billing-toggle");

  toggle.setAttribute("aria-checked", String(isYearly));

  document.getElementById("monthly-label").classList.toggle(
    "billing-active",
    !isYearly
  );

  document.getElementById("yearly-label").classList.toggle(
    "billing-active",
    isYearly
  );
}

function renderPlanSelection() {
  document.querySelectorAll(".plan_card").forEach((card, index) => {
    const selected = selectedPlan === index;

    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
}

function renderAddonSelection() {
  document.querySelectorAll(".addon_card").forEach((card) => {
    const checkbox = card.querySelector('input[type="checkbox"]');

    checkbox.checked = selectedAddons.has(checkbox.value);
    card.classList.toggle("selected", checkbox.checked);
  });
}

function renderSummary() {
  if (selectedPlan === null) return;

  const plan = plans[selectedPlan];
  const key = getPriceKey();

  document.getElementById("summary-plan-name").textContent =
    `${plan.name} (${isYearly ? "Yearly" : "Monthly"})`;

  document.getElementById("summary-plan-price").textContent =
    price(plan[key]);

  const summaryAddons = document.getElementById("summary-addons");
  summaryAddons.replaceChildren();

  let total = plan[key];

  addons
    .filter((addon) => selectedAddons.has(addon.id))
    .forEach((addon) => {
      total += addon[key];

      const row = document.createElement("div");
      row.className = "summary-line";

      const name = document.createElement("span");
      name.textContent = addon.name;

      const amount = document.createElement("strong");
      amount.textContent = `+${price(addon[key])}`;

      row.append(name, amount);
      summaryAddons.appendChild(row);
    });

  document.getElementById("total-label").textContent =
    `Total (per ${isYearly ? "year" : "month"})`;

  document.getElementById("summary-total").textContent = `+${price(total)}`;
}

function updateNextButton() {
  // Only one visible action should match #next-button at a time.
  document.querySelectorAll("#next-button").forEach((button) => {
    button.removeAttribute("id");
  });

  let activeButton;

  if (currentStep === 1) {
    activeButton = personalForm.querySelector('button[type="submit"]');
  } else if (currentStep === 2 || currentStep === 3) {
    activeButton = stepElements[currentStep].querySelector(".next-step-button");
  } else if (currentStep === 4) {
    activeButton = document.getElementById("confirm-button");
  }

  if (activeButton) {
    activeButton.id = "next-button";
  }
}

function renderStep() {
  personalForm.hidden = currentStep !== 1;

  Object.entries(stepElements).forEach(([number, element]) => {
    element.hidden = Number(number) !== currentStep;
  });

  updateStepIndicator();
  updateNextButton();

  if (currentStep === 2) {
    renderPlanPrices();
    renderBillingToggle();
    renderPlanSelection();
    document.getElementById("plan-error").textContent = "";
  }

  if (currentStep === 3) {
    renderAddonSelection();
  }

  if (currentStep === 4) {
    renderSummary();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToStep(step) {
  currentStep = step;
  renderStep();
}

personalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (validatePersonalInfo()) {
    goToStep(2);
  }
});

document.querySelectorAll(".plan_card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedPlan = Number(card.dataset.plan);

    renderPlanSelection();
    document.getElementById("plan-error").textContent = "";
  });
});

document.getElementById("billing-toggle").addEventListener("click", () => {
  isYearly = !isYearly;

  renderBillingToggle();
  renderPlanPrices();
  renderAddonSelection();

  if (currentStep === 4) {
    renderSummary();
  }
});

document.querySelectorAll(".next-step-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentStep === 2 && selectedPlan === null) {
      document.getElementById("plan-error").textContent =
        "Please select a plan";
      return;
    }

    goToStep(currentStep + 1);
  });
});

document.querySelectorAll(".back-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  });
});

document.querySelectorAll('.addon_card input[type="checkbox"]').forEach(
  (checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedAddons.add(checkbox.value);
      } else {
        selectedAddons.delete(checkbox.value);
      }

      checkbox.closest(".addon_card").classList.toggle(
        "selected",
        checkbox.checked
      );
    });
  }
);

document.getElementById("change-plan").addEventListener("click", () => {
  goToStep(2);
});

document.getElementById("confirm-button").addEventListener("click", () => {
  goToStep(5);
});

// Initial render
renderPlanPrices();
renderBillingToggle();
renderStep();
