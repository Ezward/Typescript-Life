/// <reference path="WorldOfLife.ts" />
/// <reference path="RenderSimpleLife.ts" />
/// <reference path="RenderColorLife.ts" />

module main
{
    "use strict";

    /**
     * Class to animate a Life simulation
     */
    export class LifeRunner
    {
        private _canvas : HTMLCanvasElement;
        private _running : boolean = false;
        private _renderer : WorldOfLife.Renderer;
        private _world: WorldOfLife.World;
        private _population : WorldOfLife.Population;
        private _animationCallback;

        constructor(theCanvas: HTMLCanvasElement)
        {
            this._canvas = theCanvas;
            this._renderer = new RenderColorLife.CanvasRenderer(theCanvas);
            this._animationCallback = (theTime : number) => this._animationLoop(theTime);

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
        public get running() : boolean {
            return this._running;
        }

        /**
         * @param number the number of pixels on a side of a cell
         */
        public get magnification() : number {
            return this._renderer.magnification;
        }
        public set magnification(theMagnification : number) {
            this._renderer.magnification = theMagnification;
        }

        public get columns() : number {
            return this._world ? this._world.columns : 0;
        }
        public get rows() : number {
            return this._world ? this._world.rows : 0;
        }

        /**
         * start the animation
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        public start() : LifeRunner
        {
            if(!this._running)
            {
                this._running = true;
                this._animationLoop(new Date().getTime());
            }
            return this;
        }

        /**
         * pause the animation
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        public stop() : LifeRunner
        {
            this._running = false;
            return this;
        }

        /**
         * stop the animation and clear the world.
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        public clear() : LifeRunner
        {
            this.stop();

            //
            // get our canvas, synchronize the css size and the canvas coordinate system.
            //
            var theStage = this._canvas;
            theStage.width = theStage.clientWidth;
            theStage.height = theStage.clientHeight;
            theStage.getContext("2d")?.clearRect(0, 0, theStage.width, theStage.height);

            var theMagnification = this._renderer.magnification;
            var theRows: number = (theStage.height / theMagnification) | 0;
            var theColumns: number = (theStage.width / theMagnification) | 0;

            var theWorld: WorldOfLife.World = new WorldOfLife.World(theRows, theColumns);
            var thePopulation: WorldOfLife.Population = new WorldOfLife.Population(theWorld);

            this._world = theWorld;
            this._population = thePopulation;
            return this;
        }

        /**
         * restart the animation with random field
         * @return LifeRunner this LifeRunner for call chaining purposes
         */
        public reset() : LifeRunner
        {
            this.clear();

            var theRows: number = this._world.rows;
            var theColumns: number = this._world.columns;
            var thePopulation: WorldOfLife.Population = this._population;

            //
            // create random pattern
            //
            var theInitialPopulation: number = ((theRows * theColumns) / 12) | 0;
            for (var i: number = 0; i < theInitialPopulation; i += 1)
            {
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
        public isAliveXY(x: number, y: number): boolean
        {
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
        public wasAliveXY(x: number, y: number): boolean
        {
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
        public makeAliveXY(x: number, y: number): LifeRunner
        {
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
        public makeDeadXY(x: number, y: number): LifeRunner
        {
            this._population.makeDeadXY(x, y);
            return this;
        }


        private _animationLoop(theTime : number) : void
        {
            if(this._running)
            {
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

}
