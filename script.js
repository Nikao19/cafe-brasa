const PHOTOS = {
  hero: "img/Gemini_Generated_Image_70ytnm70ytnm70yt.jpg",
  coco: "img/Gemini_Generated_Image_s5uauws5uauws5ua.jpg",
  sobre: "img/Gemini_Generated_Image_xnw87hxnw87hxnw8.jpg",
  espresso: "img/Gemini_Generated_Image_xsum4vxsum4vxsum.jpg",
  cappuccino: "img/Gemini_Generated_Image_haetw9haetw9haet.jpg",
  latte: "img/Gemini_Generated_Image_n9tj3xn9tj3xn9tj.jpg",
  flat: "img/Gemini_Generated_Image_c4qzjoc4qzjoc4qz.jpg",
  icedlatte: "img/Gemini_Generated_Image_1sshht1sshht1ssh.jpg",
  cold: "img/Gemini_Generated_Image_7wa8v17wa8v17wa8.jpg",
  tonico: "img/Gemini_Generated_Image_nr89fynr89fynr89.jpg",
  mocha: "img/Gemini_Generated_Image_l6otswl6otswl6ot.jpg",
  croissant: "img/Gemini_Generated_Image_5jcg4f5jcg4f5jcg.jpg",
  pao: "img/Gemini_Generated_Image_i4me5qi4me5qi4me.jpg",
};
const CATS = {
  quente: "Cafés quentes",
  gelado: "Cafés gelados",
  especial: "Bebidas especiais",
  acomp: "Acompanhamentos",
};
const P = [
  {
    id: "espresso",
    c: "quente",
    n: "Espresso",
    d: "Curto e intenso, 30 ml.",
    p: 7,
    t: "#7A4A2E",
  },
  {
    id: "cappuccino",
    c: "quente",
    n: "Cappuccino",
    d: "Espresso, leite vaporizado e espuma cremosa.",
    p: 12,
    t: "#B98B6B",
  },
  {
    id: "latte",
    c: "quente",
    n: "Latte",
    d: "Muito leite, pouca espuma, suave.",
    p: 13,
    t: "#C9A383",
  },
  {
    id: "flat",
    c: "quente",
    n: "Flat white",
    d: "Espresso duplo com leite sedoso.",
    p: 13.5,
    t: "#A9744F",
  },
  {
    id: "icedlatte",
    c: "gelado",
    n: "Iced latte",
    d: "Espresso, leite frio e gelo.",
    p: 14,
    t: "#C98A66",
  },
  {
    id: "cold",
    c: "gelado",
    n: "Cold brew",
    d: "Extração a frio por 18 horas.",
    p: 12,
    t: "#6B3F27",
  },
  {
    id: "tonico",
    c: "gelado",
    n: "Espresso tônico",
    d: "Água tônica, espresso e casca de laranja.",
    p: 13,
    t: "#9A6A48",
  },
  {
    id: "coco",
    c: "especial",
    n: "Latte de coco",
    d: "Creme de coco queimado sobre gelo.",
    p: 14,
    t: "#C98A66",
  },
  {
    id: "mocha",
    c: "especial",
    n: "Mocha de laranja",
    d: "Cacau 70%, espresso e laranja.",
    p: 15.5,
    t: "#8A4B2A",
  },
  {
    id: "croissant",
    c: "acomp",
    n: "Croissant de manteiga",
    d: "Folhado, assado todas as manhãs.",
    p: 11,
    t: "#D1A66F",
  },
  {
    id: "pao",
    c: "acomp",
    n: "Pão de queijo",
    d: "Porção com quatro unidades.",
    p: 8,
    t: "#D9B27C",
  },
];
const $ = (s) => document.querySelector(s),
  money = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
let cart = {},
  cat = "todos";

function photo(el, key) {
  if (PHOTOS[key]) {
    const i = new Image();
    i.alt =
      key === "hero"
        ? "Iced latte sobre uma mesa de madeira"
        : key === "sobre"
          ? "Barista preparando café coado"
          : key === "coco"
            ? "Latte gelado com coco"
            : P.find((item) => item.id === key)?.n || "Café da Brasa";
    i.src = PHOTOS[key];
    i.loading = key === "hero" ? "eager" : "lazy";
    i.decoding = "async";
    i.onerror = () => {
      i.remove();
      el.classList.remove("hasimg");
    };
    el.prepend(i);
    el.classList.add("hasimg");
  }
}
document
  .querySelectorAll("[data-photo]")
  .forEach((el) => photo(el, el.dataset.photo));

