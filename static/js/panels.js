/* Projects, archive, notes, drops, contact and share panels. */

import { h, clear, icon, copy, share, canShare, toast, formatDate } from "./core.js";
import { registerPanel, open, listItem } from "./ui.js";

let content = null;

/* --- projects ------------------------------------------------------------- */

function renderProjects() {
  if (!content.projects.length) {
    return h("div", { class: "empty" }, "Henüz yayınlanmış proje yok.");
  }
  return h("div", null,
    h("p", { class: "lede" }, "Her proje için ne, neden, hangi teknoloji ve hangi durumda olduğu yazılı."),
    h("div", { class: "list" },
      content.projects.map((project) =>
        listItem({
          title: project.title,
          sub: project.summary,
          badge: project.status,
          onClick: () => open("project", project.id),
        }))),
    h("button", {
      class: "btn btn--block", style: "margin-top:16px",
      onclick: () => open("archive"),
    }, `arşive bak (${content.archive.length})`));
}

function renderProject(ctx) {
  const project = content.projects.find((item) => item.id === ctx.arg);
  if (!project) return h("div", { class: "empty" }, "Proje bulunamadı.");

  return h("div", null,
    h("div", { class: "proj__head" },
      h("h3", { class: "proj__title" }, project.title),
      h("p", { class: "proj__summary" }, project.summary),
      h("div", { class: "pills", style: "margin-top:12px" },
        h("span", { class: "pill pill--on" }, project.status),
        h("span", { class: "pill" }, project.year),
        h("span", { class: "pill" }, project.kind))),

    h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Ne"),
      h("p", { class: "lsn__p" }, project.what)),

    h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Neden"),
      h("p", { class: "lsn__p" }, project.why)),

    project.highlights && project.highlights.length
      ? h("div", { class: "lsn__block" },
          h("div", { class: "lsn__h" }, "Öne çıkanlar"),
          h("div", { class: "bullets" },
            project.highlights.map((item) => h("div", { class: "bullet" }, item))))
      : null,

    h("div", { class: "lsn__block" },
      h("div", { class: "lsn__h" }, "Teknoloji"),
      h("div", { class: "pills" }, project.tech.map((item) => h("span", { class: "pill" }, item)))),

    h("div", { class: "lsn__block" },
      h("div", { class: "btnrow" },
        project.demo ? h("a", { class: "btn btn--primary", href: project.demo }, "demoyu aç") : null,
        project.repo
          ? h("a", { class: "btn", href: project.repo, target: "_blank", rel: "noopener" }, "kaynak kod")
          : null)));
}

function renderArchive() {
  return h("div", null,
    h("p", { class: "lede" },
      "Eski ve arşivlenmiş depolar. Hepsi gerçek bağlantılar — " +
      "bir kısmı erken denemeler, olduğu gibi duruyorlar."),
    h("div", { class: "list" },
      content.archive.map((item) =>
        listItem({
          title: item.title,
          sub: item.note,
          badge: item.year,
          href: item.repo,
        }))));
}

/* --- notes ---------------------------------------------------------------- */

function renderNotes() {
  if (!content.notes.length) return h("div", { class: "empty" }, "Henüz not yok.");
  return h("div", null,
    h("p", { class: "lede" }, "Kısa teknik yazılar. Uzun olmasın, doğru olsun."),
    h("div", { class: "list" },
      content.notes.map((note) =>
        listItem({
          title: note.title,
          sub: note.excerpt,
          badge: formatDate(note.date),
          onClick: () => open("note", note.id),
        }))));
}

function renderNote(ctx) {
  const note = content.notes.find((item) => item.id === ctx.arg);
  if (!note) return h("div", { class: "empty" }, "Not bulunamadı.");
  return h("div", null,
    h("h3", { class: "note__title" }, note.title),
    h("div", { class: "note__meta" },
      formatDate(note.date) + " · " + note.tags.join(" / ")),
    h("div", { class: "note__body" }, note.body.map((para) => h("p", null, para))),
    h("div", { class: "btnrow", style: "margin-top:22px" },
      h("button", {
        class: "btn",
        onclick: async () => {
          const url = location.origin + "/notes";
          const ok = canShare()
            ? await share({ title: note.title, text: note.excerpt, url })
            : await copy(url);
          if (ok) toast(canShare() ? "paylaşıldı" : "bağlantı kopyalandı", "ok");
        },
      }, icon("i-share", 16), "paylaş")));
}

