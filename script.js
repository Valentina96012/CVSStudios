"use strict";

// ==== 1) Gift cards array with English categories & sizes ====
const giftCards = [
  {
    code: "1234213123123",
    category: "botanicals",
    size: "A3",
    description: "Botanical Art (A3)",
    redeemed: false,
  },
  {
    code: "CASA123123",
    category: "house_portraits",
    size: "A4",
    description: "House Portrait (A4)",
    redeemed: false,
  },
  {
    code: "RETRATO1231239",
    category: "personalized",
    size: "A3",
    description: "Custom Portrait (A3)",
    redeemed: false,
  },
  {
    code: "PAISAJE1231",
    category: "botanicals",
    size: "A3",
    description: "Serene Landscape (A3)",
    redeemed: false,
  },
  {
    code: "FLORES5123123",
    category: "botanicals",
    size: "A3",
    description: "Flower Bouquet (A3)",
    redeemed: false,
  },
];

// ==== 2) Load redeemed state from localStorage ====
const redeemedCodes = JSON.parse(localStorage.getItem("redeemedCodes") || "[]");
giftCards.forEach(card => {
  if (redeemedCodes.includes(card.code)) card.redeemed = true;
});

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabase = createClient(
  "https://rlmhpfneljrrvjasdokd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbWhwZm5lbGpycnZqYXNkb2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDY5NDIsImV4cCI6MjA2OTcyMjk0Mn0.UK3FtX8LxD7IT3dBDLTw56Q21OAmli7BDkls5Pp40Kc"
);

// ==== 3) Main logic on DOM ready ====
document.addEventListener("DOMContentLoaded", () => {
  // DOM references
  const form           = document.getElementById("redeem-form");
  const codeInput      = document.getElementById("code");
  const categorySelect = document.getElementById("category");
  const sizeGroup      = document.getElementById("size-group");
  const sizeSelect     = document.getElementById("size");
  const validateBtn    = document.getElementById("validate-btn");
  const msgDiv         = document.getElementById("redeem-message");
  const additional     = document.getElementById("additional-fields");
  const nameInput      = document.getElementById("user-name");
  const emailInput     = document.getElementById("user-email");
  const submitBtn      = document.getElementById("submit-btn");
  const replytoHidden  = document.getElementById("replyto-hidden");

  // Mostrar/ocultar tamaño
  function updateSizeControl() {
    if (categorySelect.value === "tattoo_design") {
      sizeGroup.style.display = "none";
      sizeSelect.disabled     = true;
    } else {
      sizeGroup.style.display = "block";
      sizeSelect.disabled     = !categorySelect.value;
    }
  }
  categorySelect.addEventListener("change", updateSizeControl);
  updateSizeControl();

  // ==== 5) Validar código al click de Validar ====
  validateBtn.addEventListener("click", async () => {
    msgDiv.textContent = "";
    msgDiv.className = "redeem-message";

    const code = form.code.value.trim().toUpperCase();
    const category = categorySelect.value;
    const size = category === "tattoo_design" ? null : sizeSelect.value;

    // validar selección de tamaño si aplica
    if (category !== "tattoo_design" && !size) {
      msgDiv.textContent = "❌ Please select a size";
      msgDiv.classList.add("error");
      return;
    }

    // ---- Aquí llamamos al RPC en lugar del array local ----
    const { data: rows, error } = await supabase.rpc("validate_giftcard", {
      p_code: code,
    });

    if (error) {
      console.error(error);
      msgDiv.textContent = "❌ Server error, try again later";
      msgDiv.classList.add("error");
      return;
    }
    if (!rows || rows.length === 0) {
      msgDiv.textContent = "❌ Gift card not found";
      msgDiv.classList.add("error");
      return;
    }

    const card = rows[0];
    // comprobamos categoría y tamaño
    if (card.category !== category || (size && card.size !== size)) {
      msgDiv.textContent = "❌ Category or size mismatch";
      msgDiv.classList.add("error");
      return;
    }
    // ahora chequeamos el campo redeem que viene de la BD
    if (card.redeem) {
      msgDiv.textContent = "❌ This gift card has already been redeemed";
      msgDiv.classList.add("error");
      return;
    }
    // -------------------------------------------------------

    // si todo bien, bloqueamos campos y mostramos siguiente paso
    msgDiv.textContent = "✅ Code validated – " + card.description;
    msgDiv.classList.add("success");

    categorySelect.disabled = true;
    sizeSelect.disabled = true;
    validateBtn.disabled = true;

    additional.classList.remove("hidden");
    submitBtn.classList.remove("hidden");
    checkSubmitBtn();
  });

  // Habilitar submit solo con nombre+email
  function checkSubmitBtn() {
    submitBtn.disabled = !(nameInput.value.trim() && emailInput.value.trim());
  }
  nameInput.addEventListener("input", checkSubmitBtn);
  emailInput.addEventListener("input", checkSubmitBtn);

  // Envío AJAX + marcado de “redeemed” **después** de enviar
  form.addEventListener("submit", e => {
    e.preventDefault();
    replytoHidden.value = emailInput.value.trim();

    msgDiv.textContent = "⏳ Submitting Request...";
    msgDiv.className   = "redeem-message";

    const data = new FormData(form);
    fetch(form.action, {
      method: form.method,
      body: data,
      headers: { "Accept": "application/json" }
    })
    .then(resp => {
      if (!resp.ok) throw new Error("Network response was not ok");
      return resp.json();
    })
    .then(async () => {
      // **1) Marcamos localmente**:
      const code     = codeInput.value.trim().toUpperCase();
      const category = categorySelect.value;
      const size     = category === "tattoo_design" ? null : sizeSelect.value;
      const card     = giftCards.find(t =>
        t.code === code &&
        t.category === category &&
        (category === "tattoo_design" || t.size === size)
      );
      if (card) {
        card.redeemed = true;
        redeemedCodes.push(card.code);
        localStorage.setItem("redeemedCodes", JSON.stringify(redeemedCodes));
      }

      // **2) Marcamos también en Supabase**:
      const { error: updateError } = await supabase
        .from('giftcards')
        .update({ redeem: true })
        .eq('code', code);
      if (updateError) {
        console.error('Error actualizando en la base de datos:', updateError);
      }

      // **3) Feedback de éxito y reset**
      msgDiv.textContent = "Your submission has been sent! I'll get back to you ASAP!";
      msgDiv.className   = "redeem-message confirm";

      setTimeout(() => {
        form.reset();
        codeInput.value         = "";
        categorySelect.value    = "";
        sizeSelect.value        = "";
        categorySelect.disabled = false;
        sizeSelect.disabled     = true;
        validateBtn.disabled    = false;
        updateSizeControl();
        additional.classList.add("hidden");
        submitBtn.classList.add("hidden");
        submitBtn.disabled      = true;
        msgDiv.textContent      = "";
        msgDiv.className        = "redeem-message";
        replytoHidden.value     = "";
      }, 2000);
    })
    .catch(err => {
      msgDiv.textContent = "There's been a problem submitting, please try again.";
      msgDiv.classList.add("error");
      console.error(err);
    });
  });
});
