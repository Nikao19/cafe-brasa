(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) {
    throw new Error("GSAP and ScrollTrigger must load before animations.js.");
  }

  gsap.registerPlugin(ScrollTrigger);

  let pageContext;
  let cardsContext;
  let cartTimeline;
  let menuTimeline;
  let initialized = false;
  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init() {
    if (initialized) return;
    initialized = true;

    pageContext = gsap.context(() => {
      gsap.set("#cart", { xPercent: 100, visibility: "hidden" });
      gsap.set("#veil", { autoAlpha: 0 });

      const motion = gsap.matchMedia();

      motion.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 820px)",
          hover: "(hover: hover) and (prefers-reduced-motion: no-preference)",
        },
        ({ conditions }) => {
          if (conditions.reduceMotion) {
            cardsContext?.revert();
            cardsContext = null;
            return;
          }

          const intro = gsap.timeline({
            defaults: { ease: "power3.out" },
          });
          intro
            .from(".hero-kicker", {
              autoAlpha: 0,
              y: 14,
              duration: 0.55,
            })
            .from(
              ".hero-title .hero-line",
              {
                autoAlpha: 0,
                yPercent: 110,
                duration: 0.85,
                stagger: 0.12,
              },
              "-=0.25",
            )
            .from(
              [".hero-description", ".hero-actions", ".hero-note"],
              {
                autoAlpha: 0,
                y: 18,
                duration: 0.6,
                stagger: 0.1,
              },
              "-=0.38",
            )
            .fromTo(
              ".hero-photo img",
              { scale: 1.12 },
              { scale: 1, duration: 1.5, ease: "power2.out" },
              0,
            );

          gsap.utils.toArray("[data-reveal]").forEach((element) => {
            gsap.from(element, {
              autoAlpha: 0,
              y: 26,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 86%",
                once: true,
              },
            });
          });

          gsap.utils.toArray("[data-parallax] img").forEach((image) => {
            if (conditions.mobile) return;
            gsap.fromTo(
              image,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: "none",
                scrollTrigger: {
                  trigger: image.closest("section"),
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.6,
                },
              },
            );
          });

          if (conditions.hover) bindHoverEffects();
          return () => {
            cardsContext?.revert();
            cardsContext = null;
          };
        },
      );
    }, document.body);
  }

  function destroy() {
    pageContext?.revert();
    cardsContext?.revert();
    cartTimeline?.kill();
    menuTimeline?.kill();
    gsap.set("#cart, #veil, #nav", {
      clearProps: "transform,visibility,opacity,height,overflow",
    });
    document.querySelector("#cart").classList.remove("on");
    document.querySelector("#cart").setAttribute("aria-hidden", "true");
    document.querySelector("#veil").classList.remove("on");
    document.querySelector("#nav").classList.remove("on");
    document.querySelector("#nav").setAttribute(
      "aria-hidden",
      String(!window.matchMedia("(min-width: 821px)").matches),
    );
    document.querySelector("#burger").setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    pageContext = null;
    cardsContext = null;
    cartTimeline = null;
    menuTimeline = null;
    initialized = false;
  }

  function revealCards(cards) {
    cardsContext?.revert();
    if (!cards.length || reduceMotion()) return;

    const section = document.querySelector(".menu-section");
    const alreadyVisible = ScrollTrigger.isInViewport(section, 0.15);
    cardsContext = gsap.context(() => {
      gsap.from(cards, {
        autoAlpha: 0,
        y: 22,
        duration: 0.62,
        ease: "power2.out",
        stagger: 0.055,
        scrollTrigger: alreadyVisible
          ? undefined
          : {
              trigger: section,
              start: "top 78%",
              once: true,
            },
      });
    }, section);
  }

  function bindHoverEffects() {
    const selector = ".btn, .add, .chip, .iconbtn, .card";

    function animateHover(event, entering) {
      const target = event.target.closest(selector);
      if (!target || target.contains(event.relatedTarget)) return;
      gsap.to(target, {
        y: entering ? -3 : 0,
        scale: entering && target.matches(".btn, .add") ? 1.025 : 1,
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    function onPointerOver(event) {
      animateHover(event, true);
    }
    function onPointerOut(event) {
      animateHover(event, false);
    }

    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }

  function toggleCart(open, onComplete) {
    const cart = document.querySelector("#cart");
    const veil = document.querySelector("#veil");
    cartTimeline?.kill();

    if (reduceMotion()) {
      gsap.set(cart, {
        xPercent: open ? 0 : 100,
        visibility: open ? "visible" : "hidden",
      });
      gsap.set(veil, { autoAlpha: open ? 1 : 0 });
      onComplete?.();
      return;
    }

    if (open) gsap.set(cart, { visibility: "visible" });
    cartTimeline = gsap.timeline({
      onComplete: () => {
        if (!open) gsap.set(cart, { visibility: "hidden" });
        onComplete?.();
      },
    });

    cartTimeline
      .to(cart, { xPercent: open ? 0 : 100, duration: 0.42, ease: "power3.inOut" }, 0)
      .to(veil, { autoAlpha: open ? 1 : 0, duration: 0.32, ease: "power1.out" }, 0);

    if (open) {
      cartTimeline.from(
        "#cart .top, #items, #cart .sub, #checkout",
        { autoAlpha: 0, y: 10, duration: 0.3, stagger: 0.05, ease: "power2.out" },
        0.14,
      );
    }
  }

  function toggleMenu(open, onComplete) {
    const nav = document.querySelector("#nav");
    menuTimeline?.kill();

    if (window.matchMedia("(min-width: 821px)").matches || reduceMotion()) {
      gsap.set(nav, { clearProps: "height,opacity,visibility,transform" });
      onComplete?.();
      return;
    }

    const links = nav.querySelectorAll("li");
    if (open) {
      gsap.set(nav, { height: 0, overflow: "hidden" });
      gsap.set(links, { autoAlpha: 0, y: -8 });
    }

    menuTimeline = gsap.timeline({ onComplete });
    if (open) {
      menuTimeline
        .to(nav, { height: "auto", duration: 0.38, ease: "power2.out" })
        .to(
          links,
          { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.045, ease: "power2.out" },
          "-=0.18",
        )
        .set(nav, { clearProps: "height,overflow" });
    } else {
      menuTimeline
        .to(links, { autoAlpha: 0, y: -6, duration: 0.18, stagger: 0.025, ease: "power1.in" })
        .to(nav, { height: 0, duration: 0.25, ease: "power2.inOut" }, "-=0.04");
    }
  }

  window.BrasaAnimations = { init, destroy, revealCards, toggleCart, toggleMenu };
})();
