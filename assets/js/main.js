/* ============================================================
   RizzoDev main.js
   Vanilla JS, no dependencies. Loaded with `defer`.
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. Mobile nav toggle
     ---------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close the menu after following a link (mobile)
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ----------------------------------------------------------
     2. Active nav link based on current page
     ---------------------------------------------------------- */
  function initActiveLink() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "") path = "index.html";
    var links = document.querySelectorAll(".nav-links a[href]");
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "index.html" && href === "index.html")) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ----------------------------------------------------------
     3. Footer year
     ---------------------------------------------------------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     4. Hero terminal typing animation
        Markup: <div class="typed" data-typed>
                  <span class="line" data-line="1">...</span> ...
                </div>
        Each .line[data-line] is hidden, then revealed/typed in order.
     ---------------------------------------------------------- */
  function initTyping() {
    var root = document.querySelector("[data-typed]");
    if (!root) return;

    var lines = Array.prototype.slice.call(root.querySelectorAll(".line"));
    var caret = root.querySelector(".caret");

    if (prefersReducedMotion) {
      lines.forEach(function (l) { l.style.visibility = "visible"; });
      return;
    }

    // Hide all lines initially
    lines.forEach(function (l) { l.style.visibility = "hidden"; });
    if (caret) caret.style.opacity = "0";

    var i = 0;
    function nextLine() {
      if (i >= lines.length) {
        if (caret) caret.style.opacity = "";
        return;
      }
      var line = lines[i];
      line.style.visibility = "visible";
      // typing-style lines reveal character by character; output lines snap in
      var delay = line.hasAttribute("data-instant") ? 120 : 0;
      if (line.hasAttribute("data-instant")) {
        i++;
        setTimeout(nextLine, 260);
        return;
      }
      typeLine(line, function () {
        i++;
        setTimeout(nextLine, 220);
      });
    }

    function typeLine(line, done) {
      // Type only the text inside the .cmd element, if present; else whole line.
      var target = line.querySelector(".cmd") || line;
      var full = target.textContent;
      target.textContent = "";
      var c = 0;
      (function tick() {
        target.textContent = full.slice(0, c);
        c++;
        if (c <= full.length) {
          setTimeout(tick, 26 + Math.random() * 34);
        } else {
          done();
        }
      })();
    }

    // Kick off shortly after load
    setTimeout(nextLine, 400);
  }

  /* ----------------------------------------------------------
     5. Reveal-on-scroll
     ---------------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     6. Contact form: progressive enhancement (Formspree)
        Falls back to a normal POST if JS/fetch unavailable.
     ---------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = form.querySelector(".form__status");
    var action = form.getAttribute("action") || "";

    // If the Formspree endpoint hasn't been configured yet, don't pretend.
    var unconfigured = action.indexOf("YOUR_FORM_ID") !== -1 || action === "";

    form.addEventListener("submit", function (e) {
      if (unconfigured) {
        e.preventDefault();
        setStatus(
          "Form not connected yet. Add your Formspree endpoint in contact.html. " +
          "Meanwhile, email rbrizzo99.career@gmail.com.",
          "is-error"
        );
        return;
      }

      if (!window.fetch) return; // let the browser do a normal POST

      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "sending…"; }
      setStatus("", "");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setStatus("Message sent. I'll get back to you within two business days.", "is-ok");
          } else {
            return res.json().then(function (data) {
              var msg =
                data && data.errors && data.errors.length
                  ? data.errors.map(function (x) { return x.message; }).join(", ")
                  : "Something went wrong. Please email rbrizzo99.career@gmail.com.";
              setStatus(msg, "is-error");
            });
          }
        })
        .catch(function () {
          setStatus("Network error. Please email rbrizzo99.career@gmail.com.", "is-error");
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = original; }
        });
    });

    function setStatus(msg, cls) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form__status " + (cls || "");
    }
  }

  /* ----------------------------------------------------------
     7. Toolkit (categorized tool list)
        Builds category blocks of tool chips. Brand icons are
        local green SVGs in assets/icons/ (no third party calls).
        Tools without a brand icon fall back to an inline generic:
        a database glyph (SQL/NoSQL) or a letter monogram.
     ---------------------------------------------------------- */
  function initTools() {
    var mount = document.querySelector("[data-toolkit]");
    if (!mount) return;

    function generic(type, label) {
      var svg, box = document.createElement("div");
      if (type === "mono") {
        var letter = (String(label).replace(/[^A-Za-z0-9]/g, "").charAt(0) || "?").toUpperCase();
        svg =
          '<svg class="tool__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" stroke-width="2"/>' +
          '<text x="12" y="16.5" text-anchor="middle" font-size="12" font-weight="700" ' +
          'font-family="JetBrains Mono, monospace" fill="currentColor">' + letter + "</text></svg>";
      } else {
        var inner = type === "db"
          ? '<ellipse cx="12" cy="5" rx="9" ry="3"/>' +
            '<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>' +
            '<path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>'
          : '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>';
        svg =
          '<svg class="tool__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          inner + "</svg>";
      }
      box.innerHTML = svg;
      return box.firstChild;
    }

    function makeIcon(label, slug, generictype) {
      if (!slug) return generic(generictype, label);
      var img = document.createElement("img");
      img.className = "tool__icon";
      img.src = "assets/icons/" + slug + ".svg";
      img.alt = "";
      img.loading = "lazy";
      img.width = 20;
      img.height = 20;
      img.onerror = function () {
        if (this.parentNode) this.parentNode.replaceChild(generic("mono", label), this);
      };
      return img;
    }

    var cats = [
      { title: "Languages & data", tools: [
        ["HTML", "html5"], ["CSS", "css"], ["JavaScript", "javascript"], ["TypeScript", "typescript"],
        ["Python", "python"], ["Java", "openjdk"], ["C", "c"], ["C++", "cplusplus"], ["PHP", "php"],
        ["SQL", null, "db"], ["NoSQL", null, "db"]
      ] },
      { title: "Frameworks & infrastructure", tools: [
        ["React", "react"], ["GitHub", "github"], ["Vercel", "vercel"], ["Supabase", "supabase"]
      ] },
      { title: "Websites & platforms", tools: [
        ["WordPress", "wordpress"], ["Squarespace", "squarespace"], ["Wix", "wix"], ["Kajabi", null, "mono"],
        ["Shopify", "shopify"], ["Canva", null, "mono"]
      ] },
      { title: "Tools & integrations", tools: [
        ["Calendly", "calendly"], ["Square", "square"], ["Monday", null, "mono"], ["Make", "make"],
        ["Tally", null, "mono"], ["Typeform", "typeform"]
      ] }
    ];

    cats.forEach(function (cat) {
      var block = document.createElement("div");
      block.className = "toolkit__cat";

      var h = document.createElement("h3");
      h.className = "toolkit__cat-title";
      h.textContent = cat.title;
      block.appendChild(h);

      var ul = document.createElement("ul");
      ul.className = "toolkit__list";
      cat.tools.forEach(function (t) {
        var li = document.createElement("li");
        li.className = "tool";
        li.appendChild(makeIcon(t[0], t[1], t[2]));
        var label = document.createElement("span");
        label.className = "tool__label";
        label.textContent = t[0];
        li.appendChild(label);
        ul.appendChild(li);
      });
      block.appendChild(ul);
      mount.appendChild(block);
    });
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initActiveLink();
    initYear();
    initTyping();
    initReveal();
    initContactForm();
    initTools();
  });
})();
