/// <reference path="WorldOfLife.ts" />

/**
 * Module to render each generation in Conway's
 * Game of Life whose state is defined by
 * WorldOfLife.World and WorldOfLife.Population.
 */
module RenderSimpleLife
{
    "use strict";

	export class CanvasRenderer implements WorldOfLife.Renderer
	{
        private _canvas: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D | null;
        private _magnification: number;

        constructor(theCanvas: HTMLCanvasElement)
        {
            this._canvas = theCanvas;
            this._context = theCanvas.getContext("2d");
            this._magnification = 1;
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
        public renderFrame(thePopulation: WorldOfLife.Population) : void
        {
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
        public renderIndividual(x: number, y: number, isAlive: boolean, wasAlive: boolean): void
        {
            if (isAlive)
            {
                //
                // only need to draw it if newly born,
                // otherwise it was drawn in prior generation
                //
                if (!wasAlive)
                {
                    // newly born
                    this._context?.fillRect(
                        x * this._magnification,
                        y * this._magnification,
                        this._magnification,
                        this._magnification);
                }
            }
            else // dead
            {
                //
                // only need to erase it if it was alive in prior generation
                //
                if (wasAlive)
                {
                    // newly deceased
                    this._context?.clearRect(
                        x * this._magnification,
                        y * this._magnification,
                        this._magnification,
                        this._magnification);
                }
            }
        }

        private _rendering = false;
        private _fillColor: String = "black";
        private startRender(): void
        {
            if (this._rendering)
            {
                this.finishRender();
            }
            this._rendering = true;
            if (this._context) {
                this._context.save();
                this._context.fillStyle = this._fillColor = "black";
            }
        }

        private finishRender(): void
        {
            this._context?.restore();
            this._rendering = false;
        }
	}
}
