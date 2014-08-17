/// <reference path="WorldOfLife.ts" />
/// <reference path="RenderSimpleLife.ts" />
/// <reference path="RenderColorLife.ts" />

function main()
{
    'use strict';
    
	//
	// get our canvas, synchronize the css size and the canvas coordinate system.
	//
	var theStage: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("stage-canvas");
    theStage.width = theStage.clientWidth;
    theStage.height = theStage.clientHeight;
    
    var theMagnification: number = 4;
    var theRows: number = (theStage.height / theMagnification) | 0;
    var theColumns: number = (theStage.width / theMagnification) | 0;
    var theInitialPopulation: number = ((theRows * theColumns) / 12) | 0;

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
    
    //
    // create random pattern
    //
    for(var i = 0; i < theInitialPopulation; i += 1)
    {
        thePopulation.makeAliveXY((Math.random() * theColumns) | 0, (Math.random() * theRows) | 0);
    }
    
    
    var theRenderer = new RenderSimpleLife.CanvasRenderer(theStage);
//    var theRenderer = new RenderColorLife.CanvasRenderer(theStage);
    theRenderer.magnification = theMagnification;


	//
	// start the render/generation loop
	//
    var theAnimationLoop = function()
    {
        //
        // draw the population
        //
        theRenderer.renderFrame(thePopulation);
        
        // 
        // generate the next population
        //
        thePopulation.nextGeneration();
        
        window.requestAnimationFrame(theAnimationLoop);
    }
    
    theAnimationLoop();
}

// let's go!!
main();