
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

//formato difuminadas y se enfocan una tras otra
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

// elemtnos q aprecen mientras scrolleo
const selector = ".portada__texto, .titulo-seccion, .tarjeta, .encabezado-pagina, .caja, .formulario, .foto--ancha, .footer";
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

// menu que se oculta al scrollear
const menu = document.querySelector("header.contenedor");
let ultimaPosicion = 0;

if (menu) {
    addEventListener("scroll", () => {
        const posicion = window.scrollY;
        menu.classList.toggle("sombra", posicion > 10);
        menu.classList.toggle("oculto", posicion > ultimaPosicion && posicion > 160);
        ultimaPosicion = posicion;
    }, { passive: true });
}
