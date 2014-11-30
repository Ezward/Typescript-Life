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
        private _canvas : HTMLCanvasElement = null;
        private _running : boolean = false;
        private _renderer : RenderSimpleLife.CanvasRenderer;
        private _population : WorldOfLife.Population;
        private _animationCallback;
        
        constructor(theCanvas: HTMLCanvasElement) 
        {
            this._canvas = theCanvas;
            this._renderer = new RenderSimpleLife.CanvasRenderer(theCanvas);
            this._animationCallback = (theTime : number) => this._animationLoop(theTime);
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
        
        /**
         * start the animation
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
         */
        public stop() : LifeRunner 
        {
            this._running = false;
            return this;
        }
        
        /**
         * restart the animation with random field
         */
        public reset() : LifeRunner
        {
            this.stop();
            
            //
            // get our canvas, synchronize the css size and the canvas coordinate system.
            //
            var theStage = this._canvas;
            theStage.width = theStage.clientWidth;
            theStage.height = theStage.clientHeight;
            theStage.getContext("2d").clearRect(0, 0, theStage.width, theStage.height);

            var theMagnification = this._renderer.magnification;
            var theRows: number = (theStage.height / theMagnification) | 0;
            var theColumns: number = (theStage.width / theMagnification) | 0;
            var theInitialPopulation: number = ((theRows * theColumns) / 12) | 0;

            var theWorld: WorldOfLife.World = new WorldOfLife.World(theRows, theColumns);
            var thePopulation: WorldOfLife.Population = new WorldOfLife.Population(theWorld);
                
            //
            // create random pattern
            //
            for (var i: number = 0; i < theInitialPopulation; i += 1)
            {
                thePopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
            }
    
            this._population = thePopulation;
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
