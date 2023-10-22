class Producto {
  constructor(id, nombre, precio, categoria, imagen) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

// acá van a estar todos los productos de nuestro catálogo
class BaseDeDatos {
  constructor() {
    // Array para el catálogo
    this.productos = [];
    //
    this.cargarRegistros();
  }

  async cargarRegistros() {
    const resultado = await fetch("./json/productos.json");
    this.productos = await resultado.json();
    cargarProductos(this.productos);
  }

  // Nos devuelve todo el catálogo de productos
  traerRegistros() {
    return this.productos;
  }

  // Nos devuelve un producto según el ID
  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  // Nos devuelve un array con todas las coincidencias que encuentre según el
  // nombre del producto con la palabra que el pasemos como parámetro
  registrosPorNombre(palabra) {
    return this.productos.filter((producto) =>
      producto.nombre.toLowerCase().includes(palabra.toLowerCase())
    );
  }

  registrosPorCategoria(categoria) {
    return this.productos.filter((producto) => producto.categoria == categoria);
  }
}

// Clase carrito que nos sirve para manipular los productos de nuestro carrito
class Carrito {
  constructor() {
    // Storage
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    // Array donde van a estar almacenados todos los productos del carrito
    this.carrito = carritoStorage || [];
    this.total = 0; // Suma total de los precios de todos los productos
    this.cantidadProductos = 0; // La cantidad de productos que tenemos en el carrito
    this.listar();
  }

  // Método para saber si el producto ya se encuentra en el carrito
  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  // Agregar al carrito
  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);
    // Si no está en el carrito, push y le agrego
    // la propiedad "cantidad"
    if (!productoEnCarrito) {
      this.carrito.push({ ...producto, cantidad: 1 });
    } else {
      // De lo contrario, si ya está en el carrito, le sumo en 1 la cantidad
      productoEnCarrito.cantidad++;
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }

  // Quitar del carrito
  quitar(id) {
    // Obento el índice de un producto según el ID
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    // Si la cantidad es mayor a 1, le resto la cantidad en 1
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      // Y sino, borramos del carrito el producto a quitar
      this.carrito.splice(indice, 1);
    }
    // Actualizo el storage
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    // Muestro los productos en el HTML
    this.listar();
  }
  //Vaciamos carritoal comprar
  vaciar() {
    this.total = 0;
    this.cantidadProductos = 0;
    this.carrito = [];
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.listar();
  }

  // Renderiza todos los productos en el HTML
  listar() {
    // Reiniciamos variables
    this.total = 0;
    this.cantidadProductos = 0;
    divCarrito.innerHTML = "";
    // Recorro producto por producto del carrito, y los dibujo en el HTML
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
            <div class="productoCarrito">
              <div class="imagen">
                 <img src="${producto.imagen}" />
              </div>
              <h3>${producto.nombre}</h3>
              <p>$${producto.precio}</p>
              <p>Cantidad: ${producto.cantidad}</p>
              <button href="#" class="btnQuitar" data-id="${producto.id}">Quitar del carrito</button>
            </div>
            
          `;
      // Actualizamos los totales
      this.total += producto.precio * producto.cantidad;
      this.cantidadProductos += producto.cantidad;
    }
    if (this.cantidadProductos > 0) {
      // Botón comprar visible
      botonComprar.style.display = "block";
    } else {
      // Botón comprar invisible
      botonComprar.style.display = "none";
    }

    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    // Después los recorro uno por uno y les asigno el evento a cada uno
    for (const boton of botonesQuitar) {
      boton.addEventListener("click", (event) => {
        event.preventDefault();
        // Obtengo el id por el dataset (está asignado en this.listar())
        const idProducto = Number(boton.dataset.id);
        // Llamo al método quitar pasándole el ID del producto
        this.quitar(idProducto);
      });
    }
    // Actualizo los contadores del HTML
    spanCantidadProductos.innerText = this.cantidadProductos;
    spanTotalCarrito.innerText = this.total;
  }
}

// Elementos
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const comprar = document.getElementById("botonComprar");
const botonesCategorias = document.querySelectorAll(".btnCategoria");

comprar.addEventListener("click", () => {
  Swal.fire("¡Felicidades!", "Su compra fue realizada con exito", "success");
  carrito.vaciar();
});

// Instanciamos la base de datos
const bd = new BaseDeDatos();

// Instaciamos la clase Carrito
const carrito = new Carrito();

botonesCategorias.forEach((boton) => {
  boton.addEventListener("click", () => {
    const categoria = boton.dataset.categoria;
    // Quitar seleccionado anterior
    const botonSeleccionado = document.querySelector(".seleccionado");
    botonSeleccionado.classList.remove("seleccionado");
    // Se lo agrego a este botón
    boton.classList.add("seleccionado");
    if (categoria == "Todos") {
      cargarProductos(bd.traerRegistros());
    } else {
      cargarProductos(bd.registrosPorCategoria(categoria));
    }
  });
});

cargarProductos(bd.traerRegistros());

function cargarProductos(productos) {
  // Vacíamos el div
  divProductos.innerHTML = "";
  // Recorremos producto por producto y lo dibujamos en el HTML
  for (const producto of productos) {
    divProductos.innerHTML += `
          <div class="producto">
            <div class="imagen">
              <img src="${producto.imagen}" />
            </div>
            <h2>${producto.nombre}</h2>
            <p class="precio">Precio: $${producto.precio}</p>
            <button class="btnAgregar" data-id="${producto.id}">Agregar al carrito</button>
          </div>
          
        `;
  }

  // Lista dinámica con todos los botones que haya en nuestro catálogo
  const botonesAgregar = document.querySelectorAll(".btnAgregar");

  // Recorremos botón por botón de cada producto en el catálogo y le agregamos
  // el evento click a cada uno
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      // Evita el comportamiento default de HTML
      event.preventDefault();
      // Guardo el dataset ID que está en el HTML del botón Agregar al carrito
      const idProducto = Number(boton.dataset.id);
      // Uso el método de la base de datos para ubicar el producto según el ID
      const producto = bd.registroPorId(idProducto);
      // Llama al método agregar del carrito
      carrito.agregar(producto);
    });
  }
}

// Buscador
inputBuscar.addEventListener("input", (event) => {
  event.preventDefault();
  const palabra = inputBuscar.value;
  const productos = bd.registrosPorNombre(palabra);
  cargarProductos(productos);
});

//Botones inicio
document.addEventListener("DOMContentLoaded", function () {
  const secciones = ["inicio", "productos", "contacto"];

  function mostrarSeccion(seccion) {
    secciones.forEach((s) => {
      document.getElementById(s).style.display =
        s === seccion ? "block" : "none";
    });
  }
  // Inicio
  document.getElementById("btnInicio").addEventListener("click", function () {
    document.getElementById("ajusteCarrito").style.display = "none";
    document.getElementById("fondoMain").classList.remove("fondoProductos");
    mostrarSeccion("inicio");
  });
  //Productos
  document
    .getElementById("btnProductos")
    .addEventListener("click", function () {
      document.getElementById("ajusteCarrito").style.display = "block";
      document.getElementById("fondoMain").classList.add("fondoProductos");
      document.getElementById("ajusteSecProd").classList.add("centerProductos");

      mostrarSeccion("productos");
    });
  //Nosotros (antes era contacto)
  document.getElementById("btnContacto").addEventListener("click", function () {
    document.getElementById("ajusteCarrito").style.display = "none";
    document.getElementById("fondoMain").classList.remove("fondoProductos");
    document.getElementById("contacto").innerHTML = "";
    document.getElementById("contacto").innerHTML += `
    <div class="contacto">
    <div class="contactoImg">
    <img src="./images/contacto2.jpg" alt="">
    <h3>
      Nuestra misión en Pixel es proporcionar a nuestros clientes acceso a la tecnología más innovadora y de vanguardia. Nos esforzamos por ofrecer productos de calidad que mejoren la vida de las personas y faciliten su conexión con el mundo digital.</h3>
    </div>
    <div class="contactoImg">
      <div>
      <h2>Nuestros Objetivos</h2>
      <ul>
      <li>1- Brindar a nuestros clientes una experiencia de compra en línea segura y conveniente.</li>
      <li>2- Ofrecer productos tecnológicos de alta calidad a precios competitivos.</li>
      <li>3- Mantenernos actualizados con las últimas tendencias tecnológicas y ofrecer productos de vanguardia.</li>
      <li>4- Proporcionar un excelente servicio al cliente y soporte técnico.</li>
      <li>5- Contribuir a la sostenibilidad y reducir nuestra huella ecológica a través de prácticas comerciales responsables.</li>
     </ul>
      </div>
      <img src="./images/contacto3.jpg" alt=""">
    </div>
    <div class="contactoImg">
      <h1>Si tienes alguna pregunta o consulta, no dudes en ponerte en contacto con nosotros. Estamos aquí para ayudarte a satisfacer todas tus necesidades tecnológicas. ¡Esperamos verte pronto en Pixel!.</h1>
    </div>
  </div>
    `;
    mostrarSeccion("contacto");
  });

  // Mostramos la página de inicio por defecto
  mostrarSeccion("inicio");
});
