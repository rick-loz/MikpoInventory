const observableModule = require("tns-core-modules/data/observable");
let closeCallback;

function onShownModally(args) {
    const context = args.context;
    closeCallback = args.closeCallback;
    const page = args.object;
    page.bindingContext = observableModule.fromObject(context);
}
exports.onShownModally = onShownModally;

function onConfirmationTap(args) {
    closeCallback(true);
}

function onCancelTap(args) {
    closeCallback(false);
}

exports.onConfirmationTap = onConfirmationTap;
exports.onCancelTap = onCancelTap