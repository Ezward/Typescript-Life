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
/// <reference path="Arrays.ts" />
/**
* Conway 2d world.
* The world has all the Individuals and their state,
* but does not do the drawing of the world.
*/
var WorldOfLife;
(function (WorldOfLife) {
    'use strict';

    /**
    * Individual cell in the Life world.
    */
    var Individual = (function () {
        function Individual(id, row, column) {
            this._neighbors = [];
            if ((row < 0) || (column < 0))
                throw "Individual.constructor() row or column cannot be negative.";

            this._id = id;
            this._row = row;
            this._column = column;
        }
        Object.defineProperty(Individual.prototype, "row", {
            get: function () {
                return this._row;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual.prototype, "column", {
            get: function () {
                return this._column;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Individual.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });

        Individual.prototype.addNeighbor = function (theNeighbor) {
            this._neighbors.push(theNeighbor);
        };

        Individual.prototype.getNeighbor = function (theIndex) {
            if ((theIndex < 0) || (theIndex >= this._neighbors.length))
                throw "Individual.getNeighbor() index is out of range.";

            return this._neighbors[theIndex];
        };
        return Individual;
    })();
    WorldOfLife.Individual = Individual;

    /**
    * The world grid, made of rows and columns of Individuals
    */
    var World = (function () {
        /**
        * @param rows horizontal size of world
        * @param columns vertical size of world.
        */
        function World(rows, columns) {
            if ((rows <= 0) || (columns <= 0))
                throw "World.constructor() was passed non-positive dimensions.";

            //
            // create the map
            //
            this._rows = rows;
            this._columns = columns;
            this._world = Arrays.newArray2d(rows, columns);

            //
            // construct all the individuals
            //
            var theId = 1;
            for (var theRowIndex = 0; theRowIndex < rows; theRowIndex += 1) {
                var theRow = this._world[theRowIndex];

                for (var theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
                    theRow[theColumnIndex] = new Individual(theId.toString(), theRowIndex, theColumnIndex);
                    theId += 1;
                }
            }

            for (var theRowIndex = 0; theRowIndex < rows; theRowIndex += 1) {
                var theAboveRow = this._world[(rows + theRowIndex - 1) % rows];
                var theRow = this._world[theRowIndex];
                var theBelowRow = this._world[(theRowIndex + 1) % rows];

                for (var theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
                    var theIndividual = theRow[theColumnIndex];
                    var theLeftIndex = (columns + theColumnIndex - 1) % columns;
                    var theRightIndex = (theColumnIndex + 1) % columns;

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
        Object.defineProperty(World.prototype, "rows", {
            /**
            * get the number of rows in the World
            * (vertical size of the World).
            */
            get: function () {
                return this._rows;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(World.prototype, "columns", {
            /**
            * get the number of columns in the World
            * (horizontal size of the World).
            */
            get: function () {
                return this._columns;
            },
            enumerable: true,
            configurable: true
        });

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
        World.prototype._getIndividualXY = function (x, y) {
            if ((y < 0) || (y >= this._rows))
                throw "Population.getIndividualXY() row is out of range.";
            if ((x < 0) || (x >= this._columns))
                throw "Population.getIndividualXY() column is out of range.";
            return this._world[y][x];
        };
        return World;
    })();
    WorldOfLife.World = World;

    /**
    * An evolving population in the World.
    * This is used to make Individuals alive or dead,
    * and to evolve the World generation by generation.
    */
    var Population = (function () {
        /**
        * Construct a Population for a World.
        * NOTE: it is possible to have more than one Population in a World.
        * @param theWorld is the World this Population exists within.
        */
        function Population(theWorld) {
            this._isAlive = {};
            this._touched = {};
            this._toRender = {};
            this._neighborCount = {};
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
        Population.prototype.isAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                return this.isAlive(theIndividual);
            }
            return false;
        };

        /**
        * Determine if the Individual at the given location
        * was alive in the previous generation.
        *
        * @param x the horizontal position of individual in the world
        * @param y the vertical position of individual in the world
        * @return true if alive in previous generation
        * @throws if the row or column is out of range.
        */
        Population.prototype.wasAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                return this.wasAlive(theIndividual);
            }
            return false;
        };

        /**
        * Make an Invididual at the given location
        * alive in the current generation.
        *
        * @param x the horizontal position of individual in the world
        * @param y the vertical position of individual in the world
        * @throws if the row or column is out of range.
        */
        Population.prototype.makeAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeAlive(theIndividual);
            }
        };

        /**
        * Make an Invididual at the given location
        * dead in the current generation.
        *
        * @param x the horizontal position of individual in the world
        * @param y the vertical position of individual in the world
        * @throws if the row or column is out of range.
        */
        Population.prototype.makeDeadXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeDead(theIndividual);
            }
        };

        /**
        * Determine if the given Individual is alive
        * in the current generation.
        */
        Population.prototype.isAlive = function (theIndividual) {
            return !!(this._isAlive[theIndividual.id]);
        };

        /**
        * Determine if the given Individual was alive
        * in the previous generation.
        */
        Population.prototype.wasAlive = function (theIndividual) {
            return !!(this._wasAlive[theIndividual.id]);
        };

        /**
        * Make an Invididual alive in the current generation.
        */
        Population.prototype.makeAlive = function (theIndividual) {
            // add to the isAlive collection
            this._isAlive[theIndividual.id] = theIndividual; // for quick lookup of active individuals
            this._touched[theIndividual.id] = theIndividual; // so it is drawn.
        };

        /**
        * Make an Invididual dead in the current generation.
        */
        Population.prototype.makeDead = function (theIndividual) {
            // remove from the isAlive collection
            delete this._isAlive[theIndividual.id];
            this._touched[theIndividual.id] = theIndividual; // so it is drawn.
        };

        /**
        * Calculate the next generation using these rules;
        *
        * Any live individual with fewer than two live neighbours dies, as if caused by under-population.
        * Any live individual with two or three live neighbours lives on to the next generation.
        * Any live individual with more than three live neighbours dies, as if by overcrowding.
        * Any dead individual with exactly three live neighbours becomes a live individual, as if by reproduction.
        */
        Population.prototype.nextGeneration = function () {
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

            for (var theId in this._wasAlive) {
                if (this._wasAlive.hasOwnProperty(theId)) {
                    var theIndividual = this._wasAlive[theId];
                    this._touched[theId] = theIndividual; // will be drawn one way or another

                    for (var j = 0; j < 8; j += 1) {
                        var theNeighbor = theIndividual.getNeighbor(j);

                        //
                        // as the live neighbors count goes up, use the state
                        // to decide if the individual will be alive
                        //
                        this._neighborCount[theNeighbor.id] = this._neighborCount.hasOwnProperty(theNeighbor.id) ? (this._neighborCount[theNeighbor.id] + 1) : 1;
                        switch (this._neighborCount[theNeighbor.id]) {
                            case 2: {
                                // * Any live cell with two or three live neighbours lives on to the next generation.
                                if (this.wasAlive(theNeighbor)) {
                                    this._isAlive[theNeighbor.id] = theNeighbor; // for quick lookup of active individuals
                                }
                                break;
                            }
                            case 3: {
                                // * Any live cell with two or three live neighbours lives on to the next generation.
                                // * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
                                this._isAlive[theNeighbor.id] = theNeighbor; // for quick lookup of active individuals
                                break;
                            }
                            case 4: {
                                // * Any live cell with more than three live neighbours dies, as if by overcrowding.
                                delete this._isAlive[theNeighbor.id];
                                break;
                            }
                        }
                    }
                }
            }

            for (var theId in this._isAlive) {
                if (this._isAlive.hasOwnProperty(theId)) {
                    this._toRender[theId] = this._touched[theId] = this._isAlive[theId]; // alive individuals are drawn.
                }
            }
        };

        /**
        * Draw the population with the given renderer
        * @param theRenderer a Renderer used to draw individuals.
        */
        Population.prototype.render = function (theRenderer) {
            for (var theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    var theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column, theIndividual.row, this.isAlive(theIndividual), this.wasAlive(theIndividual));
                }
            }
        };

        /**
        * Erase the population with the given renderer
        */
        Population.prototype.erase = function (theRenderer) {
            for (var theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    var theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column, theIndividual.row, false, false);
                }
            }
        };
        return Population;
    })();
    WorldOfLife.Population = Population;
})(WorldOfLife || (WorldOfLife = {}));
/// <reference path="WorldOfLife.ts" />
/**
* Module to render each generation in Conway's
* Game of Life whose state is defined by
* WorldOfLife.World and WorldOfLife.Population.
*/
var RenderLife;
(function (RenderLife) {
    var CanvasRenderer = (function () {
        function CanvasRenderer(theCanvas) {
            this._rendering = false;
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
        }
        /**
        * Render a frame for the given population.
        * This will erase the previous generation
        * and draw the current generation
        *
        * @param thePopulation
        */
        CanvasRenderer.prototype.renderFrame = function (thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        };

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
        CanvasRenderer.prototype.renderIndividual = function (x, y, isAlive, wasAlive) {
            if (wasAlive || isAlive) {
                //
                // we use different colors for survival, birth and death
                //
                var theFillColor = this._fillColor;
                if (isAlive) {
                    if (wasAlive) {
                        theFillColor = "black"; // survival
                    } else {
                        theFillColor = "green"; // birth
                    }
                } else if (wasAlive) {
                    theFillColor = "red"; // death
                }

                // changing the color can be expensive, so only do it when color actuall changes
                if (theFillColor != this._fillColor) {
                    this._context.fillStyle = this._fillColor = theFillColor;
                }
                this._context.fillRect(x, y, 1, 1);
            } else {
                // this individual has died more than one generation ago
                // so can just be erased.
                this._context.clearRect(x, y, 1, 1);
            }
        };

        CanvasRenderer.prototype.startRender = function () {
            if (this._rendering) {
                this.finishRender();
            }
            this._rendering = true;
            this._context.save();
            this._context.fillStyle = this._fillColor = "black";
        };

        CanvasRenderer.prototype.finishRender = function () {
            this._context.restore();
            this._rendering = false;
        };
        return CanvasRenderer;
    })();
    RenderLife.CanvasRenderer = CanvasRenderer;
})(RenderLife || (RenderLife = {}));
/// <reference path="WorldOfLife.ts" />
/**
* Module to render each generation in Conway's
* Game of Life whose state is defined by
* WorldOfLife.World and WorldOfLife.Population.
*/
var RenderSimpleLife;
(function (RenderSimpleLife) {
    var CanvasRenderer = (function () {
        function CanvasRenderer(theCanvas) {
            this._rendering = false;
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
        }
        /**
        * Render a frame for the given population.
        * This will erase the previous generation
        * and draw the current generation
        *
        * @param thePopulation
        */
        CanvasRenderer.prototype.renderFrame = function (thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        };

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
        CanvasRenderer.prototype.renderIndividual = function (x, y, isAlive, wasAlive) {
            if (isAlive) {
                this._context.fillRect(x, y, 1, 1);
            } else {
                this._context.clearRect(x, y, 1, 1);
            }
        };

        CanvasRenderer.prototype.startRender = function () {
            if (this._rendering) {
                this.finishRender();
            }
            this._rendering = true;
            this._context.save();
            this._context.fillStyle = this._fillColor = "black";
        };

        CanvasRenderer.prototype.finishRender = function () {
            this._context.restore();
            this._rendering = false;
        };
        return CanvasRenderer;
    })();
    RenderSimpleLife.CanvasRenderer = CanvasRenderer;
})(RenderSimpleLife || (RenderSimpleLife = {}));
/// <reference path="WorldOfLife.ts" />
/**
* Module to render each generation in Conway's
* Game of Life whose state is defined by
* WorldOfLife.World and WorldOfLife.Population.
*/
var RenderMagnifiedLife;
(function (RenderMagnifiedLife) {
    'use strict';

    var CanvasRenderer = (function () {
        function CanvasRenderer(theCanvas) {
            this._rendering = false;
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
            this.magnification = 1;
        }
        Object.defineProperty(CanvasRenderer.prototype, "magnification", {
            get: function () {
                return this._magnification;
            },
            set: function (magnification) {
                this._magnification = magnification;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Render a frame for the given population.
        * This will erase the previous generation
        * and draw the current generation
        *
        * @param thePopulation
        */
        CanvasRenderer.prototype.renderFrame = function (thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        };

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
        CanvasRenderer.prototype.renderIndividual = function (x, y, isAlive, wasAlive) {
            if (wasAlive || isAlive) {
                //
                // we use different colors for survival, birth and death
                //
                var theFillColor = this._fillColor;
                if (isAlive) {
                    if (wasAlive) {
                        theFillColor = "black"; // survival
                    } else {
                        theFillColor = "green"; // birth
                    }
                } else if (wasAlive) {
                    theFillColor = "red"; // death
                }

                // changing the color can be expensive, so only do it when color actuall changes
                if (theFillColor != this._fillColor) {
                    this._context.fillStyle = this._fillColor = theFillColor;
                }
                this._context.fillRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
            } else {
                // this individual has died more than one generation ago
                // so can just be erased.
                this._context.clearRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
            }
        };

        CanvasRenderer.prototype.startRender = function () {
            if (this._rendering) {
                this.finishRender();
            }
            this._rendering = true;
            this._context.save();
            this._context.fillStyle = this._fillColor = "black";
        };

        CanvasRenderer.prototype.finishRender = function () {
            this._context.restore();
            this._rendering = false;
        };
        return CanvasRenderer;
    })();
    RenderMagnifiedLife.CanvasRenderer = CanvasRenderer;
})(RenderMagnifiedLife || (RenderMagnifiedLife = {}));
/// <reference path="WorldOfLife.ts" />
/// <reference path="RenderLife.ts" />
/// <reference path="RenderSimpleLife.ts" />
/// <reference path="RenderMagnifiedLife.ts" />
function main() {
    'use strict';

    //
    // get our canvas, synchronize the css size and the canvas coordinate system.
    //
    var theStage = document.getElementById("stage-canvas");
    theStage.width = theStage.clientWidth;
    theStage.height = theStage.clientHeight;

    var theMagnification = 2;
    var theRows = (theStage.height / theMagnification) | 0;
    var theColumns = (theStage.width / theMagnification) | 0;

    var theWorld = new WorldOfLife.World(theRows, theColumns);
    var thePopulation = new WorldOfLife.Population(theWorld);

    //
    // create a glider
    //
    thePopulation.makeAliveXY(1, 0);
    thePopulation.makeAliveXY(2, 1);
    thePopulation.makeAliveXY(0, 2);
    thePopulation.makeAliveXY(1, 2);
    thePopulation.makeAliveXY(2, 2);

    for (var i = 0; i < 6000; i += 1) {
        thePopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
    }

    //
    // create a second population
    //
    //    var theOtherPopulation: WorldOfLife.Population = new WorldOfLife.Population(theWorld);
    //    for(var i = 0; i < 6000; i += 1)
    //    {
    //        theOtherPopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
    //    }
    //    var theRenderer = new RenderLife.CanvasRenderer(theStage);
    //    var theRenderer = new RenderSimpleLife.CanvasRenderer(theStage);
    var theRenderer = new RenderMagnifiedLife.CanvasRenderer(theStage);
    theRenderer.magnification = theMagnification;

    //
    // start the render/generation loop
    //
    var theAnimationLoop = function () {
        //
        // draw both populations
        //
        theRenderer.renderFrame(thePopulation);

        //        theRenderer.renderFrame(theOtherPopulation);
        thePopulation.nextGeneration();

        //        theOtherPopulation.nextGeneration();
        window.requestAnimationFrame(theAnimationLoop);
    };

    theAnimationLoop();
}

main();
//# sourceMappingURL=main.js.map
