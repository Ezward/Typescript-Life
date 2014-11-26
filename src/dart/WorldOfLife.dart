import 'Arrays.dart';

abstract class Renderer
{
    /**
     * Draw (or erase) an individual at the World location.
     *
     * If the invidual is alive, it must be drawn.
     * If the invidual is neither isAlive or wasAlive, it
     * must be erased.
     * If the individual is not alive, but was alive, the
     * implementation can decide to draw or erase as desired.
     *
     * Implements the WorldOfLife.Renderer api.  This is a 
     * hook that is called repeatedly by Population.render() 
     * as it iterates over the population in order to 
     * erase the previous generation and draw the current
     * generation.
     *
     * @param x the horizontal position of the individual in the World.
     * @param y the vertical position of the individual in the World.
     * @param isAlive true if individual is alive in this generation.
     * @param wasAlive true if individual was alive in previous generation
     */
    void renderIndividual(int x, int y, bool isAlive, bool wasAlive);
}

/**
 * Implementation of an Individual cell in the Life world.
 * This is not exported as part of the module's public
 * api so that we can make addNeighbor() hidden.  This makes the
 * individual effectively immutable. 
 */
class _Individual
{
    int _row;
    int _column;
    String _id;
    List<_Individual> _neighbors = [];

    _Individual(String id, int row, int column)
    {
        if((row < 0) || (column < 0)) throw "_Individual() row or column cannot be negative.";

        this._id = id;
        this._row = row;
        this._column = column;
    }

    int get row => this._row; 
    int get column => this._column;
    String get id => this._id; 

    void addNeighbor(_Individual theNeighbor)
    {
        this._neighbors.add(theNeighbor);
    }

    /**
     * @return the number of neighbors
     */
    int numberOfNeighbors()
    {
        return this._neighbors.length;
    }

    /**
     * Get a neighbor, given the index.
     *
     * @param theIndex the index of the neighbor.
     * @return the neighbor
     * @throws if theIndex is out of range
     */
    _Individual getNeighbor(int theIndex)
    {
        if((theIndex < 0) || (theIndex >= this._neighbors.length)) throw "_Individual.getNeighbor() index is out of range.";

        return this._neighbors[theIndex];
    }

}

/**
 * The world grid, made of rows and columns of _Individuals
 */
class World
{
    int _rows;
    int _columns;
    List<List<_Individual>> _world;  // list of lists of individual

    /**
     * @param rows horizontal size of world
     * @param columns vertical size of world.
     */
    World(int rows, int columns)
    {
        if((rows <= 0) || (columns <= 0)) throw new Error("World.constructor() was passed non-positive dimensions.");

        //
        // create the map
        //
        this._rows = rows;
        this._columns = columns;
        this._world = newArray2d(rows, columns);

        //
        // construct all the individuals
        //
        int theId = 1;
        for(int theRowIndex = 0; theRowIndex < rows; theRowIndex += 1)
        {
            List<_Individual> theRow = this._world[theRowIndex];

            for(int theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1)
            {
                theRow[theColumnIndex] = new _Individual(theId.toString(), theRowIndex, theColumnIndex);
                theId += 1;
            }
        }

        // hook up neighbor connections
        for(int theRowIndex = 0; theRowIndex < rows; theRowIndex += 1)
        {
            List<_Individual> theAboveRow = this._world[(rows + theRowIndex - 1) % rows];	// wrap index
            List<_Individual> theRow = this._world[theRowIndex];
            List<_Individual> theBelowRow = this._world[(theRowIndex + 1) % rows];			// wrap index

            for(int theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1)
            {
                var theIndividual = theRow[theColumnIndex];
                int theLeftIndex = (columns + theColumnIndex - 1) % columns;
                int theRightIndex = (theColumnIndex + 1) % columns;

                theIndividual.addNeighbor(theAboveRow[theLeftIndex]);
                theIndividual.addNeighbor(theAboveRow[theColumnIndex]);
                theIndividual.addNeighbor(theAboveRow[theRightIndex]);

                theIndividual.addNeighbor(theRow[theLeftIndex]);
                theIndividual.addNeighbor(theRow[theRightIndex]);

                theIndividual.addNeighbor(theBelowRow[theLeftIndex]);
                theIndividual.addNeighbor(theBelowRow[theColumnIndex]);
                theIndividual.addNeighbor(theBelowRow[theRightIndex]);
            }
        }
    }