/* --- drops ---------------------------------------------------------------- */

function renderDrops() {
  if (!content.drops.length) return h("div", { class: "empty" }, "Henüz güncelleme yok.");
  return h("div", null,
    h("p", { class: "lede" }, "Siteye ne eklendiğinin gerçek kaydı. En yeni en üstte."),
    content.drops.map((drop) =>
      h("div", { class: "card" },
        h("div", { class: "drop__head" },
          h("span", { class: "drop__date" }, formatDate(drop.date))),
        h("h3", { class: "card__title" }, drop.title),
        h("p", { class: "card__text" }, drop.body),
        drop.target
          ? h("div", { class: "btnrow", style: "margin-top:12px" },
              h("button", {
                class: "btn",
                onclick: () => open(drop.target),
              }, "aç"))
          : null)));
}

/* --- contact -------------------------------------------------------------- */

function renderContact() {
  const name = h("input", { class: "input", name: "name", autocomplete: "name", maxlength: "80" });
  const email = h("input", { class: "input", name: "email", type: "email", autocomplete: "email", maxlength: "120" });
  const message = h("textarea", { class: "textarea", name: "message", maxlength: "4000" });
  // Honeypot: hidden from people, attractive to bots.
  const honey = h("input", {
    class: "input", name: "website", tabindex: "-1", autocomplete: "off",
    "aria-hidden": "true", style: "position:absolute;left:-9999px;opacity:0;height:0",
  });

  const nameErr = h("span", { class: "field__err" });
  const emailErr = h("span", { class: "field__err" });
  const messageErr = h("span", { class: "field__err" });
  const status = h("div", { class: "field__hint" });

  const submit = h("button", { class: "btn btn--primary btn--block", type: "submit" }, "gönder");

  const form = h("form", {
    novalidate: true,
    onsubmit: async (event) => {
      event.preventDefault();
      nameErr.textContent = emailErr.textContent = messageErr.textContent = "";
      status.textContent = "";
      submit.disabled = true;
      submit.textContent = "gönderiliyor…";

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            message: message.value,
            website: honey.value,
            source: "site",
          }),
        });
        const data = await response.json();

        if (data.ok) {
          form.reset();
          status.textContent = "";
          toast("Mesajın bana ulaştı", "ok");
          clear(form);
          form.appendChild(h("div", { class: "card" },
            h("h3", { class: "card__title" }, "Mesaj alındı"),
            h("p", { class: "card__text" },
              "Teşekkürler. Mesajın kaydedildi — okuyunca döneceğim."),
            h("div", { class: "btnrow", style: "margin-top:14px" },
              h("a", {
                class: "btn btn--primary",
                href: content.profile.instagram,
                target: "_blank", rel: "noopener",
              }, icon("i-ig", 16), content.profile.handle))));
          return;
        }

        if (data.errors) {
          if (data.errors.name) nameErr.textContent = data.errors.name;
          if (data.errors.email) emailErr.textContent = data.errors.email;
          if (data.errors.message) messageErr.textContent = data.errors.message;
          status.textContent = "Formu kontrol et.";
        } else {
          status.textContent = data.error || "Gönderilemedi.";
        }
        toast(data.error || "Form gönderilemedi", "err");
      } catch {
        status.textContent = "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.";
        toast("Bağlantı hatası", "err");
      } finally {
        submit.disabled = false;
        submit.textContent = "gönder";
      }
    },
  },
    h("p", { class: "lede" },
      "Bu form gerçek: mesaj sunucudaki veritabanına yazılır. " +
      "IP adresin saklanmaz, yalnızca kötüye kullanımı engellemek için karması tutulur."),
    honey,
    h("label", { class: "field" }, h("span", { class: "field__label" }, "İsim"), name, nameErr),
    h("label", { class: "field" },
      h("span", { class: "field__label" }, "E-posta (isteğe bağlı)"), email, emailErr,
      h("span", { class: "field__hint" }, "Cevap istiyorsan yaz, istemiyorsan boş bırak.")),
    h("label", { class: "field" }, h("span", { class: "field__label" }, "Mesaj"), message, messageErr),
    status,
    submit);

  return form;
}

