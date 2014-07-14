module Arrays
{
	export function newArray2d(rows : number, columns : number) : any[][]
	{
		if((rows <= 0) || (columns <= 0)) throw "newArray2d() pass non-positive array size.";

		var theArray = new Array(rows);
		for(var i = 0; i < rows; i += 1)
		{
			theArray[i] = new Array(columns);
		}
		
		return theArray;
	}
}
