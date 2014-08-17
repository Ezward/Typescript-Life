import 'dart:html';
import 'dart:math' as Math;
import 'WorldOfLife.dart';
import 'RenderMagnifiedLife.dart' as RenderMagnifiedLife;

void main()
{
	//
	// get our canvas, synchronize the css size and the canvas coordinate system.
	//
	CanvasElement theStage = document.getElementById("stage-canvas");
    theStage.width = theStage.clientWidth;
    theStage.height = theStage.clientHeight;
    
    int theMagnification = 4;
    int theRows = (theStage.height / theMagnification).floor();
    int theColumns = (theStage.width / theMagnification).floor();
    int theInitialPopulation = ((theRows * theColumns) / 12).round();

	World theWorld = new World(theRows, theColumns);
	Population thePopulation = new Population(theWorld);
        
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
    var random = new Math.Random();
    for(int i = 0; i < theInitialPopulation; i += 1)
    {
        thePopulation.makeAliveXY(random.nextInt(theColumns), random.nextInt(theRows));
    }
    
    var theRenderer = new RenderMagnifiedLife.CanvasRenderer(theStage);
    theRenderer.magnification = theMagnification;
    
    void animationFrame(num theTimeDelta)
    {
        //
        // draw the current population
        //
        theRenderer.renderFrame(thePopulation);

        //
        // calculate the next generation
        //
        thePopulation.nextGeneration();   
    }
            
    void animationLoop(num theTimeDelta)
    {
        animationFrame(theTimeDelta);
        window.animationFrame.then(animationLoop);
    }

	//
	// start the render/generation loop
	//
    animationLoop(0);
}

