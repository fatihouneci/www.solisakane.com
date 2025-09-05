
/**
 * @file async-foreach.js
 * @description
 * EN: This file extends the Array prototype to add an asynchronous forEach method.
 * It allows iterating over an array with asynchronous operations, ensuring each operation completes before moving to the next.
 * FR: Ce fichier étend le prototype d'Array pour ajouter une méthode forEach asynchrone.
 * Elle permet d'itérer sur un tableau avec des opérations asynchrones, en s'assurant que chaque opération se termine avant de passer à la suivante.
 */

// EN: Extend Array.prototype with an asynchronous forEach method
// FR: Étendre Array.prototype avec une méthode forEach asynchrone
Array.prototype.forEachAsync = async function forEach(callback, thisArg) {
    if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
    }
    var array = this;
    thisArg = thisArg || this;
    for (var i = 0, l = array.length; i !== l; ++i) {
        await callback.call(thisArg, array[i], i, array);
    }
};
