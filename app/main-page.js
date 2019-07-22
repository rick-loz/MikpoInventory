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

    //appSettings.clear();

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
    appSettings.setNumber("sales", context.totalSales);
    appSettings.setNumber("transactions", context.totalTransactions);
}

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
        if(args.object.type === "less" && quantity > 1) {
            quantity -= 1;
        }
        else if( args.object.type === "more" && item.quantity > quantity) { 
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

function onSoldTap(args) {
    const context = args.object.page.bindingContext;

    if( context.currIndex > -1) {
        
        const item = context.items[context.currIndex];

        if(item.quantity > 0) {

            context.set("totalTransactions", context.totalTransactions + 1);

            item.quantity -= context.currQuantity;

            const prevSale = context.totalSales;

            if(args.object.type === "cash") {

                context.set("totalSales", context.totalSales + context.currPrice);
            }
            else {
                var tempSales = Math.round((context.totalSales + (context.currPrice * 1.036)) * 100) / 100;
                context.set("totalSales", tempSales);
            }

            context.set("lastPurchase", {index: context.currIndex, quantity: context.currQuantity, priceSold: context.totalSales-prevSale});

            console.log(context.lastPurchase);
            

            //Refreshes the RadListView to reflect changes
            args.object.page.getViewById("listView").refresh();
        }
        else {
            context.set("errorMessage", "No more left in stock");
        }
    }
}

function onUndoTap(args) {
    const context = args.object.page.bindingContext;
    const lastPurchase = context.lastPurchase;

    if(lastPurchase.index > -1) {
        const item = context.items[lastPurchase.index];
        item.quantity += lastPurchase.quantity;

        args.object.page.getViewById("listView").refresh();


        const totalSales = context.totalSales;
        context.set("totalSales", totalSales - lastPurchase.priceSold);

        const totalTransactions = context.totalTransactions;
        context.set("totalTransactions", totalTransactions - 1)

        context.set("lastPurchase", {index: -1, quantity: 0, priceSold: 0});
    }
}

/*
Exporting a function in a NativeScript code-behind file makes it accessible
to the file’s corresponding XML file. In this case, exporting the onNavigatingTo
function here makes the navigatingTo="onNavigatingTo" binding in this page’s XML
file work.
*/

exports.onItemTap = onItemTap;
exports.onQuantityTap = onQuantityTap
exports.onSoldTap = onSoldTap;
exports.onUndoTap = onUndoTap;
exports.onNavigatingTo = onNavigatingTo;
