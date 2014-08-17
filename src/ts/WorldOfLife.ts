/// <reference path="Arrays.ts" />

/**
 * Conway 2d world.
 * The world has all the Individuals and their state,
 * but does not do the drawing of the world.
 */
module WorldOfLife
{
    'use strict';

    export interface Renderer
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
         * Implements the WorldOfLife.Renderer api.  This 
         * hook that is called repeatedly by Population.render() 
         * as it iterates over the population in order to draw
         * the erase the previous generation and draw the current
         * generation.
         *
         * @param x the horizontal position of the individual in the World.
         * @param y the vertical position of the individual in the World.
         * @param isAlive true if individual is alive in this generation.
         * @param wasAlive true if individual was alive in previous generation
         */
        renderIndividual(x: number, y: number, isAlive: boolean, wasAlive: boolean): void;
    }
    
    /**
     * public interface for an Individual cell in the World.
     * We export this rather than a concrete implementation (such
     * as IndividualImpl) so that the module client cannot directly
     * construct an Individual.
     */
    export interface Individual
    {
        /**
         * @return the vertical location of the Individual in the World.
         */
        row(): number;
        
        /**
         * @return the horizontal location of the Individual in the World.
         */
        column(): number;
        
        /**
         * @return the unique identifier for the Individual.
         */
        id(): string;
        
        /**
         * @return the number of neighbors
         */
        numberOfNeighbors(): number;
	
        /**
         * Get a neighbor, given the index.
         *
         * @param theIndex the index of the neighbor.
         * @return the neighbor
         * @throws if theIndex is out of range
         */
        getNeighbor(theIndex : number) : Individual;
    }
        
	/**
	 * Implementation of an Individual cell in the Life world.
     * This is not exported as part of the module's public
     * api so that we can make addNeighbor() hidden.
	 */
    class IndividualImpl implements Individual
	{
		private _row : number;
		private _column : number;
		private _id: string;
		private _neighbors : Individual[] = [];
	
		public constructor(id: string, row : number, column : number)
		{
			if((row < 0) || (column < 0)) throw "Individual.constructor() row or column cannot be negative.";
		
			this._id = id;
			this._row = row;
			this._column = column;
		}
	
		public row(): number { return this._row; }
		public column(): number { return this._column; }
		public id(): string { return this._id; }
	
		public addNeighbor(theNeighbor : Individual)
		{
			this._neighbors.push(theNeighbor);
		}
        
        /**
         * @return the number of neighbors
         */
        public numberOfNeighbors(): number
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
		public getNeighbor(theIndex : number) : Individual
		{
			if((theIndex < 0) || (theIndex >= this._neighbors.length)) throw "Individual.getNeighbor() index is out of range.";
		
			return this._neighbors[theIndex];
		}
	}

	/**
	 * The world grid, made of rows and columns of Individuals
	 */
	export class World
	{
		private _rows: number;
		private _columns : number;
		private _world: IndividualImpl[][];
	
        /**
         * @param rows horizontal size of world
         * @param columns vertical size of world.
         */
        constructor(rows : number, columns : number)
		{
            if((rows <= 0) || (columns <= 0)) throw "World.constructor() was passed non-positive dimensions."
            
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
			for(var theRowIndex = 0; theRowIndex < rows; theRowIndex += 1)
			{
				var theRow = this._world[theRowIndex];
			
				for(var theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1)
				{
					theRow[theColumnIndex] = new IndividualImpl(theId.toString(), theRowIndex, theColumnIndex);
					theId += 1;
				}
			}
		
			// hook up neighbor connections
			for(var theRowIndex = 0; theRowIndex < rows; theRowIndex += 1)
			{
				var theAboveRow = this._world[(rows + theRowIndex - 1) % rows];	// wrap index
				var theRow = this._world[theRowIndex];
				var theBelowRow = this._world[(theRowIndex + 1) % rows];			// wrap index
			
				for(var theColumnIndex = 0; theColumnIndex < columns; theColumnIndex += 1)
				{
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
	
        /**
         * get the number of rows in the World
         * (vertical size of the World).
         */
		public get rows(): number { return this._rows; }
        
        /**
         * get the number of columns in the World
         * (horizontal size of the World).
         */
		public get columns(): number { return this._columns; }
	
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
		_getIndividualXY(x: number, y: number): Individual
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
	export class Population
	{
        private _world: World;
		private _wasAlive: {[id: string]: Individual};      // individuals alive in the previous generation
		private _isAlive: {[id: string]: Individual};       // individuals alive in the current generation
        private _touched: {[id: string]: Individual};       // individuals that need to be drawn in this generation
        private _toRender: {[id: string]: Individual};      // individuals that need to be rendered (erased or drawn)
        private _neighborCount: {[id: string]: number};     // living neighbor count for individuals.
        
        /**
         * Construct a Population for a World.  
         * NOTE: it is possible to have more than one Population in a World.
         * @param theWorld is the World this Population exists within.
         */
        constructor(theWorld: World)
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
        public isAliveXY(x: number, y: number): boolean
        {
            var theIndividual: Individual = this._world._getIndividualXY(x, y);
            if(!!theIndividual)
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
        public wasAliveXY(x: number, y: number): boolean
        {
            var theIndividual: Individual = this._world._getIndividualXY(x, y);
            if(!!theIndividual)
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
        public makeAliveXY(x: number, y: number): void
        {
            var theIndividual: Individual = this._world._getIndividualXY(x, y);
            if(!!theIndividual)
            {
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
        public makeDeadXY(x: number, y: number): void
        {
            var theIndividual: Individual = this._world._getIndividualXY(x, y);
            if(!!theIndividual)
            {
                this.makeDead(theIndividual);
            }
        }
        
        /**
         * Determine if the given Individual is alive
         * in the current generation.
         */
		private isAlive(theIndividual: Individual): boolean
		{
			return !!(this._isAlive[theIndividual.id()]);
		}
        
        /** 
         * Determine if the given Individual was alive
         * in the previous generation.
         */
		private wasAlive(theIndividual: Individual): boolean
		{
			return !!(this._wasAlive[theIndividual.id()]);
		}
	
        /**
         * Make an Invididual alive in the current generation.
         */
		private makeAlive(theIndividual: Individual): void
		{
			// add to the isAlive collection
			this._isAlive[theIndividual.id()] = theIndividual;	// for quick lookup of active individuals
            this._touched[theIndividual.id()] = theIndividual;    // so it is drawn.
		}
	
        /**
         * Make an Invididual dead in the current generation.
         */
		private makeDead(theIndividual: Individual): void
		{
			// remove from the isAlive collection
			delete this._isAlive[theIndividual.id()];
            this._touched[theIndividual.id()] = theIndividual;    // so it is drawn.
		}
		
		/**
		 * Calculate the next generation using these rules;
		 *
		 * Any live individual with fewer than two live neighbours dies, as if caused by under-population.
		 * Any live individual with two or three live neighbours lives on to the next generation.
		 * Any live individual with more than three live neighbours dies, as if by overcrowding.
		 * Any dead individual with exactly three live neighbours becomes a live individual, as if by reproduction.
		 */
		public nextGeneration(): void
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
			for(var theId in this._wasAlive)
			{
				if(this._wasAlive.hasOwnProperty(theId))
				{
					var theIndividual = this._wasAlive[theId];
                    this._touched[theId] = theIndividual;   // will be drawn one way or another

			
					// tell the neighbors that that they have an alive neighbor.
					for(var j = 0; j < 8; j += 1)
					{
						var theNeighbor = theIndividual.getNeighbor(j);
                        var theNeighborId = theNeighbor.id();
				
						//
						// as the live neighbors count goes up, use the state
						// to decide if the individual will be alive 
						//
                        this._neighborCount[theNeighborId] = 
                            this._neighborCount.hasOwnProperty(theNeighborId) 
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
            for(var theId in this._isAlive)
            {
                if(this._isAlive.hasOwnProperty(theId))
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
        public render(theRenderer: Renderer): void
        {
            for(var theId in this._toRender)
            {
                if(this._toRender.hasOwnProperty(theId))
                {
                    var theIndividual: Individual = this._toRender[theId];
                    theRenderer.renderIndividual(
                        theIndividual.column(), 
                        theIndividual.row(), 
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
        public erase(theRenderer: Renderer): void
        {
            for(var theId in this._toRender)
            {
                if(this._toRender.hasOwnProperty(theId))
                {
                    var theIndividual: Individual = this._toRender[theId];
                    theRenderer.renderIndividual(theIndividual.column(), theIndividual.row(), false, false);
                }
            }
        }

	}

}

