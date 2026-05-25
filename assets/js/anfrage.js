/* Schützenhaus Event Room — Anfrageformular */
(function () {
  "use strict";

  // Platzhalter — bitte mit echten Daten ersetzen:
  const EMAIL = "info@schuetzenhaus-eventraum.ch";
  const WHATSAPP = "41792501954"; // internationale Nummer ohne + und ohne Leerzeichen

  const form = document.getElementById("anfrageForm");
  if (!form) return;

  // Map URL-Paket -> Radio-Value
  const paketMap = {
    rundum: "Rundum sorglos (Location + Catering komplett)",
    teils: "Teils, teils (Location + Teil-Catering)",
    "freie-hand": "Freie Hand (nur Location)",
  };

  const cateringBlock = document.getElementById("cateringBlock");

  function syncCatering() {
    const checked = form.querySelector('input[name="paket"]:checked');
    const hasCatering = checked && !checked.value.startsWith("Freie Hand");
    cateringBlock.classList.toggle("is-hidden", !hasCatering);
  }

  // Paket aus URL vorauswählen
  const params = new URLSearchParams(window.location.search);
  const pre = params.get("paket");
  if (pre && paketMap[pre]) {
    const radio = form.querySelector(`input[name="paket"][value="${paketMap[pre]}"]`);
    if (radio) radio.checked = true;
  }
  syncCatering();
  form.querySelectorAll('input[name="paket"]').forEach((r) =>
    r.addEventListener("change", syncCatering)
  );

  // Hilfsfunktionen zum Auslesen
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };
  const line = (label, value) => (value ? `${label}: ${value}\n` : "");

  function buildMessage() {
    const paket = form.querySelector('input[name="paket"]:checked');
    const equipment = Array.from(
      form.querySelectorAll('input[name="equipment"]:checked')
    ).map((c) => c.value);
    const cateringVisible = !cateringBlock.classList.contains("is-hidden");

    let m = "EVENT-ANFRAGE — Schützenhaus Event Room\n";
    m += "====================================\n\n";

    m += line("Paket", paket ? paket.value : "—");
    m += line("Eventtyp", val("eventtyp"));
    const von = val("datum_von");
    const bis = val("datum_bis");
    if (von) m += `Datum: ${von}${bis ? " bis " + bis : ""}\n`;
    m += line("Anzahl Gäste", val("gaeste"));

    m += "\n— Ausstattung —\n";
    m += line("Stühle", val("eq_stuehle"));
    m += line("Grosse Tische", val("eq_tische"));
    m += line("Stehtische", val("eq_stehtische"));
    m += line("Festbänke draussen", val("eq_festbaenke"));
    if (equipment.length) m += line("Technik & Extras", equipment.join(", "));

    if (cateringVisible) {
      m += "\n— Verpflegung —\n";
      m += line("Davon vegetarisch", val("veg"));
      m += line("Davon vegan", val("vegan"));
      m += line("Allergien / Sonstiges", val("allergien"));
      m += line("Menüwunsch", val("menue"));
      m += line("Getränke & Wein", val("getraenke"));
    }

    m += "\n— Kontakt —\n";
    m += line("Name", val("kontakt_name"));
    m += line("E-Mail", val("kontakt_email"));
    m += line("Telefon", val("kontakt_tel"));

    const komm = val("kommentar");
    if (komm) m += `\nNachricht:\n${komm}\n`;

    return m;
  }

  function subject() {
    const paket = form.querySelector('input[name="paket"]:checked');
    const typ = val("eventtyp");
    const von = val("datum_von");
    let s = "Event-Anfrage";
    if (typ) s += " · " + typ;
    if (von) s += " · " + von;
    return s;
  }

  function ready() {
    // Native HTML5-Validierung der Pflichtfelder
    if (!form.reportValidity()) return false;
    return true;
  }

  document.getElementById("sendEmail").addEventListener("click", function () {
    if (!ready()) return;
    const href =
      "mailto:" +
      EMAIL +
      "?subject=" +
      encodeURIComponent(subject()) +
      "&body=" +
      encodeURIComponent(buildMessage());
    window.location.href = href;
  });

  document.getElementById("sendWhatsApp").addEventListener("click", function () {
    if (!ready()) return;
    const href =
      "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(buildMessage());
    window.open(href, "_blank", "noopener");
  });
})();
