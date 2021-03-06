const Observable = require("tns-core-modules/data/observable").Observable;
const appSettings = require("tns-core-modules/application-settings");


function createViewModel() {
    const viewModel = new Observable();

    /* ------------------------ MAIN ------------------------*/

    const itemsStored = appSettings.getString("items", "");

    if(itemsStored !== "") {
        viewModel.items = JSON.parse(itemsStored);
    }
    else {
        viewModel.items = [
                {
                    name: "Sticker",
                    quantity: 301,
                    maxQuantity: 301,
                    price: 10,
                    img: "sticker",
                    promo: true,
                    promoQuantity: 2,
                    promoPrice: 15
                },
                {
                    name: "Sticker XL",
                    quantity: 120,
                    maxQuantity: 120,
                    price: 20,
                    img: "sticker_xl",
                    promo: true,
                    promoQuantity: 2,
                    promoPrice: 35
                },
                {
                    name: "Prints",
                    quantity: 36,
                    maxQuantity: 36,
                    price: 50,
                    img: "prints"
                },
                {
                    name: "Postals",
                    quantity: 18,
                    maxQuantity: 18,
                    price: 10,
                    img:"postales"
                },
                {
                    name: "Mini Prints",
                    quantity: 24,
                    maxQuantity: 24,
                    price: 20,
                    img: "mini_prints"
                },
                {
                    name: "Mini Pin Buttons",
                    quantity: 5,
                    maxQuantity: 5,
                    price: 5,
                    img: "mini_botones"
                },
                {
                    name: "Pin Buttons",
                    quantity: 72,
                    maxQuantity: 72,
                    price: 15,
                    img: "botones",
                    promo: true,
                    promoQuantity: 2,
                    promoPrice: 25
                },
                {
                    name: "Charms",
                    quantity: 99,
                    maxQuantity: 99,
                    price: 150,
                    img: "charms"
                },
                {
                    name: "Shirts",
                    quantity: 42,
                    maxQuantity: 42,
                    price: 250,
                    img: "camisas"
                }
            ];
    }
    
    //Information of the current item selected
    viewModel.currName = "";
    viewModel.currQuantity = 0;
    viewModel.currPrice = 0;
    viewModel.currIndex = -1;

 
    /* ------------------------ CART  ------------------------*/
    const cartStored = appSettings.getString("cart", "");
    if(cartStored !== "") {
        viewModel.cart = JSON.parse(cartStored);
    }
    else {
        viewModel.cart = [];
    }

    // Calculating total price of cart
    var ct = 0;
    for(var item in viewModel.cart) {
        ct += item.price;
    }
    viewModel.cartTotal = ct;

    const cartLength = viewModel.cart.length;
    var lastId = 0;
    if(cartLength > 0) {
        lastId = viewModel.cart[cartLength - 1].id + 1;
    }
    viewModel.cartLastId = lastId;


    //Information of last purchase (for Undo)
    viewModel.lastPurchase = {
        index: -1,
        quantity: 0,
        priceSold: 0
    }


    /* ------------------------ STATISTICS ------------------------*/
    const salesStored = appSettings.getNumber("sales", -1);
    if(salesStored != -1) {
        viewModel.totalSales = Math.round(salesStored * 100) / 100;
    }
    else {
        viewModel.totalSales = 0.000;
    }

    const transactionsStored = appSettings.getNumber("transactions", -1);
    if(transactionsStored != -1) {
        viewModel.totalTransactions = transactionsStored;
    }
    else {
        viewModel.totalTransactions = 0;
    }

    

    viewModel.errorMessage = "";
    return viewModel;
}

exports.createViewModel = createViewModel;
