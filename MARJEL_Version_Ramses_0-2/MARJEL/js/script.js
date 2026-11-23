const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

// le avisamos al CSS que el JS sí cargó (los paneles y filtros solo se esconden si hay JS para abrirlos)
document.documentElement.classList.add("js");

// fotos difuminadas que se enfocan una tras otra
document.querySelectorAll(".foto img").forEach((imagen, n) => {
    imagen.classList.add("carga");

    const mostrar = () => {
        setTimeout(() => imagen.classList.add("lista"), reducirMovimiento ? 0 : 80 + n * 110);
    };

    if (imagen.complete) {
        mostrar();
    } else {
        imagen.addEventListener("load", mostrar);
        imagen.addEventListener("error", mostrar);
    }
});

// elementos que aparecen mientras scrolleo
const selector = ".portada__texto, .titulo-seccion, .tarjeta, .encabezado-pagina, .caja, .formulario, .foto--ancha, .footer, .filtros, .faq__item";
const observador = ("IntersectionObserver" in window && !reducirMovimiento)
    ? new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 })
    : null;

document.querySelectorAll(selector).forEach((elemento, n) => {
    elemento.classList.add("rv");
    elemento.style.setProperty("--retraso", (n % 3) * 0.12 + "s");
    if (observador) {
        observador.observe(elemento);
    } else {
        elemento.classList.add("visible");
    }
});

// menu del celular (boton de hamburguesa)
const botonMenu = document.querySelector(".menu-boton");
const navegacion = document.querySelector("#menu-principal");
const menuAbierto = () => Boolean(navegacion && navegacion.classList.contains("abierto"));

const cambiarMenu = (abrir) => {
    navegacion.classList.toggle("abierto", abrir);
    botonMenu.setAttribute("aria-expanded", String(abrir));
    botonMenu.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
};

if (botonMenu && navegacion) {
    botonMenu.addEventListener("click", () => cambiarMenu(!menuAbierto()));

    // al tocar un enlace se cierra solo
    navegacion.addEventListener("click", (e) => {
        if (e.target.closest("a")) cambiarMenu(false);
    });

    // con Escape también se cierra y el foco regresa al botón
    addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuAbierto()) {
            cambiarMenu(false);
            botonMenu.focus();
        }
    });

    // si giran el celular o agrandan la ventana, se reinicia
    matchMedia("(max-width: 600px)").addEventListener("change", () => cambiarMenu(false));
}

// menu que se oculta al scrollear
const menu = document.querySelector("header.contenedor");
let ultimaPosicion = 0;

if (menu) {
    addEventListener("scroll", () => {
        const posicion = window.scrollY;
        menu.classList.toggle("sombra", posicion > 10);
        // si el menu del celular está abierto no lo escondemos
        menu.classList.toggle("oculto", posicion > ultimaPosicion && posicion > 160 && !menuAbierto());
        ultimaPosicion = posicion;
    }, { passive: true });
}

// boton de volver arriba (aparece después de bajar un poco, en pantallas pequenas puede que no aparezca nunca)
const botonSubir = document.querySelector(".flotante--subir");

if (botonSubir) {
    const revisarSubir = () => botonSubir.classList.toggle("mostrar", window.scrollY > 500);

    addEventListener("scroll", revisarSubir, { passive: true });
    revisarSubir();

    botonSubir.addEventListener("click", () => {
        scrollTo({ top: 0, behavior: reducirMovimiento ? "auto" : "smooth" });
        const logo = document.querySelector(".logo");
        if (logo) logo.focus({ preventScroll: true });
    });
}

// paneles que se abren y se cierran para los detalles de las prendas y preguntas frecuentes
const cambiarPanel = (boton, abrir) => {
    const panel = document.getElementById(boton.getAttribute("aria-controls"));
    if (!panel) return;

    panel.classList.toggle("abierto", abrir);
    boton.setAttribute("aria-expanded", String(abrir));

    if (boton.classList.contains("detalle-boton")) {
        boton.textContent = abrir ? "Ocultar detalles" : "Ver detalles";
    }
};

document.querySelectorAll(".detalle-boton, .faq__pregunta").forEach((boton) => {
    boton.addEventListener("click", () => {
        const abrir = boton.getAttribute("aria-expanded") !== "true";

    // en las preguntas frecuentes dejamos una sola abierta a la vez
        if (abrir && boton.classList.contains("faq__pregunta")) {
            document.querySelectorAll(".faq__pregunta[aria-expanded='true']").forEach((otro) => cambiarPanel(otro, false));
        }

        cambiarPanel(boton, abrir);
    });
});

// buscador y filtros del catálogo
const buscador = document.querySelector("#buscador");
const tarjetas = document.querySelectorAll("[data-grupo]");

if (buscador && tarjetas.length) {
    const chips = document.querySelectorAll(".chip");
    const estado = document.querySelector("#estado-filtros");
    const vacio = document.querySelector(".sin-resultados");
    const limpiarBoton = document.querySelector(".limpiar-filtros");
    let grupoActivo = "todo";

    // "Filtro" para que el uso de minúsculas y sin acentos, como "camisa" encuentre "Camisa" y "pantalon" encuentre "Pantalón"
    const limpiar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const catalogo = Array.from(tarjetas).map((tarjeta) => ({
        tarjeta,
        grupo: tarjeta.dataset.grupo,
        texto: limpiar(Array.from(tarjeta.querySelectorAll("h3, p")).map((e) => e.textContent).join(" "))
    }));

    const filtrar = () => {
        const palabras = limpiar(buscador.value).split(/\s+/).filter(Boolean);
        let visibles = 0;

        catalogo.forEach(({ tarjeta, grupo, texto }) => {
            const coincide = (grupoActivo === "todo" || grupo === grupoActivo)
                && palabras.every((palabra) => texto.includes(palabra));
            const estabaOculta = tarjeta.hidden;

            tarjeta.hidden = !coincide;

            if (coincide) {
                visibles++;
                if (estabaOculta) {
                    // si vuelve a aparecer por el filtro, ya no esperamos al scroll
                    tarjeta.classList.add("visible");
                    if (observador) observador.unobserve(tarjeta);
                    if (!reducirMovimiento) {
                        tarjeta.classList.remove("entra");
                        void tarjeta.offsetWidth;
                        tarjeta.classList.add("entra");
                    }
                }
            }
        });

        vacio.hidden = visibles !== 0;
        estado.textContent = "Mostrando " + visibles + " de " + catalogo.length + " prendas.";
    };

    buscador.addEventListener("input", filtrar);

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            grupoActivo = chip.dataset.filtro;
            chips.forEach((otro) => otro.setAttribute("aria-pressed", String(otro === chip)));
            filtrar();
        });
    });

    if (limpiarBoton) {
        limpiarBoton.addEventListener("click", () => {
            buscador.value = "";
            grupoActivo = "todo";
            chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip.dataset.filtro === "todo")));
            filtrar();
            buscador.focus();
        });
    }

    filtrar();
}
