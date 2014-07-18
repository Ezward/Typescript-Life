var Arrays;
(function (Arrays) {
    "use strict";

    function newArray2d(rows, columns) {
        if ((rows <= 0) || (columns <= 0)) {
            throw "newArray2d() pass non-positive array size.";
        }

        var theArray = new Array(rows);
        for (var i = 0; i < rows; i += 1) {
            theArray[i] = new Array(columns);
        }

        return theArray;
    }
    Arrays.newArray2d = newArray2d;
})(Arrays || (Arrays = {}));
//# sourceMappingURL=Arrays.js.map
