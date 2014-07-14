/// <reference path="WorldOfLife.ts" />
/// <reference path="RenderLife.ts" />
/// <reference path="RenderSimpleLife.ts" />
/// <reference path="RenderMagnifiedLife.ts" />

function main()
{
	//
	// get our canvas
	//
	var theStage: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("stage-canvas");
    theStage.width = theStage.clientWidth;
    theStage.height = theStage.clientHeight;
    
    var theMagnification: number = 3;
    var theRows: number = (theStage.height / theMagnification) | 0;
    var theColumns: number = (theStage.width / theMagnification) | 0;

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
    for(var i = 0; i < 6000; i += 1)
    {
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
    var theAnimationLoop = function()
    {
        //
        // draw both populations
        //
        theRenderer.renderFrame(thePopulation);
//        theRenderer.renderFrame(theOtherPopulation);
        
        thePopulation.nextGeneration();
//        theOtherPopulation.nextGeneration();
        
        window.requestAnimationFrame(theAnimationLoop);
    }
    
    theAnimationLoop();
}

main();