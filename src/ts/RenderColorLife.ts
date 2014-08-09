/// <reference path="WorldOfLife.ts" />
/**
 * Module to render each generation in Conway's
 * Game of Life whose state is defined by
 * WorldOfLife.World and WorldOfLife.Population.
 */
module RenderColorLife
{
    'use strict';

	export class CanvasRenderer implements WorldOfLife.Renderer
	{
        private _canvas: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;
        private _magnification: number;
        
        constructor(theCanvas: HTMLCanvasElement)
        {
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
            this.magnification = 1;
        }
        
        public get magnification() { return this._magnification; }
        public set magnification(magnification: number) { this._magnification = magnification; }
        
        /**
         * Render a frame for the given population.
         * This will erase the previous generation
         * and draw the current generation
         *
         * @param thePopulation 
         */
        public renderFrame(thePopulation: WorldOfLife.Population): void
        {
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
        public renderIndividual(x: number, y: number, isAlive: boolean, wasAlive: boolean)
        {
            if(wasAlive || isAlive)
            {
                //
                // we use different colors for survival, birth and death
                //
                var theFillColor = this._fillColor;
                if(isAlive)
                {
                    if(wasAlive)
                    {
                        theFillColor = "black"; // survival
                    }
                    else
                    {
                        theFillColor = "green"; // birth
                    }
                }
                else if(wasAlive)
                {
                    theFillColor = "red";       // death
                }

                // changing the color can be expensive, so only do it when color actuall changes
                if(theFillColor != this._fillColor)
                {
                    this._context.fillStyle = this._fillColor = theFillColor;
                }
                this._context.fillRect(
                    x * this._magnification, 
                    y * this._magnification, 
                    this._magnification, 
                    this._magnification);
            }
            else 
            {
                // this individual has died more than one generation ago
                // so can just be erased.
                this._context.clearRect(
                    x * this._magnification, 
                    y * this._magnification, 
                    this._magnification, 
                    this._magnification);
            }
        }
        
        private _rendering = false;
        private _fillColor: String;
        private startRender()
        {
            if(this._rendering)
            {
                this.finishRender();
            }
            this._rendering = true;
            this._context.save();
            this._context.fillStyle = this._fillColor = "black";
        }
        
        private finishRender()
        {
            this._context.restore();
            this._rendering = false;
        }
	}
}