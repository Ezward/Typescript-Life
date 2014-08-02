library RenderMagnifiedLife;

import 'dart:html';
import 'WorldOfLife.dart' as WorldOfLife;

class CanvasRenderer implements WorldOfLife.Renderer
{
    CanvasElement _canvas;
    CanvasRenderingContext2D _context;
    int _magnification;

    CanvasRenderer(CanvasElement theCanvas)
    {
        this._canvas = theCanvas;
        this._context = theCanvas.getContext("2d");
        this.magnification = 1;
    }

    int get magnification { return this._magnification; }
    set magnification(int magnification) { this._magnification = magnification; }

    /**
     * Render a frame for the given population.
     * This will erase the previous generation
     * and draw the current generation
     *
     * @param thePopulation 
     */
    void renderFrame(WorldOfLife.Population thePopulation)
    {
        this._startRender();
        thePopulation.render(this);
        this._finishRender();
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
    void renderIndividual(int x, int y, bool isAlive, bool wasAlive)
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

    bool _rendering = false;
    String _fillColor;
    void _startRender()
    {
        if(this._rendering)
        {
            this._finishRender();
        }
        this._rendering = true;
        this._context.save();
        this._context.fillStyle = this._fillColor = "black";
    }

    void _finishRender()
    {
        this._context.restore();
        this._rendering = false;
    }
}
