String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.trimDot = function () {
    return this.replace(/\.$/, "");
};