module Arrays
{
    "use strict";

	export function newArray2d(rows : number, columns : number) : any[][]
	{
		if ((rows <= 0) || (columns <= 0)) { throw "newArray2d() passed non-positive array size."; }

		var theArray: any[][] = new Array(rows);
		for (var i: number = 0; i < rows; i += 1)
		{
			theArray[i] = new Array(columns);
		}

		return theArray;
	}
}
