var Arrays;
(function (Arrays) {
    function newArray2d(rows, columns) {
        if ((rows <= 0) || (columns <= 0))
            throw "newArray2d() pass non-positive array size.";

        var theArray = new Array(rows);
        for (var i = 0; i < rows; i += 1) {
            theArray[i] = new Array(columns);
        }
    }
    Arrays.newArray2d = newArray2d;
})(Arrays || (Arrays = {}));
