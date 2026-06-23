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
     7. Tools marquee
        Builds a scrolling row of tool icons (Simple Icons CDN,
        tinted brand green) from a [label, slug] list. Missing
        icons fall back to a text label. The set is duplicated
        once (clones marked .is-clone) so the loop is seamless.
     ---------------------------------------------------------- */
  function initTools() {
    var mounts = document.querySelectorAll("[data-tools]");
    if (!mounts.length) return;

    var GREEN = "1FC742";
    var rows = {
      a: [
        ["HTML", "html5"], ["React", "react"], ["Python", "python"], ["Shopify", "shopify"],
        ["C++", "cplusplus"], ["Calendly", "calendly"], ["SQL", null], ["WordPress", "wordpress"],
        ["TypeScript", "typescript"], ["Supabase", "supabase"], ["Make", "make"], ["Wix", "wix"],
        ["Java", null], ["Squarespace", "squarespace"]
      ],
      b: [
        ["JavaScript", "javascript"], ["Vercel", "vercel"], ["PHP", "php"], ["Monday", "mondaydotcom"],
        ["CSS", "css3"], ["GitHub", "github"], ["R", "r"], ["Typeform", "typeform"],
        ["NoSQL", null], ["Canva", "canva"], ["C", "c"], ["Square", "square"],
        ["Kajabi", "kajabi"], ["Tally", "tally"]
      ]
    };

    function buildSet(items, isClone) {
      var frag = document.createDocumentFragment();
      items.forEach(function (it) {
        var el = document.createElement("span");
        el.className = "tool" + (isClone ? " is-clone" : "");
        if (isClone) el.setAttribute("aria-hidden", "true");
        if (it[1]) {
          var img = document.createElement("img");
          img.className = "tool__icon";
          img.src = "https://cdn.simpleicons.org/" + it[1] + "/" + GREEN;
          img.alt = it[0];
          img.loading = "lazy";
          img.width = 24;
          img.height = 24;
          img.onerror = function () { this.remove(); };
          el.appendChild(img);
        }
        var label = document.createElement("span");
        label.className = "tool__label";
        label.textContent = it[0];
        el.appendChild(label);
        frag.appendChild(el);
      });
      return frag;
    }

    mounts.forEach(function (mount) {
      var items = rows[mount.getAttribute("data-tools")] || rows.a;
      mount.appendChild(buildSet(items, false));
      mount.appendChild(buildSet(items, true));
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
