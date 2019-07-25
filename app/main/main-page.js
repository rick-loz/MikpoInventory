/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/

/*
NativeScript adheres to the CommonJS specification for dealing with
JavaScript modules. The CommonJS require() function is how you import
JavaScript modules defined in other files.
*/
const createViewModel = require("./main-view-model").createViewModel;

const application = require("tns-core-modules/application");
const appSettings = require("tns-core-modules/application-settings");

// Modals
const cartConfirmationModal = "cart/confirm-page";
const inventoryNewModal = "inventory/new-item-page"
const inventoryEditModal = "inventory/edit-item-page"





function onNavigatingTo(args) {
    /*
    This gets a reference this page’s <Page> UI component. You can
    view the API reference of the Page to see what’s available at
    https://docs.nativescript.org/api-reference/classes/_ui_page_.page.html
    */
    const page = args.object;

    /*
    A page’s bindingContext is an object that should be used to perform
    data binding between XML markup and JavaScript code. Properties
    on the bindingContext can be accessed using the {{ }} syntax in XML.
    In this example, the {{ message }} and {{ onTap }} bindings are resolved
    against the object returned by createViewModel().

    You can learn more about data binding in NativeScript at
    https://docs.nativescript.org/core-concepts/data-binding.
    */

    appSettings.clear();

    page.bindingContext = createViewModel();

    application.on(application.suspendEvent, (appArgs) => {
        saveInfo(page.bindingContext);
    });

    application.on(application.resumeEvent, (appArgs) => {
        page.bindingContext = createViewModel()
    });

    application.on(application.exitEvent, (args) => {
        saveInfo(page.bindingContext);
    });
    
}

function saveInfo(context) {
    appSettings.setString("items", JSON.stringify(context.items));
    appSettings.setString("items", JSON.stringify(context.cart));
    appSettings.setNumber("sales", context.totalSales);
    appSettings.setNumber("transactions", context.totalTransactions);
}

/* ----------------- MAIN ----------------- */

function onItemTap(args) {
    const context = args.view.page.bindingContext;
    const itemSelcted = args.view.bindingContext;

    context.set("currName", itemSelcted.name);
    context.set("currQuantity", 1);
    context.set("currPrice", itemSelcted.price);
    context.set("currIndex", args.index);

    if(itemSelcted.quantity < 1) {
        context.set("errorMessage", "No more left in stock");
    }
    else {
        context.set("errorMessage", "");
    }
    

}

function onQuantityTap(args) {
    const context = args.object.page.bindingContext;
    const item = context.items[context.currIndex];
    var quantity = context.currQuantity;

    if(context.currIndex > -1) {
        if(args.object.class === "less-button" && quantity > 1) {
            quantity -= 1;
        }
        else if( args.object.class === "more-button" && item.quantity > quantity) { 
            quantity += 1;
        }

        const itemPrice = item.price;
        var price = 0;
        if(item.promo) {
            price = (Math.floor(quantity/item.promoQuantity) * item.promoPrice) + ((quantity%item.promoQuantity)*itemPrice);
        }
        else {
            price = quantity * itemPrice;
        }

        context.set("currQuantity", quantity);
        context.set("currPrice", price);
    }
}

function onCartTap(args) {
    const context = args.object.page.bindingContext;
    const cart = context.cart;

    if(context.currIndex > -1 && context.currQuantity > 0) {
        const objectToAdd = {
            id: context.cartLastId,
            name: context.currName,
            quantity: context.currQuantity,
            price: context.currPrice,
            itemIndex: context.currIndex
        }

        cart.push(objectToAdd);

        context.set("cartLastId", context.cartLastId + 1);
        context.set("cartTotal", context.cartTotal + context.currPrice);

        //Refreshes the RadListView to reflect changes
        args.object.page.getViewById("cartView").refresh();
    }

    context.set("currName", "");
    context.set("currQuantity", 0);
    context.set("currPrice", 0);
    context.set("currIndex", -1);

}


/*-------------------- CART ----------------------*/

function onCartDeleteItem(args) {

    const context = args.object.page.bindingContext;
    const btnContext = args.object.bindingContext;
    const cart = context.cart;

    cart.forEach((item, index) => {
        if(item.id === btnContext.id) {
            cart.splice(index, 1);
        }
    });

    context.set("cartTotal", context.cartTotal - btnContext.price);

    //Refreshes the RadListView to reflect changes
    args.object.page.getViewById("cartView").refresh();
    
}

function onCartDelete(args) {
    const context = args.object.page.bindingContext;
    
    context.set("cart", []);
    context.set("cartTotal", 0);
    context.set("cartLastId", 0);

    args.object.page.getViewById("cartView").refresh();
}

function onSoldTap(args) {
    const context = args.object.page.bindingContext;
    const cart = context.cart
    const items = context.items;

    

    if( cart.length > 0) {

        const option = {
            context: { cart: cart, total: context.cartTotal },
            closeCallback: (confirmation) => {
                // Receive data from the modal view. e.g. username & password
                if(confirmation) {
                    cart.forEach(cartItem => {
                        const item = items[cartItem.itemIndex];
            
                        item.quantity -= cartItem.quantity;
                        
                    });
            
                    context.set("totalTransactions", context.totalTransactions + 1);
                    context.set("totalSales", context.totalSales + context.cartTotal);
            
                    args.object.page.getViewById("itemsView").refresh();
            
                    context.set("cart", []);
                    context.set("cartTotal", 0);
                    context.set("cartLastId", 0);
            
                    args.object.page.getViewById("cartView").refresh();
                }
            },
            fullscreen: false
        };
        args.object.showModal(cartConfirmationModal, option);
    }
}

/*---------------------- INVENTORY --------------------*/

function onNewItemTap(args) {
    const context = args.object.page.bindingContext;    
    const items = context.items;
    
    const option = {
        context: { },
        closeCallback: (added, itemToAdd) => {
            // Receive data from the modal view. e.g. username & password
            if(added) {
                items.push(itemToAdd);

                args.object.page.getViewById("itemsView").refresh();
            }
        },
        fullscreen: true
    };
    args.object.showModal(inventoryNewModal, option);
}

function onEditItemTap(args) {
    const context = args.view.page.bindingContext;
    const items = context.items;
    const itemContext = args.view.bindingContext;

    const option = {
        context: { item: itemContext },
        closeCallback: (deleted, edited, newObject) => {
            // Receive data from the modal view. e.g. username & password
            if(deleted) {
                items.splice(args.index, 1);
            }
            else if(edited) {
                items[args.index] = newObject;
            }

            args.object.page.getViewById("itemsView").refresh();
        },
        fullscreen: true
    };
    args.object.showModal(inventoryEditModal, option);
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/

/*------- Exports -------*/

//App
exports.onNavigatingTo = onNavigatingTo;

//Main
exports.onItemTap = onItemTap;
exports.onQuantityTap = onQuantityTap;
exports.onCartTap = onCartTap;

//Cart
exports.onCartDeleteItem = onCartDeleteItem;
exports.onSoldTap = onSoldTap;
exports.onCartDelete = onCartDelete;

//Inventory
exports.onNewItemTap = onNewItemTap;
exports.onEditItemTap = onEditItemTap


