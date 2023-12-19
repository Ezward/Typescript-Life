var Arrays;
(function (Arrays) {
    "use strict";
    function newArray2d(rows, columns) {
        if ((rows <= 0) || (columns <= 0)) {
            throw "newArray2d() passed non-positive array size.";
        }
        const theArray = new Array(rows);
        for (let i = 0; i < rows; i += 1) {
            theArray[i] = new Array(columns);
        }
        return theArray;
    }
    Arrays.newArray2d = newArray2d;
})(Arrays || (Arrays = {}));
/// <reference path="Arrays.ts" />
/**
 * Conway 2d world.
 * The world has all the Individuals and their state,
 * but does not do the drawing of the world.
 */
var WorldOfLife;
(function (WorldOfLife) {
    "use strict";
    /**
     * Implementation of an Individual cell in the Life world.
     * This is not exported as part of the module's public
     * api so that we can make addNeighbor() hidden.
     */
    class IndividualImpl {
        constructor(id, row, column) {
            this._neighbors = [];
            if ((row < 0) || (column < 0)) {
                throw "Individual.constructor() row or column cannot be negative.";
            }
            this._id = id;
            this._row = row;
            this._column = column;
        }
        row() { return this._row; }
        column() { return this._column; }
        id() { return this._id; }
        addNeighbor(theNeighbor) {
            this._neighbors.push(theNeighbor);
        }
        /**
         * @return the number of neighbors
         */
        numberOfNeighbors() {
            return this._neighbors.length;
        }
        /**
         * Get a neighbor, given the index.
         *
         * @param theIndex the index of the neighbor.
         * @return the neighbor
         * @throws if theIndex is out of range
         */
        getNeighbor(theIndex) {
            if ((theIndex < 0) || (theIndex >= this._neighbors.length)) {
                throw "Individual.getNeighbor() index is out of range.";
            }
            return this._neighbors[theIndex];
        }
    }
    /**
     * The world grid, made of rows and columns of Individuals
     */
    class World {
        /**
         * @param rows horizontal size of world
         * @param columns vertical size of world.
         */
        constructor(rows, columns) {
            if ((rows <= 0) || (columns <= 0)) {
                throw "World.constructor() was passed non-positive dimensions.";
            }
            //
            // create the map
            //
            this._rows = rows;
            this._columns = columns;
            this._world = Arrays.newArray2d(rows, columns);
            //
            // construct all the individuals
            //
            for (let theRowIndex = 0, theId = 1; theRowIndex < rows; theRowIndex += 1) {
                const theRow = this._world[theRowIndex];
                for (let theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
                    theRow[theColumnIndex] = new IndividualImpl(theId.toString(), theRowIndex, theColumnIndex);
                    theId += 1;
                }
            }
            // hook up neighbor connections
            for (let theRowIndex = 0; theRowIndex < rows; theRowIndex += 1) {
                const theAboveRow = this._world[(rows + theRowIndex - 1) % rows]; // wrap index
                const theRow = this._world[theRowIndex];
                const theBelowRow = this._world[(theRowIndex + 1) % rows]; // wrap index
                for (let theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
                    const theIndividual = theRow[theColumnIndex];
                    const theLeftIndex = (columns + theColumnIndex - 1) % columns;
                    const theRightIndex = (theColumnIndex + 1) % columns;
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
        get rows() { return this._rows; }
        /**
         * get the number of columns in the World
         * (horizontal size of the World).
         */
        get columns() { return this._columns; }
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
        _getIndividualXY(x, y) {
            if ((y < 0) || (y >= this._rows)) {
                throw "Population.getIndividualXY() row is out of range.";
            }
            if ((x < 0) || (x >= this._columns)) {
                throw "Population.getIndividualXY() column is out of range.";
            }
            return this._world[y][x];
        }
    }
    WorldOfLife.World = World;
    /**
     * An evolving population in the World.
     * This is used to make Individuals alive or dead,
     * and to evolve the World generation by generation.
     */
    class Population {
        /**
         * Construct a Population for a World.
         * NOTE: it is possible to have more than one Population in a World.
         * @param theWorld is the World this Population exists within.
         */
        constructor(theWorld) {
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
        isAliveXY(x, y) {
            const theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
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
        wasAliveXY(x, y) {
            const theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
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
        makeAliveXY(x, y) {
            const theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeAlive(theIndividual);
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
        makeDeadXY(x, y) {
            const theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeDead(theIndividual);
            }
        }
        /**
         * Determine if the given Individual is alive
         * in the current generation.
         */
        isAlive(theIndividual) {
            return !!(this._isAlive[theIndividual.id()]);
        }
        /**
         * Determine if the given Individual was alive
         * in the previous generation.
         */
        wasAlive(theIndividual) {
            return !!(this._wasAlive[theIndividual.id()]);
        }
        /**
         * Make an Invididual alive in the current generation.
         */
        makeAlive(theIndividual) {
            // add to the isAlive collection
            const theIndividualId = theIndividual.id();
            this._isAlive[theIndividualId] = theIndividual; // for quick lookup of active individuals
            this._touched[theIndividualId] = theIndividual; // so it is drawn.
            this._toRender[theIndividualId] = theIndividual; // so it is drawn.
        }
        /**
         * Make an Invididual dead in the current generation.
         */
        makeDead(theIndividual) {
            // remove from the isAlive collection
            const theIndividualId = theIndividual.id();
            delete this._isAlive[theIndividualId];
            this._touched[theIndividualId] = theIndividual; // so it is drawn.
            this._toRender[theIndividualId] = theIndividual; // so it is drawn.
        }
        /**
         * Calculate the next generation using these rules;
         *
         * Any live individual with fewer than two live neighbours dies, as if caused by under-population.
         * Any live individual with two or three live neighbours lives on to the next generation.
         * Any live individual with more than three live neighbours dies, as if by overcrowding.
         * Any dead individual with exactly three live neighbours becomes a live individual, as if by reproduction.
         */
        nextGeneration() {
            //
            // isAlive is now wasAlive.
            // we will calculate a new alive.
            // We can use isAlive and wasAlive to decide who was born, who died and who survived.
            //
            this._wasAlive = this._isAlive;
            this._toRender = this._touched; // anything we drew, we need to erase
            this._isAlive = {}; // pessimistic!
            this._touched = {}; // those that must be drawn.
            this._neighborCount = {}; // number of neighbors for each neighbor of alive Invididual
            //
            // loop through all the alive individuals and
            // tell their neighbors that they are alive.
            //
            for (let theId in this._wasAlive) {
                if (this._wasAlive.hasOwnProperty(theId)) {
                    const theIndividual = this._wasAlive[theId];
                    this._touched[theId] = theIndividual; // will be drawn one way or another
                    // tell the neighbors that that they have an alive neighbor.
                    for (let j = 0; j < 8; j += 1) {
                        const theNeighbor = theIndividual.getNeighbor(j);
                        const theNeighborId = theNeighbor.id();
                        //
                        // as the live neighbors count goes up, use the state
                        // to decide if the individual will be alive
                        //
                        this._neighborCount[theNeighborId] =
                            this._neighborCount.hasOwnProperty(theNeighborId)
                                ? (this._neighborCount[theNeighborId] + 1)
                                : 1;
                        switch (this._neighborCount[theNeighborId]) {
                            case 2:
                                {
                                    // * Any live cell with two or three live neighbours lives on to the next generation.
                                    if (this.wasAlive(theNeighbor)) {
                                        this._isAlive[theNeighborId] = theNeighbor; // for quick lookup of active individuals
                                    }
                                    break;
                                }
                            case 3:
                                {
                                    // * Any live cell with two or three live neighbours lives on to the next generation.
                                    // * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                                    this._isAlive[theNeighborId] = theNeighbor; // for quick lookup of active individuals
                                    break;
                                }
                            case 4:
                                {
                                    // * Any live cell with more than three live neighbours dies, as if by overcrowding.
                                    delete this._isAlive[theNeighborId];
                                    break;
                                }
                        }
                    }
                }
            }
            //
            // add all living individuals to the draw list
            //
            for (let theId in this._isAlive) {
                if (this._isAlive.hasOwnProperty(theId)) {
                    this._toRender[theId] = this._touched[theId] = this._isAlive[theId]; // alive individuals are drawn.
                }
            }
        }
        /**
         * Draw the population with the given renderer
         *
         * @param theRenderer a Renderer used to draw individuals.
         */
        render(theRenderer) {
            for (let theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    const theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column(), theIndividual.row(), this.isAlive(theIndividual), this.wasAlive(theIndividual));
                }
            }
        }
        /**
         * Erase the population with the given renderer
         *
         * @param theRenderer a Renderer used to draw individuals.
         */
        erase(theRenderer) {
            for (let theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    const theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column(), theIndividual.row(), false, false);
                }
            }
        }
    }
    WorldOfLife.Population = Population;
})(WorldOfLife || (WorldOfLife = {}));
/// <reference path="WorldOfLife.ts" />
/**
 * Module to render each generation in Conway's
 * Game of Life whose state is defined by
 * WorldOfLife.World and WorldOfLife.Population.
 */
var RenderSimpleLife;
(function (RenderSimpleLife) {
    "use strict";
    class CanvasRenderer {
        constructor(theCanvas) {
            this._rendering = false;
            this._fillColor = "black";
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
            this._magnification = 1;
        }
        get magnification() { return this._magnification; }
        set magnification(magnification) { this._magnification = magnification; }
        /**
         * Render a frame for the given population.
         * This will erase the previous generation
         * and draw the current generation
         *
         * @param thePopulation
         */
        renderFrame(thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        }
        /**
         * Draw (or erase) an individual at the World location.
         *
         * Implements the WorldOfLife.Renderer interface.  This
         * hook that is called repeatedly by Population.render()
         * as it iterates over the population in order to draw
         * the erase the previous generation and draw the current
         * generataion.
         *
         * @param x the horizontal position of the individual in the World.
         * @param y the vertical position of the individual in the World.
         * @param isAlive true if individual is alive in this generation.
         * @param wasAlive true if individual was alive in previous generation
         */
        renderIndividual(x, y, isAlive, wasAlive) {
            if (isAlive) {
                //
                // only need to draw it if newly born,
                // otherwise it was drawn in prior generation
                //
                if (!wasAlive) {
                    // newly born
                    this._context?.fillRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
                }
            }
            else // dead
             {
                //
                // only need to erase it if it was alive in prior generation
                //
                if (wasAlive) {
                    // newly deceased
                    this._context?.clearRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
                }
            }
        }
        startRender() {
            if (this._rendering) {
                this.finishRender();
            }
            this._rendering = true;
            if (this._context) {
                this._context.save();
                this._context.fillStyle = this._fillColor = "black";
            }
        }
        finishRender() {
            this._context?.restore();
            this._rendering = false;
        }
    }
    RenderSimpleLife.CanvasRenderer = CanvasRenderer;
})(RenderSimpleLife || (RenderSimpleLife = {}));
/// <reference path="WorldOfLife.ts" />
/**
 * Module to render each generation in Conway's
 * Game of Life whose state is defined by
 * WorldOfLife.World and WorldOfLife.Population.
 */
var RenderColorLife;
(function (RenderColorLife) {
    "use strict";
    class CanvasRenderer {
        constructor(theCanvas) {
            this._rendering = false;
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
            this._magnification = 1;
            this._fillColor = "black";
        }
        get magnification() { return this._magnification; }
        set magnification(magnification) { this._magnification = magnification; }
        /**
         * Render a frame for the given population.
         * This will erase the previous generation
         * and draw the current generation
         *
         * @param thePopulation
         */
        renderFrame(thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        }
        /**
         * Draw (or erase) an individual at the World location.
         *
         * Implements the WorldOfLife.Renderer api.  This
         * hook that is called repeatedly by Population.render()
         * as it iterates over the population in order to draw
         * the erase the previous generation and draw the current
         * generataion.
         *
         * @param x the horizontal position of the individual in the World.
         * @param y the vertical position of the individual in the World.
         * @param isAlive true if individual is alive in this generation.
         * @param wasAlive true if individual was alive in previous generation
         */
        renderIndividual(x, y, isAlive, wasAlive) {
            if (wasAlive || isAlive) {
                //
                // we use different colors for survival, birth and death
                //
                let theFillColor = this._fillColor;
                if (isAlive) {
                    if (wasAlive) {
                        theFillColor = "black"; // survival
                    }
                    else {
                        theFillColor = "green"; // birth
                    }
                }
                else if (wasAlive) {
                    theFillColor = "red"; // death
                }
                // changing the color can be expensive, so only do it when color actuall changes
                if (theFillColor !== this._fillColor) {
                    this._fillColor = theFillColor;
                }
                if (this._context) {
                    this._context.fillStyle = this._fillColor;
                    this._context.fillRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
                }
            }
            else {
                // this individual has died more than one generation ago
                // so can just be erased.
                this._context?.clearRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
            }
        }
        startRender() {
            if (this._rendering) {
                this.finishRender();
            }
            this._rendering = true;
            this._fillColor = "black";
            if (this._context) {
                this._context.save();
                this._context.fillStyle = this._fillColor;
            }
        }
        finishRender() {
            this._context?.restore();
            this._rendering = false;
        }
    }
    RenderColorLife.CanvasRenderer = CanvasRenderer;
})(RenderColorLife || (RenderColorLife = {}));
/// <reference path="WorldOfLife.ts" />
/// <reference path="RenderSimpleLife.ts" />
/// <reference path="RenderColorLife.ts" />
var main;
(function (main) {
    "use strict";
    /**
     * Class to animate a Life simulation
     */
    class LifeRunner {
        constructor(theCanvas) {
            this._running = false;
            this._canvas = theCanvas;
            this._renderer = new RenderColorLife.CanvasRenderer(theCanvas);
            this._animationCallback = (theTime) => this._animationLoop(theTime);
            //
            // init world and population to 1.  This will get reset
            // when we do the initial clear(), at which point the world will
            // be resized to match the canvas.
            //
            this._world = new WorldOfLife.World(2, 1);
            this._population = new WorldOfLife.Population(this._world);
            this._renderer.magnification = 4;
        }
        //
        // state
        //
        /**
         * @return true if simutlation is running, false if not
         */
        get running() {
            return this._running;
        }
        /**
         * @param number the number of pixels on a side of a cell
         */
        get magnification() {
            return this._renderer.magnification;
        }
        set magnification(theMagnification) {
            this._renderer.magnification = theMagnification;
        }
        get columns() {
            return this._world ? this._world.columns : 0;
        }
        get rows() {
            return this._world ? this._world.rows : 0;
        }
        /**
         * start the animation
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        start() {
            if (!this._running) {
                this._running = true;
                this._animationLoop(new Date().getTime());
            }
            return this;
        }
        /**
         * pause the animation
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        stop() {
            this._running = false;
            return this;
        }
        /**
         * stop the animation and clear the world.
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        clear() {
            this.stop();
            //
            // get our canvas, synchronize the css size and the canvas coordinate system.
            //
            const theStage = this._canvas;
            theStage.width = theStage.clientWidth;
            theStage.height = theStage.clientHeight;
            theStage.getContext("2d")?.clearRect(0, 0, theStage.width, theStage.height);
            const theMagnification = this._renderer.magnification;
            const theRows = (theStage.height / theMagnification) | 0;
            const theColumns = (theStage.width / theMagnification) | 0;
            const theWorld = new WorldOfLife.World(theRows, theColumns);
            const thePopulation = new WorldOfLife.Population(theWorld);
            this._world = theWorld;
            this._population = thePopulation;
            return this;
        }
        /**
         * restart the animation with random field
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        reset() {
            this.clear();
            const theRows = this._world.rows;
            const theColumns = this._world.columns;
            const thePopulation = this._population;
            //
            // create random pattern
            //
            const theInitialPopulation = ((theRows * theColumns) / 12) | 0;
            for (let i = 0; i < theInitialPopulation; i += 1) {
                thePopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
            }
            return this;
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
        isAliveXY(x, y) {
            return this._population.isAliveXY(x, y);
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
        wasAliveXY(x, y) {
            return this._population.wasAliveXY(x, y);
        }
        /**
         * Make an Invididual at the given location
         * alive in the current generation.
         *
         * @param x the horizontal position of individual in the world
         * @param y the vertical position of individual in the world
         * @return LifeRunner this LifeRunner for call chaining purposes
         * @throws if the row or column is out of range.
         */
        makeAliveXY(x, y) {
            this._population.makeAliveXY(x, y);
            return this;
        }
        /**
         * Make an Invididual at the given location
         * dead in the current generation.
         *
         * @param x the horizontal position of individual in the world
         * @param y the vertical position of individual in the world
         * @return LifeRunner this LifeRunner for call chaining purposes
         * @throws if the row or column is out of range.
         */
        makeDeadXY(x, y) {
            this._population.makeDeadXY(x, y);
            return this;
        }
        _animationLoop(theTime) {
            if (this._running) {
                //
                // draw the population
                //
                this._renderer.renderFrame(this._population);
                //
                // generate the next population
                //
                this._population.nextGeneration();
                window.requestAnimationFrame(this._animationCallback);
            }
        }
    }
    main.LifeRunner = LifeRunner;
})(main || (main = {}));
//# sourceMappingURL=life.ts.js.map