/* --- share ---------------------------------------------------------------- */

function renderShare() {
  const url = location.origin + "/";
  const qrHolder = h("div", { class: "qr__frame" }, h("div", { style: "color:#666;font-size:13px" }, "QR yükleniyor…"));
  const canvas = h("canvas", { width: 320, height: 320 });

  (async () => {
    try {
      const response = await fetch("/api/qr?format=json&data=" + encodeURIComponent(url));
      const data = await response.json();
      if (!data.ok) throw new Error();

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
          if (data.matrix[r][c]) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
      clear(qrHolder);
      qrHolder.appendChild(canvas);
    } catch {
      clear(qrHolder);
      qrHolder.appendChild(h("div", { style: "color:#666;font-size:13px" }, "QR üretilemedi"));
    }
  })();

  return h("div", null,
    h("p", { class: "lede" }, "Bağlantıyı paylaş ya da QR'ı indirip story'ye koy."),
    qrHolder,
    h("div", { class: "btnrow" },
      canShare()
        ? h("button", {
            class: "btn btn--primary btn--block",
            onclick: async () => {
              const ok = await share({
                title: `${content.profile.name} — ${content.profile.handle}`,
                text: content.profile.tagline,
                url,
              });
              if (ok) toast("paylaşıldı", "ok");
            },
          }, icon("i-share", 16), "paylaş")
        : null,
      h("button", {
        class: "btn",
        onclick: async () => {
          const ok = await copy(url);
          toast(ok ? "bağlantı kopyalandı" : "kopyalanamadı", ok ? "ok" : "err");
        },
      }, icon("i-copy", 16), "bağlantıyı kopyala"),
      h("button", {
        class: "btn",
        onclick: () => {
          if (!canvas.width) { toast("QR henüz hazır değil"); return; }
          canvas.toBlob((blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const link = h("a", { href: objectUrl, download: "whoisarda-qr.png" });
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            toast("QR indirildi", "ok");
          }, "image/png");
        },
      }, icon("i-qr", 16), "QR indir")),
    h("div", { class: "card" },
      h("h3", { class: "card__title" }, "Bağlantı"),
      h("p", { class: "out", style: "margin-top:8px" }, url)),
    h("a", {
      class: "btn btn--block", style: "margin-top:4px",
      href: content.profile.instagram, target: "_blank", rel: "noopener",
    }, icon("i-ig", 16), content.profile.handle));
}

/* --- registration --------------------------------------------------------- */

export function initPanels(bootContent) {
  content = bootContent;

  registerPanel("projects", { eyebrow: "İşler", title: "PROJECTS", render: renderProjects });
  registerPanel("project", {
    eyebrow: "Proje",
    title: (arg) => {
      const project = content.projects.find((item) => item.id === arg);
      return project ? project.title : "Proje";
    },
    path: false,
    render: renderProject,
  });
  registerPanel("archive", { eyebrow: "Arşiv", title: "ARCHIVE", render: renderArchive });
  registerPanel("notes", { eyebrow: "Yazılar", title: "NOTES", render: renderNotes });
  registerPanel("note", {
    eyebrow: "Not",
    title: (arg) => {
      const note = content.notes.find((item) => item.id === arg);
      return note ? note.title : "Not";
    },
    path: false,
    render: renderNote,
  });
  registerPanel("drops", { eyebrow: "Güncellemeler", title: "LATEST DROP", render: renderDrops });
  registerPanel("contact", { eyebrow: "İletişim", title: "CONTACT", render: renderContact });
  registerPanel("share", { eyebrow: "Paylaş", title: "SHARE", render: renderShare });
}