    /**
     * get the number of rows in the World
     * (vertical size of the World).
     */
    int get rows => this._rows;

    /**
     * get the number of columns in the World
     * (horizontal size of the World).
     */
    int get columns { return this._columns; }

    /**
     * get an Individual at the given row and column.
     * 
     * NOTE: should only be used by a Population.  This
     *       is not part of the public API, but Typescript
     *       has no way to indicate a module private method.
     *
     * @param row is the vertical position of the Individual
     * @param column is the horizontal position of the individual
     * @return the Individual at column, row
     * @throws if the row or column is out of range.
     */
    _Individual _getIndividualXY(int x, int y)
    {
        if((y < 0) || (y >= this._rows)) throw "Population.getIndividualXY() row is out of range.";
        if((x < 0) || (x >= this._columns)) throw "Population.getIndividualXY() column is out of range.";
        return this._world[y][x];
    }	
}

/**
 * An evolving population in the World.
 * This is used to make Individuals alive or dead,
 * and to evolve the World generation by generation.
 */
class Population
{
    World _world;
    Map<String, _Individual> _wasAlive;      // individuals alive in the previous generation
    Map<String, _Individual>  _isAlive;      // individuals alive in the current generation
    Map<String, _Individual>  _touched;      // individuals that need to be drawn in this generation
    Map<String, _Individual>  _toRender;     // individuals that need to be rendered (erased or drawn)
    Map<String, int>  _neighborCount;       // living neighbor count for individuals.

    /**
     * Construct a Population for a World.  
     * NOTE: it is possible to have more than one Population in a World.
     * @param theWorld is the World this Population exists within.
     */
    Population(World theWorld)
    {
        this._world = theWorld;
        this._wasAlive = {};
        this._isAlive = {};
        this._touched = {};
        this._toRender = {};
        this._neighborCount = {};
    }


    /**
     * Determine if the Individual at the given location
     * is alive in the current generation.
     *
     * @param x the horizontal position of individual in the world
     * @param y the vertical position of individual in the world
     * @return true if alive in this generation
     * @throws if the row or column is out of range.
     */
    bool isAliveXY(int x, int y)
    {
        _Individual theIndividual = this._world._getIndividualXY(x, y);
        if(null != theIndividual)
        {
            return this.isAlive(theIndividual);
        }
        return false;
    }

    /**
     * Determine if the Individual at the given location
     * was alive in the previous generation.
     *
     * @param x the horizontal position of individual in the world
     * @param y the vertical position of individual in the world
     * @return true if alive in previous generation
     * @throws if the row or column is out of range.
     */
    bool wasAliveXY(int x, int y)
    {
        _Individual theIndividual = this._world._getIndividualXY(x, y);
        if(null != theIndividual)
        {
            return this.wasAlive(theIndividual);
        }
        return false;
    }

    /**
     * Make an Invididual at the given location
     * alive in the current generation.
     *
     * @param x the horizontal position of individual in the world
     * @param y the vertical position of individual in the world
     * @throws if the row or column is out of range.
     */
    void makeAliveXY(int x, int y)
    {
        _Individual theIndividual = this._world._getIndividualXY(x, y);
        if(null != theIndividual)
        {
            this._makeAlive(theIndividual);
        }
    }

    /**
     * Make an Invididual at the given location
     * dead in the current generation.
     *
     * @param x the horizontal position of individual in the world
     * @param y the vertical position of individual in the world
     * @throws if the row or column is out of range.
     */
    void makeDeadXY(int x, int y)
    {
        _Individual theIndividual = this._world._getIndividualXY(x, y);
        if(null != theIndividual)
        {
            this._makeDead(theIndividual);
        }
    }

    /**
     * Determine if the given Individual is alive
     * in the current generation.
     */
    bool isAlive(_Individual theIndividual)
    {
        return null != (this._isAlive[theIndividual.id]);
    }

    /** 
     * Determine if the given Individual was alive
     * in the previous generation.
     */
    bool wasAlive(_Individual theIndividual)
    {
        return null != (this._wasAlive[theIndividual.id]);
    }

    /**
     * Make an Invididual alive in the current generation.
     */
    void _makeAlive(_Individual theIndividual)
    {
        // add to the isAlive collection
        final String theIndividualId = theIndividual.id;
        this._isAlive[theIndividualId] = theIndividual;	// for quick lookup of active individuals
        this._touched[theIndividualId] = theIndividual;    // so it is drawn.
        this._toRender[theIndividualId] = theIndividual;    // so it is drawn.
    }

