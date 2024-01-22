import {productsData} from "./products.js";

const productsDom = document.querySelector(".products");
const cartTotal = document.querySelector(".cart-total");
const cartItem = document.querySelector(".cart_quantity");
const cartContent = document.querySelector(".cart-content");
const cartModal = document.querySelector(".cart");
const showCart = document.querySelector(".header_cart");
const cartConfirm = document.querySelector(".confirm-cart");
const clearCart = document.querySelector(".clear-cart");
const menu = document.querySelector(".bar_menu");
const toggler = document.querySelector(".header_bar--toggler");
const cartTittle = document.querySelector(".cart-tittle");


toggler.addEventListener("click",() => {
    menu.classList.toggle("expended");
    toggler.classList.toggle("open");
});


showCart.addEventListener("click",showModal);
cartConfirm.addEventListener("click",closeModal);


function showModal(){
    cartModal.style.visibility = "visible"
}

function closeModal(){
    cartModal.style.visibility = "hidden"
}


let buttonsDom = [];
let cart = [];

class Products{
    getProducts(){
        return productsData;
    }
}


class Ui{
    showProducts(products){
        let result = "";
        products.forEach(item => {
            result += `        <div class="products_client">
            <div class="products_image">
                <img src="${item.imageUrl}" alt=""  class="prod_img">
            </div>

            <div class="products_information">
                <p class="product--tittle">${item.tittle}</p>
                <p class="product--price">${item.price} $</p>
            </div>
            <button data-id="${item.id}" class="product--btn">
                Add to cart
            </button>
        </div>`
            productsDom.innerHTML = result;
        })
    }

    getAddToCartBtns(){
        const addToCartBtns = document.querySelectorAll(".product--btn");
        buttonsDom = [...addToCartBtns];

        buttonsDom.forEach(btn => {
            const id = parseInt(btn.dataset.id);
            const isInCart = cart.find(p => p.id===id);

            if(isInCart){
                btn.innerText = "in cart";
                btn.disabled = true;
            }
            btn.addEventListener("click",(e) => {
                e.target.innerText = "in cart";
                e.target.disabled = true;
                const addedProduct = {...Storage.getProducts(id),quantity:1};
                cart = [...cart,addedProduct];
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(addedProduct);
            })

        })

    }

    setCartValue(cart){
        let tempCartItem = 0;

        const totalPrice = cart.reduce((acc,curr) => {
            tempCartItem += curr.quantity;
            return acc+curr.quantity*curr.price;
        },0)
        cartItem.innerText = tempCartItem;
        cartTotal.innerText = `${totalPrice} $`
        cartTittle.innerText = `You have ${tempCartItem} item in your basket`;
    }

    addCartItem(cartItem){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
                        <img alt="" src="${cartItem.imageUrl}">
                <div class="product-information">
                    <div class="cart_productName">
                        <p class="productName">${cartItem.tittle}</p>
                        <button data-id="${cartItem.id}" class="trash_product">&times;</button>
                    </div>
                    <hr>
                    <div class="product-total">
                        <div class="product_quantity">
                            <p>Quantity</p>
                            <div class="product_quantity--length">
                                <div data-id="${cartItem.id}" class="btn-quantity quantity-minus">-</div>
                                <div class="btn-quantity quantity-length">${cartItem.quantity}</div>
                                <div data-id="${cartItem.id}" class="btn-quantity quantity-plus">+</div>
                            </div>
                        </div>
                        <div class="product-price">
                            <p>price</p>
                            <span>${cartItem.price} $</span>
                        </div>
                    </div>
                </div>`;
        cartContent.appendChild(div)
    }

    setupApp(){
        cart = Storage.getCart() || [];
        cart.forEach(cartItem => this.addCartItem(cartItem));
        this.setCartValue(cart);
    }

    cartLogic(){
        clearCart.addEventListener("click",() =>{
            this.clearCart();
        });

        cartContent.addEventListener("click",(event) => {
            if(event.target.classList.contains("quantity-plus")){
                const addQuantity = event.target;
                const addItem = cart.find(c => c.id===parseInt(addQuantity.dataset.id));
                addItem.quantity++;
                this.setCartValue(cart);
                Storage.saveCart(cart);
                addQuantity.previousElementSibling.innerText = addItem.quantity;
            }
            else if(event.target.classList.contains("trash_product")){
                const removeItem = event.target;
                const removedItem = cart.find(c => c.id===parseInt(removeItem.dataset.id));
                this.removeItem(removedItem.id);
                cartContent.removeChild(removeItem.parentElement.parentElement.parentElement);
            }
            else if(event.target.classList.contains("quantity-minus")){
                const subQuantity = event.target;
                const subtractedItem = cart.find(c => c.id===parseInt(subQuantity.dataset.id));
                if(subtractedItem.quantity===1){
                    this.removeItem(subtractedItem.id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement.parentElement.parentElement.parentElement);
                    return;
                }
                subtractedItem.quantity--;
                this.setCartValue(cart);
                Storage.saveCart(cart);
                subQuantity.nextElementSibling.innerText = subtractedItem.quantity;
            }
        })

    }

    clearCart(){
        cart.forEach(item => this.removeItem(item.id));
        while (cartContent.children.length){
            cartContent.removeChild(cartContent.children[0]);
            closeModal();
        }
    }

    removeItem(id){
        cart = cart.filter(item => item.id!==id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        this.getSingleButton(id)
    }

    getSingleButton(id){
        const button = buttonsDom.find(btn => parseInt(btn.dataset.id)===id);
        button.innerText = "Add to cart";
        button.disabled = false;
    }
}


class Storage{
    static  saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products))
    }

    static  getProducts(id){
        const myProducts = JSON.parse(localStorage.getItem("products"));
        return myProducts.find(p => p.id===parseInt(id));
    }

    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }

    static  getCart(){
        return JSON.parse(localStorage.getItem("cart"))
    }
}


document.addEventListener("DOMContentLoaded",() => {
    const products = new Products();
    const productsData = products.getProducts();
    const  ui = new Ui();
    ui.setupApp();
    ui.showProducts(productsData);
    ui.getAddToCartBtns();
    ui.cartLogic();
    Storage.saveProducts(productsData)
})