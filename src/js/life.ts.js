var Arrays;
(function (Arrays) {
    "use strict";

    function newArray2d(rows, columns) {
        if ((rows <= 0) || (columns <= 0)) {
            throw "newArray2d() passed non-positive array size.";
        }

        var theArray = new Array(rows);
        for (var i = 0; i < rows; i += 1) {
            theArray[i] = new Array(columns);
        }

        return theArray;
    }
    Arrays.newArray2d = newArray2d;
})(Arrays || (Arrays = {}));
var WorldOfLife;
(function (WorldOfLife) {
    "use strict";

    

    var IndividualImpl = (function () {
        function IndividualImpl(id, row, column) {
            this._neighbors = [];
            if ((row < 0) || (column < 0)) {
                throw "Individual.constructor() row or column cannot be negative.";
            }

            this._id = id;
            this._row = row;
            this._column = column;
        }
        IndividualImpl.prototype.row = function () {
            return this._row;
        };
        IndividualImpl.prototype.column = function () {
            return this._column;
        };
        IndividualImpl.prototype.id = function () {
            return this._id;
        };

        IndividualImpl.prototype.addNeighbor = function (theNeighbor) {
            this._neighbors.push(theNeighbor);
        };

        IndividualImpl.prototype.numberOfNeighbors = function () {
            return this._neighbors.length;
        };

        IndividualImpl.prototype.getNeighbor = function (theIndex) {
            if ((theIndex < 0) || (theIndex >= this._neighbors.length)) {
                throw "Individual.getNeighbor() index is out of range.";
            }

            return this._neighbors[theIndex];
        };
        return IndividualImpl;
    })();

    var World = (function () {
        function World(rows, columns) {
            if ((rows <= 0) || (columns <= 0)) {
                throw "World.constructor() was passed non-positive dimensions.";
            }

            this._rows = rows;
            this._columns = columns;
            this._world = Arrays.newArray2d(rows, columns);

            var theId = 1;
            var theRowIndex;
            var theColumnIndex;
            var theRow;
            for (theRowIndex = 0; theRowIndex < rows; theRowIndex += 1) {
                theRow = this._world[theRowIndex];

                for (theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
                    theRow[theColumnIndex] = new IndividualImpl(theId.toString(), theRowIndex, theColumnIndex);
                    theId += 1;
                }
            }

            for (theRowIndex = 0; theRowIndex < rows; theRowIndex += 1) {
                var theAboveRow = this._world[(rows + theRowIndex - 1) % rows];
                theRow = this._world[theRowIndex];
                var theBelowRow = this._world[(theRowIndex + 1) % rows];

                for (theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1) {
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
            get: function () {
                return this._rows;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(World.prototype, "columns", {
            get: function () {
                return this._columns;
            },
            enumerable: true,
            configurable: true
        });

        World.prototype._getIndividualXY = function (x, y) {
            if ((y < 0) || (y >= this._rows)) {
                throw "Population.getIndividualXY() row is out of range.";
            }
            if ((x < 0) || (x >= this._columns)) {
                throw "Population.getIndividualXY() column is out of range.";
            }
            return this._world[y][x];
        };
        return World;
    })();
    WorldOfLife.World = World;

    var Population = (function () {
        function Population(theWorld) {
            this._world = theWorld;
            this._wasAlive = {};
            this._isAlive = {};
            this._touched = {};
            this._toRender = {};
            this._neighborCount = {};
        }
        Population.prototype.isAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                return this.isAlive(theIndividual);
            }
            return false;
        };

        Population.prototype.wasAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                return this.wasAlive(theIndividual);
            }
            return false;
        };

        Population.prototype.makeAliveXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeAlive(theIndividual);
            }
        };

        Population.prototype.makeDeadXY = function (x, y) {
            var theIndividual = this._world._getIndividualXY(x, y);
            if (!!theIndividual) {
                this.makeDead(theIndividual);
            }
        };

        Population.prototype.isAlive = function (theIndividual) {
            return !!(this._isAlive[theIndividual.id()]);
        };

        Population.prototype.wasAlive = function (theIndividual) {
            return !!(this._wasAlive[theIndividual.id()]);
        };

        Population.prototype.makeAlive = function (theIndividual) {
            var theIndividualId = theIndividual.id();
            this._isAlive[theIndividualId] = theIndividual;
            this._touched[theIndividualId] = theIndividual;
            this._toRender[theIndividualId] = theIndividual;
        };

        Population.prototype.makeDead = function (theIndividual) {
            var theIndividualId = theIndividual.id();
            delete this._isAlive[theIndividualId];
            this._touched[theIndividualId] = theIndividual;
            this._toRender[theIndividualId] = theIndividual;
        };

        Population.prototype.nextGeneration = function () {
            this._wasAlive = this._isAlive;
            this._toRender = this._touched;
            this._isAlive = {};
            this._touched = {};
            this._neighborCount = {};

            var theId;
            for (theId in this._wasAlive) {
                if (this._wasAlive.hasOwnProperty(theId)) {
                    var theIndividual = this._wasAlive[theId];
                    this._touched[theId] = theIndividual;

                    for (var j = 0; j < 8; j += 1) {
                        var theNeighbor = theIndividual.getNeighbor(j);
                        var theNeighborId = theNeighbor.id();

                        this._neighborCount[theNeighborId] = this._neighborCount.hasOwnProperty(theNeighborId) ? (this._neighborCount[theNeighborId] + 1) : 1;
                        switch (this._neighborCount[theNeighborId]) {
                            case 2: {
                                if (this.wasAlive(theNeighbor)) {
                                    this._isAlive[theNeighborId] = theNeighbor;
                                }
                                break;
                            }
                            case 3: {
                                this._isAlive[theNeighborId] = theNeighbor;
                                break;
                            }
                            case 4: {
                                delete this._isAlive[theNeighborId];
                                break;
                            }
                        }
                    }
                }
            }

            for (theId in this._isAlive) {
                if (this._isAlive.hasOwnProperty(theId)) {
                    this._toRender[theId] = this._touched[theId] = this._isAlive[theId];
                }
            }
        };

        Population.prototype.render = function (theRenderer) {
            var theId;
            for (theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    var theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column(), theIndividual.row(), this.isAlive(theIndividual), this.wasAlive(theIndividual));
                }
            }
        };

        Population.prototype.erase = function (theRenderer) {
            var theId;
            for (theId in this._toRender) {
                if (this._toRender.hasOwnProperty(theId)) {
                    var theIndividual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column(), theIndividual.row(), false, false);
                }
            }
        };
        return Population;
    })();
    WorldOfLife.Population = Population;
})(WorldOfLife || (WorldOfLife = {}));
var RenderSimpleLife;
(function (RenderSimpleLife) {
    "use strict";

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

        CanvasRenderer.prototype.renderFrame = function (thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        };

        CanvasRenderer.prototype.renderIndividual = function (x, y, isAlive, wasAlive) {
            if (isAlive) {
                if (!wasAlive) {
                    this._context.fillRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
                }
            } else {
                if (wasAlive) {
                    this._context.clearRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
                }
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
var RenderColorLife;
(function (RenderColorLife) {
    "use strict";

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

        CanvasRenderer.prototype.renderFrame = function (thePopulation) {
            this.startRender();
            thePopulation.render(this);
            this.finishRender();
        };

        CanvasRenderer.prototype.renderIndividual = function (x, y, isAlive, wasAlive) {
            if (wasAlive || isAlive) {
                var theFillColor = this._fillColor;
                if (isAlive) {
                    if (wasAlive) {
                        theFillColor = "black";
                    } else {
                        theFillColor = "green";
                    }
                } else if (wasAlive) {
                    theFillColor = "red";
                }

                if (theFillColor !== this._fillColor) {
                    this._context.fillStyle = this._fillColor = theFillColor;
                }
                this._context.fillRect(x * this._magnification, y * this._magnification, this._magnification, this._magnification);
            } else {
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
    RenderColorLife.CanvasRenderer = CanvasRenderer;
})(RenderColorLife || (RenderColorLife = {}));
function main() {
    "use strict";

    var theStage = document.getElementById("stage-canvas");
    theStage.width = theStage.clientWidth;
    theStage.height = theStage.clientHeight;

    var theMagnification = 4;
    var theRows = (theStage.height / theMagnification) | 0;
    var theColumns = (theStage.width / theMagnification) | 0;
    var theInitialPopulation = ((theRows * theColumns) / 12) | 0;

    var theWorld = new WorldOfLife.World(theRows, theColumns);
    var thePopulation = new WorldOfLife.Population(theWorld);

    thePopulation.makeAliveXY(1, 0);
    thePopulation.makeAliveXY(2, 1);
    thePopulation.makeAliveXY(0, 2);
    thePopulation.makeAliveXY(1, 2);
    thePopulation.makeAliveXY(2, 2);

    for (var i = 0; i < theInitialPopulation; i += 1) {
        thePopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
    }

    var theRenderer = new RenderSimpleLife.CanvasRenderer(theStage);

    theRenderer.magnification = theMagnification;

    var theAnimationLoop = function (theTime) {
        theRenderer.renderFrame(thePopulation);

        thePopulation.nextGeneration();

        window.requestAnimationFrame(theAnimationLoop);
    };

    theAnimationLoop(0);
}

main();
//# sourceMappingURL=life.ts.js.map
