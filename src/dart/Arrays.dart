library Arrays;

List<List> newArray2d(int rows, int columns)
{
    if ((rows <= 0) || (columns <= 0)) { throw "newArray2d() pass non-positive array size."; }

    List<List> theArray = new List(rows);
    for (int i = 0; i < rows; i += 1)
    {
        theArray[i] = new List(columns);
    }

    return theArray;
}
