document.addEventListener("DOMContentLoaded", () => {
  // Variables
  let productsApi = [];

  // Constantes
  const containerProducts = document.getElementById("containerProducts");
  const inputSearch = document.getElementById("inputSearch");
  const btnSearch = document.getElementById("btnSearch");
  const openCart = document.getElementById("openCart");
  const closeCart = document.getElementById("closeCart");
  const cart = document.getElementById("cart");
  const loading = document.getElementById("loading");
  const btnFinalizePurchase = document.getElementById("btnFinalizePurchase");
  const finalizePurchase = document.getElementById("finalizePurchase");

  // Loding para cargar productos
  if (productsApi.length === 0) {
    loading.style.display = "flex";
  }

  // Funcion para traer productos de una API
  const getproductsApi = async () => {
    try {
      const response = await fetch(
        "https://fastapi-app-production-db22.up.railway.app/products"
      );

      if (!response.ok) {
        throw new Error("Error al traer los productos");
      }

      const data = await response.json();
      productsApi = data;
      insertProduct(productsApi);

      loading.style.display = "none";
    } catch (error) {
      console.error("Hubo un problema con la petición fetch:", error);
      getproductsApi();
    }
  };

  // Función para insertar productos en el HTML
  const insertProduct = (productsToShow) => {
    containerProducts.innerHTML = "";

    productsToShow.forEach((product) => {
      const div = document.createElement("div");
      div.className = "containerProduct";
      div.innerHTML = `
        <i class="fa-regular fa-heart heartProduct"></i>
        <div class="contentProduct">
          <img src="${product.image}" alt="${product.name}" class="${
        product.category === "celular" ? "imgCel" : ""
      }"/>
          <div class="contentText">
            <p>${product.name}</p>
            <p>$${product.price}</p>
          </div>
          <button id="btnAdd${product.id}">Agregar al Carrito</button>
        </div>
      `;
      containerProducts.appendChild(div);
    });

    attachEventsAndAddToCart();
  };

  // Funcion crear evento a los botones de agregar de los productos
  const attachEventsAndAddToCart = () => {
    productsApi.forEach((product) => {
      const btnAddToCart = document.getElementById(`btnAdd${product.id}`);

      if (btnAddToCart) {
        btnAddToCart.addEventListener("click", () => {
          addProductToCard(product);
        });
      }
    });
  };

  // Funcion para agregar un producto al carrito
  const addProductToCard = (product) => {
    let cart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];

    const existingProductIndex = cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].amountToCart++;
    } else {
      cart.push({ ...product, amountToCart: 1 });
    }

    localStorage.setItem("CartOfBuy", JSON.stringify(cart));
    alert(`${product.name} agregado al carrito!`);
    paintToCart();
  };

  // Pintar el carrito de compras
  const paintToCart = () => {
    let productCart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];
    const contentCart = document.getElementById("contentCart");

    if (productCart.length === 0) {
      contentCart.innerHTML = `<p class="titleContentCart">No hay productos en el carrito</p>`;
    } else {
      const htmlProductsCart = productCart.map((product) => {
        let priceTotalProduct = +product.amountToCart * product.price;

        return `
        <div class="productCart">
          <div class="containerImgCart">
            <img
              src=${product.image}
              class="${
                product.category === "celular" ? "imgCartCel" : "imgCart"
              }"
              alt=""
            />
          </div>
          <div class="containerPriceCart">
            <span>${priceTotalProduct}</span>
          </div>
          <div class="addCartOrRemove">
            <span class="removeToCart" id="removeToCart${product.id}">-</span>
            <span class="amountToCart">${product.amountToCart}</span>
            <span class="addToCart" id="addToCart${product.id}">+</span>
            <i class="fa-solid fa-trash trash" id="removeAll${product.id}"></i>
          </div>
        </div>
        `;
      });

      contentCart.innerHTML = htmlProductsCart.join("");

      putEventsToCartButtons(productCart);
    }

    calculateTotalPurchase(productCart);
  };

  // Funcion para colocar eventos a los botones del carrito
  const putEventsToCartButtons = (productCart) => {
    productCart.forEach((product) => {
      const removeToCart = document.getElementById(`removeToCart${product.id}`);
      const addToCart = document.getElementById(`addToCart${product.id}`);
      const removeAllProduct = document.getElementById(
        `removeAll${product.id}`
      );

      if (removeToCart) {
        removeToCart.addEventListener("click", () => {
          eventRemoveToCart(product);
        });
      }

      if (addToCart) {
        addToCart.addEventListener("click", () => {
          eventAddToCart(product);
        });
      }

      if (removeAllProduct) {
        removeAllProduct.addEventListener("click", () => {
          eventRemoveAllProductToCart(product);
        });
      }
    });
  };

  // Funcion para eliminar un producto completo del carrito
  const eventRemoveAllProductToCart = (product) => {
    let productCart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];

    console.log(product);

    const updateCart = productCart
      .map((item) => {
        if (item.id === product.id) {
          return { ...product, amountToCart: 0 };
        }
        return item;
      })
      .filter((item) => item.amountToCart > 0);

    localStorage.setItem("CartOfBuy", JSON.stringify(updateCart));
    paintToCart();
  };

  // Funcion para agregar un producto al carrito
  const eventAddToCart = (product) => {
    let productCart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];

    const updateCart = productCart
      .map((item) => {
        if (item.id === product.id) {
          return { ...item, amountToCart: item.amountToCart + 1 };
        }
        return item;
      })
      .filter((item) => item.amountToCart > 0);

    localStorage.setItem("CartOfBuy", JSON.stringify(updateCart));
    paintToCart();
  };

  // Funcion para eliminar un producto del carrito
  const eventRemoveToCart = (product) => {
    let productCart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];

    const updateCart = productCart
      .map((item) => {
        if (item.id === product.id) {
          return { ...item, amountToCart: item.amountToCart - 1 };
        }
        return item;
      })
      .filter((item) => item.amountToCart > 0);

    localStorage.setItem("CartOfBuy", JSON.stringify(updateCart));
    paintToCart();
  };

  // Funcion para calcular el total de la venta
  const calculateTotalPurchase = (productCart) => {
    const totalPurchaseID = document.getElementById("totalPurchase");
    let totalPurchase = 0;
    totalBuy = totalPurchase;

    if (productCart.length === 0) {
      totalPurchaseID.innerHTML = `$${totalPurchase}`;
    } else {
      totalPurchase = productCart.reduce((total, product) => {
        return total + product.price * product.amountToCart;
      }, 0);

      totalPurchaseID.innerHTML = `$${totalPurchase}`;
    }
  };

  // Evento de búsqueda de productos
  btnSearch.addEventListener("click", () => {
    const searchProduct = inputSearch.value.toLowerCase().trim();

    let filterProducts = [];

    if (searchProduct) {
      filterProducts = productsApi.filter((product) =>
        product.category.toLowerCase().includes(searchProduct)
      );
    } else {
      filterProducts = productsApi;
    }

    insertProduct(filterProducts);
  });

  // Evento para abrir el carrito
  openCart.addEventListener("click", () => {
    cart.classList.add("visible");
  });
  // Evento para cerrar el carrito
  closeCart.addEventListener("click", () => {
    cart.classList.remove("visible");
  });

  // Evento para finalizar la compra
  btnFinalizePurchase.addEventListener("click", () => {
    let productCart = JSON.parse(localStorage.getItem("CartOfBuy")) || [];
    finalizePurchase.innerHTML = ""
    const totalPurchaseID = document
      .getElementById("totalPurchase")
      .textContent.slice(1);

    let totalPurchase = productCart.reduce((total, product) => {
        return total + product.price * product.amountToCart;
      }, 0);

    if (totalPurchaseID < 1) {
      const div = document.createElement("div");
      div.className = "contentFinalizePurchase";
      div.innerHTML = `
                        <i class="fa-solid fa-circle-xmark closeFinalizePurchase" id="closeFinalizePurchase"></i>
                        <h2 class="emptyCart">No hay objetos en el carrito</h2>
                        `;
      finalizePurchase.appendChild(div);
      finalizePurchase.style.display = "flex";
    }else {
      const div = document.createElement("div");
      div.className = "contentFinalizePurchase";
      div.innerHTML = `
                      <i class="fa-solid fa-circle-xmark closeFinalizePurchase" id="closeFinalizePurchase"></i>
                      <h2>Total a pagar por la compra $${totalPurchase}</h2>
                      <form action="" type="submit" class="formFinalizePurchase" id="formConfirmPurchase">
                        <div class="contentInputFormFinalizePurchase">
                          <input type="text" placeholder="Nombre" id="inputName">
                          <input type="text" placeholder="Correo electrónico" id="inputEmail">
                        </div>
                        <button>Finalizar Compra</button>
                      </form>
                      `
      finalizePurchase.appendChild(div);
      finalizePurchase.style.display = "flex";
    }

    // Evento para confirmar la compra
    const formConfirmPurchase = document.getElementById("formConfirmPurchase")
    formConfirmPurchase.addEventListener("submit", (e) => {
      e.preventDefault()

      const inputName = document.getElementById("inputName").value.trim()
      const inputEmail = document.getElementById("inputEmail").value.trim()

      if (!inputName || !inputEmail) {
        alert("No coloco el nombre o email")
        return
      }

      alert("Finalizada la compra con exito")
      localStorage.removeItem('CartOfBuy')
      paintToCart()
      finalizePurchase.style.display = "none";
    })

    // Evento para cerrar el popup de finalizar compra
    const closeFinalizePurchase = document.getElementById(
      "closeFinalizePurchase"
    );
    closeFinalizePurchase.addEventListener("click", () => {
      finalizePurchase.style.display = "none";
    });
  });

  // Llamar a la función para obtener productos de la API
  getproductsApi();

  // Llamar a la funcion pintar carrito
  paintToCart();
});