    /**
     * Make an Invididual dead in the current generation.
     */
    void _makeDead(_Individual theIndividual)
    {
        // remove from the isAlive collection
        final String theIndividualId = theIndividual.id;
        this._isAlive.remove(theIndividualId);
        this._touched[theIndividualId] = theIndividual;    // so it is drawn.
        this._toRender[theIndividualId] = theIndividual;    // so it is drawn.
    }

    /**
     * Calculate the next generation using these rules;
     *
     * Any live individual with fewer than two live neighbours dies, as if caused by under-population.
     * Any live individual with two or three live neighbours lives on to the next generation.
     * Any live individual with more than three live neighbours dies, as if by overcrowding.
     * Any dead individual with exactly three live neighbours becomes a live individual, as if by reproduction.
     */
    void nextGeneration()
    {
        //
        // isAlive is now wasAlive.
        // we will calculate a new alive.
        // We can use isAlive and wasAlive to decide who was born, who died and who survived.
        //
        this._wasAlive = this._isAlive;
        this._toRender = this._touched; // anything we drew, we need to erase
        this._isAlive = {};	// pessimistic!
        this._touched = {}; // those that must be drawn.
        this._neighborCount = {};   // number of neighbors for each neighbor of alive Invididual


        //
        // loop through all the alive individuals and
        // tell their neighbors that they are alive.
        //
        for(String theId in this._wasAlive.keys)
        {
            // if(this._wasAlive.hasOwnProperty(theId))
            {
                var theIndividual = this._wasAlive[theId];
                this._touched[theId] = theIndividual;   // will be drawn one way or another


                // tell the neighbors that that they have an alive neighbor.
                for(int j = 0; j < 8; j += 1)
                {
                    _Individual theNeighbor = theIndividual.getNeighbor(j);
                    String theNeighborId = theNeighbor.id;

                    //
                    // as the live neighbors count goes up, use the state
                    // to decide if the individual will be alive 
                    //
                    this._neighborCount[theNeighborId] = 
                        this._neighborCount.containsKey(theNeighborId) 
                            ? (this._neighborCount[theNeighborId] + 1) 
                            : 1;
                    switch(this._neighborCount[theNeighborId])
                    {
                        case 2:
                        {
                            // * Any live cell with two or three live neighbours lives on to the next generation.
                            if(this.wasAlive(theNeighbor))
                            {
                                this._isAlive[theNeighborId] = theNeighbor;	// for quick lookup of active individuals
                            }
                            break;
                        }
                        case 3:
                        {
                            // * Any live cell with two or three live neighbours lives on to the next generation.
                            // * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                            this._isAlive[theNeighborId] = theNeighbor;	// for quick lookup of active individuals
                            break;
                        }
                        case 4:
                        {
                            // * Any live cell with more than three live neighbours dies, as if by overcrowding.
                            // delete this._isAlive[theNeighborId];
                            this._isAlive.remove(theNeighborId);
                            break;
                        }
                    }
                }
            }
        }

        //
        // add all living individuals to the draw list
        //
        for(String theId in this._isAlive.keys)
        {
            //if(this._isAlive.hasOwnProperty(theId))
            {
                this._toRender[theId] = this._touched[theId] = this._isAlive[theId]; // alive individuals are drawn.
            }
        }
    }

    /**
     * Draw the population with the given renderer
     *
     * @param theRenderer a Renderer used to draw individuals.
     */
    void render(Renderer theRenderer)
    {
        for(String theId in this._toRender.keys)
        {
            // if(this._toRender.hasOwnProperty(theId))
            {
                _Individual theIndividual = this._toRender[theId];
                theRenderer.renderIndividual(
                    theIndividual.column, 
                    theIndividual.row, 
                    this.isAlive(theIndividual), 
                    this.wasAlive(theIndividual));
            }
        }
    }

    /**
     * Erase the population with the given renderer
     *
     * @param theRenderer a Renderer used to draw individuals.
     */
    void erase(Renderer theRenderer)
    {
        for(String theId in this._toRender.keys)
        {
            // if(this._toRender.hasOwnProperty(theId))
            {
                _Individual theIndividual = this._toRender[theId];
                theRenderer.renderIndividual(theIndividual.column, theIndividual.row, false, false);
            }
        }
    }

}
