/* CONNECT — copy link, Web Share, QR and the real contact form.
 * QR comes from this site's own /api/qr; the form posts to /api/contact. */

import { $, h, clear, icon, copy, share, canShare, toast } from "./core.js";
import { openModal } from "./modal.js";
import { IDENTITY } from "./data.js";

function siteUrl() {
  return location.origin + "/";
}

/* --- QR ------------------------------------------------------------------- */

async function qrModal() {
  const canvas = h("canvas", { width: 320, height: 320, "aria-label": "Site QR kodu" });
  const frame = h("div", { class: "qrframe" },
    h("div", { style: "color:#666;font-family:var(--m);font-size:12px" }, "üretiliyor…"));
  const info = h("p", { class: "field__h" }, "");

  const body = h("div", null,
    h("p", { class: "mp" },
      "Bu QR sitenin adresini taşır. Ekran görüntüsü alıp story'ye koyabilir " +
      "ya da PNG olarak indirebilirsin."),
    frame,
    info,
    h("div", { class: "mrow" },
      h("button", {
        class: "btn btn--solid", type: "button",
        onclick: () => {
          if (!canvas.width) { toast("QR henüz hazır değil"); return; }
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = h("a", { href: url, download: "arda-os-qr.png" });
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast("QR indirildi", "ok");
          }, "image/png");
        },
      }, "PNG İNDİR"),
      h("button", {
        class: "btn", type: "button",
        onclick: async () => {
          const ok = await copy(siteUrl());
          toast(ok ? "bağlantı kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
        },
      }, "BAĞLANTIYI KOPYALA")));

  openModal({ kind: "PAYLAŞ", title: "QR", content: body });

  try {
    const res = await fetch("/api/qr?format=json&data=" + encodeURIComponent(siteUrl()));
    const data = await res.json();
    if (!data.ok) throw new Error("qr");

    const quiet = 4;
    const size = data.size + quiet * 2;
    const scale = Math.max(2, Math.floor(640 / size));
    canvas.width = size * scale;
    canvas.height = size * scale;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < data.size; r++) {
      for (let c = 0; c < data.size; c++) {
        if (data.matrix[r][c]) {
          ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
    clear(frame);
    frame.appendChild(canvas);
    info.textContent = `${data.size}×${data.size} modül · hata düzeltme ${data.ec}`;
  } catch {
    clear(frame);
    frame.appendChild(h("div", { style: "color:#666;font-family:var(--m);font-size:12px" },
      "QR üretilemedi"));
  }
}

/* --- contact -------------------------------------------------------------- */

function contactModal() {
  const name = h("input", { class: "inp", name: "name", autocomplete: "name", maxlength: "80" });
  const email = h("input", { class: "inp", type: "email", name: "email", autocomplete: "email", maxlength: "120" });
  const message = h("textarea", { class: "inp", name: "message", maxlength: "4000" });
  const honey = h("input", {
    class: "inp", name: "website", tabindex: "-1", autocomplete: "off",
    "aria-hidden": "true", style: "position:absolute;left:-9999px;opacity:0;height:0",
  });

  const eName = h("span", { class: "field__e" });
  const eMail = h("span", { class: "field__e" });
  const eMsg = h("span", { class: "field__e" });
  const status = h("p", { class: "field__h" });
  const submit = h("button", { class: "btn btn--solid btn--block", type: "submit" }, "GÖNDER");

  const form = h("form", {
    novalidate: true,
    onsubmit: async (e) => {
      e.preventDefault();
      eName.textContent = eMail.textContent = eMsg.textContent = "";
      status.textContent = "";
      submit.disabled = true;
      submit.textContent = "GÖNDERİLİYOR…";

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            message: message.value,
            website: honey.value,
            source: "arda.os",
          }),
        });
        const data = await res.json();

        if (data.ok) {
          clear(form);
          form.appendChild(h("div", null,
            h("div", { class: "mk" }, "ALINDI"),
            h("p", { class: "mp" },
              "Mesajın kaydedildi. Okuyunca döneceğim."),
            h("div", { class: "mblock" },
              h("a", {
                class: "btn btn--solid btn--block",
                href: IDENTITY.instagram, target: "_blank", rel: "noopener",
              }, icon("i-ig", 16), IDENTITY.handle))));
          toast("mesajın ulaştı", "ok");
          return;
        }

        if (data.errors) {
          if (data.errors.name) eName.textContent = data.errors.name;
          if (data.errors.email) eMail.textContent = data.errors.email;
          if (data.errors.message) eMsg.textContent = data.errors.message;
          status.textContent = "Formu kontrol et.";
        } else {
          status.textContent = data.error || "Gönderilemedi.";
        }
        toast(data.error || "form gönderilemedi", "err");
      } catch {
        status.textContent = "Bağlantı kurulamadı. Tekrar dene.";
        toast("bağlantı hatası", "err");
      } finally {
        submit.disabled = false;
        submit.textContent = "GÖNDER";
      }
    },
  },
    h("p", { class: "mp" },
      "Form gerçekten çalışır: mesaj sunucudaki veritabanına yazılır. " +
      "IP adresin saklanmaz."),
    honey,
    h("label", { class: "field" }, h("span", { class: "field__l" }, "İSİM"), name, eName),
    h("label", { class: "field" },
      h("span", { class: "field__l" }, "E-POSTA (İSTEĞE BAĞLI)"), email, eMail,
      h("span", { class: "field__h" }, "Cevap istiyorsan yaz.")),
    h("label", { class: "field" }, h("span", { class: "field__l" }, "MESAJ"), message, eMsg),
    status,
    h("div", { style: "margin-top:16px" }, submit));

  openModal({ kind: "İLETİŞİM", title: "CONTACT", content: form });
}

/* --- wiring --------------------------------------------------------------- */

export function initConnect() {
  const copyBtn = $("#copyBtn");
  const shareBtn = $("#shareBtn");
  const qrBtn = $("#qrBtn");
  const contactBtn = $("#contactBtn");

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const ok = await copy(siteUrl());
      toast(ok ? "bağlantı kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const payload = {
        title: "ARDA.OS",
        text: "Merak ediyorum. Sistemler kuruyorum. Fikirleri gerçeğe dönüştürüyorum.",
        url: siteUrl(),
      };
      if (canShare()) {
        if (await share(payload)) return;
        toast("paylaşılamadı", "err");
        return;
      }
      // No Web Share on this browser — fall back to the clipboard.
      const ok = await copy(siteUrl());
      toast(ok ? "paylaşım desteklenmiyor — bağlantı kopyalandı" : "kopyalanamadı",
        ok ? "ok" : "err");
    });
  }

  if (qrBtn) qrBtn.addEventListener("click", qrModal);
  if (contactBtn) contactBtn.addEventListener("click", contactModal);
}