function renderFilters() {
  const f = $("#filters");
  f.innerHTML = "";
  [["todos", "Todos"], ...Object.entries(CATS)].forEach(([k, l]) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = l;
    b.setAttribute("aria-pressed", k === cat);
    b.onclick = () => {
      cat = k;
      renderFilters();
      renderGrid();
    };
    f.append(b);
  });
}
function renderGrid() {
  const g = $("#grid");
  g.innerHTML = "";
  P.filter((x) => cat === "todos" || x.c === cat).forEach((x) => {
    const a = document.createElement("article");
    a.className = "card";
    a.innerHTML = `<div class="ph" style="--tone:${x.t}"><small>foto: ${x.n.toLowerCase()}</small></div><h3>${x.n}</h3><p>${x.d}</p><div class="row"><span class="price">${money(x.p)}</span><button type="button" class="add" data-add="${x.id}">Adicionar</button></div>`;
    photo(a.querySelector(".ph"), x.id);
    g.append(a);
  });
  window.BrasaAnimations?.revealCards(g.querySelectorAll(".card"));
}
function save() {
  const items = Object.entries(cart),
    n = items.reduce((s, [, q]) => s + q, 0);
  $("#count").textContent = n;
  $("#count").classList.remove("bump");
  void $("#count").offsetWidth;
  $("#count").classList.add("bump");
  const ul = $("#items");
  ul.innerHTML = items.length
    ? ""
    : '<li class="empty">Sua sacola está vazia. Escolha algo no cardápio.</li>';
  let total = 0;
  items.forEach(([id, q]) => {
    const x = P.find((p) => p.id === id);
    if (!x) return;
    total += x.p * q;
    const li = document.createElement("li");
    li.innerHTML = `<b>${x.n}</b><span>${money(x.p * q)}</span><div class="qty"><button type="button" data-d="-1" data-id="${id}" aria-label="Diminuir ${x.n}">−</button><span>${q}</span><button type="button" data-d="1" data-id="${id}" aria-label="Aumentar ${x.n}">+</button></div><button type="button" class="rm" data-rm="${id}" aria-label="Remover ${x.n}">Remover</button>`;
    ul.append(li);
  });
  $("#sub").textContent = money(total);
}
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("on"), 1800);
}
function panel(on) {
  const wasOpen = $("#cart").classList.contains("on");
  if (on) {
    $("#cart").classList.add("on");
    $("#veil").classList.add("on");
    $("#cart").setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    $("#close").focus();
    window.BrasaAnimations?.toggleCart(true);
  } else if (wasOpen) {
    $("#cart").setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
    window.BrasaAnimations?.toggleCart(false, () => {
      $("#cart").classList.remove("on");
      $("#veil").classList.remove("on");
    });
    $("#open").focus();
  } else {
    $("#cart").classList.remove("on");
    $("#veil").classList.remove("on");
  }
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) {
    const id = add.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    save();
    toast(P.find((p) => p.id === id).n + " na sacola");
    if (add.classList.contains("add")) {
      add.classList.add("ok");
      add.textContent = "Adicionado";
      setTimeout(() => {
        add.classList.remove("ok");
        add.textContent = "Adicionar";
      }, 1200);
    }
  }
  const q = e.target.closest("[data-d]");
  if (q) {
    const id = q.dataset.id;
    cart[id] += +q.dataset.d;
    if (cart[id] < 1) delete cart[id];
    save();
  }
  const rm = e.target.closest("[data-rm]");
  if (rm) {
    delete cart[rm.dataset.rm];
    save();
  }
});
$("#open").onclick = () => panel(true);
$("#close").onclick = () => panel(false);
$("#veil").onclick = () => panel(false);
$("#checkout").onclick = () => {
  if (!Object.keys(cart).length) return toast("Adicione um item primeiro");
  cart = {};
  save();
  panel(false);
  toast("Pedido enviado. Obrigado!");
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#cart").classList.contains("on")) panel(false);
});
function toggleMenu(open) {
  const nav = $("#nav");
  nav.setAttribute("aria-hidden", String(!open));
  $("#burger").setAttribute("aria-expanded", String(open));
  if (open) {
    nav.classList.add("on");
  }
  if (window.BrasaAnimations) {
    window.BrasaAnimations.toggleMenu(open, () => {
      if (!open) nav.classList.remove("on");
    });
  } else {
    nav.classList.toggle("on", open);
  }
}
$("#burger").onclick = () => toggleMenu(!$("#nav").classList.contains("on"));
document.querySelectorAll("nav a").forEach(
  (a) =>
    (a.onclick = () => {
      toggleMenu(false);
    }),
);
window.matchMedia("(min-width: 821px)").addEventListener("change", (event) => {
  if (event.matches) {
    toggleMenu(false);
    $("#nav").setAttribute("aria-hidden", "false");
  } else {
    $("#nav").setAttribute("aria-hidden", "true");
  }
});
renderFilters();
renderGrid();
save();
$("#count").classList.remove("bump");
$("#nav").setAttribute(
  "aria-hidden",
  String(!window.matchMedia("(min-width: 821px)").matches),
);
window.BrasaAnimations?.init();
