Typescript-Life
===============

# Using Conway's Game of Life to compare Typescript to Dart

## Introduction
Conway's Life is not really a game, it is a cellular automata that, to our eye, simulates the evolution of a population.  So there are no 'moves' that are made.  Instead, the board (or the world) is populated, then the rules are applied to create a new population.  This is done over and over again so that the population evolves.  Even though the rules are simple, the result can be amazingly complex and interesting.

#### The rules of Life
*   Any live individual with fewer than two live neighbours dies, as if caused by under-population.
*   Any live individual with two or three live neighbours lives on to the next generation.
*   Any live individual with more than three live neighbours dies, as if by overcrowding.
*   Any dead individual with exactly three live neighbours becomes a live individual, as if by reproduction.

The fun part is watching as the population evolves; as you watch the world animate you will understand why Conway called this Life.  For a more detailed and visual explanation, see this [video](https://class.coursera.org/modelthinking/lecture/22?s=e) from the University of Michigan.  If you liked that video, you may want to see the [next one](https://class.coursera.org/modelthinking/lecture/23?s=e) in the series which goes into depth on 1D Cellular Automata.  If you are really interested in Cellular Automata, here is an [entry](http://plato.stanford.edu/entries/cellular-automata/) in the Stanford Encyclopedia of Philosophy that talks about 1D Cellular Automata, the Game of Life (2D Cellular Automata) and their signficance to the study of complexity and emergent behavior.

Here is a page that embeds the TypeScript version, http://ezward.github.io/life/life.html.

## The Code
1. Construct a World.
2. Create a Population within the world.
3. Use a Renderer to draw/animate the Population generations.

### The World
Life is 'played' on a rectangular field, which we can call the world.  Each (x,y) location in the world can be thought of as a place that an individual occupies.  Sometimes this is called a cell; the cellular part of cellular automata.  An individual may be alive or dead.  The alive individuals make up a population.

The world is created with a set number of rows and columns.  At construction, an individual is allocated for each (x,y) location.  Each individual also has a list of it's neighboring individuals, which we build after all the individuals have been created.  Each individual has 8 neighbors; think of a tick-tack-toe board with an 'o' in the middle and x's in all the other spots - the x's are the neighbors.  The neighbor lists are constructed in such a way that that the rectangular world is treated as a torus; the top edge in continuous with the bottom edge and the left edge is continuous with the right edge.   If we did not do this, then individuals at the edges would not have the same number of neighbors as the individuals in the center and so the rules for calculating the next generation would break down at the edges.

A torus looks like a donut or a bagel; see here TODO(add torus link).  Would you rather live on a donut or a bagel?

### The Population
The most important part of Life is how it changes from generation to generation.  That is handled with a population.  A population is a list of living individuals in a world.  Initially, the program sets individuals into the population using their (x,y) position in the world.  After this initial population is created, the next generation can be calculation use the Population.nextGeneration() method.  That will apply the rules of Life to the current population to calculate the set of alive individuals.  In so doing, it also records which individuals from the current population survive survived from the previous generation, which died and which individuals were newly born into the new generation.

Although it is uncommon, a world can have more than one population.  The populations are distinct and do not interact.

### Drawing
Of course, we want to be able to watch all of these changes; that's the fun part.  To draw the population, we use a renderer. Formally, the renderer is an interface the separates the details of drawing from the details of the world, the population and the individuals.  This is an important part of the design; it allows the population to be drawn using any technology or library.  The drawing code simply implements the Renderer.renderIndividual(), then passes the renderer to Population.render() to render the entire Population.  Population.render() does two things; it first erases the previous generation, then draws the new generation.  If we continually loop, creating a new generation and drawing it on each iteration, then we can animate the evolution of the population.

### The Algorithm

#### A Simple Way
A very straightforward way to implement the rules of life would be to visit each (x,y) location in the world and then, at each location, 'ask' all 8 neighbors if they are alive and apply the rules to figure out if that location is born, survives, or dies.  Let's think about how much work this is.  If we have a 10 x 10 world, then we have 100 locations.  So we visit each location, that is 100 locations, then at each location, we visit each heighbor, so that is another 8x100 or 800 locations.  So for a 100 location world, we make 900 location visits.  So the work is 9 time the number of locations.

Let's think bigger; how about a 1000 x 1000 World.  That's 1,000,000 locations.  So, we know that we need to visit each location and it's 8 neighbors, so we will need to make 9,000,000 visits to create each generations.  As you can see, that is a lot of work.  That is especially problematic if you want to see the population animate as it evolves.  We are doing so much work to create the next generation that he animation will be very slow and unsatisfying.

#### A Faster Way
The good news is that we can do a lot better than that by recognizing a couple of things.  First, only live individuals and their immediate neighbors are important in the next generation.  This is because the only way to stay alive or become alive is to have live neighbors, so the live individuals are the imporant ones.  Second, we can see that once Live progresses past the initial population, then the number of live invididuals is much smaller than the number of dead invididuals.  In fact, most of the world becomes a vast array of dead individuals and most of those dead individuals have only dead individuals for neighbors.  Because of the rules of Life, we know that a dead individual with all dead neighbors stays dead (there are no zombies in Conway's Life).  So the key to speeding up the evolution of the population is to focus on live individuals and their neighbors and ignore everything else.

The algorithm that we will use does a couple things to speed things up.  First, we keep a list of live individuals and rather than visit every location we only visit live individuals and their direct neighbors. Next, rather than visit a location and 'asking' how many live neighbors does it have, we use the list of live individuals and then tell their neighbors they have a live neighbor.  The Invididual then keeps track of whether it shoudl be alive or dead as it's live neighbors check in.

For each live individual, we visit it's 8 neighbors to tell each of them that they have a live neighbor.  The work we have to do is still 9xN, but now N is the number of live individuals, which is a small subset of the entire world.  Those locations that are not alive and have no live neighbors, which is most locations, are never visited; they take no work.

### The Devil In the Details
The public api treats each location in the world as an (x,y) coordinate.  The Individual object at each (x,y) location does not need to be part of the public api.  In fact, it should not be part of the public API because that would allow users of the library to contruct Invididuals; there is no reason to construct Invididuals and it is potentially harmful, so we want to prevent it.  The problem is that the World class has a method called _getIndividualXY() that returns an Invidual.  That method is used by the Population class, so it needs to be visible withihn the library, but not visible to users of the library.  This was accomplished differently in TypeScript than in Dart.

In Dart, it was as simple as making the Individual class hidden by prefixing it with an underscore. In Dart, this makes the class (or method or property) private to the library.  That is, it cannot be seen outside of the library, but it is visible to everything in the library.  This turned out to be perfect for my case.  Of course, each place that it is used needs to use the underscored name, but that is part of the Dart system that I have actually started to use in my other programming because it makes it clear at the point of usage that it is private.

In TypeScript, I had to use a lot more code and the results are not entirely satisfactory.  TypeScript includes the ability to add a 'private' modifier to a class or method or property.  So my first attempt was to make both the Individual class and the _getIndividualXY() method private.  That did not compile because be when private is applied to a class method, the method become private to just that class and cannot be seen by the rest of the library.  There is currently not way to create a 'library' private method with TypeScript.  So, because _getIndividualXY() must be public, then it's return value, which is an Individual, must be public.  So the only other alternative was to make Individual so that it could not be constructed outside of the library.  I did this by creating a public interface type that exposed methods to get important values, but not to set them.  This exposed another weakness; Typescript does not allow get/set in interfaces.  What I wanted to do was to create an interface that says, "You can read the value of x, you can read the value of y, etc." and use getter syntax to implement that.  However, Typescript does not allow getter syntax in interfaces, so I was forced to implement these as functions.

### Installing Build Tools

#### Installing Nodejs
Both the typescript compiler and the less compiler run using nodejs.  Nodejs is basically Google's V8 Javascript engine packaged to run command line scripts.  Once nodejs is installed, you can install node modules using NPM (commonly referred to as the Node Package Manager).  Nodejs can be installed directly from the project website at [nodejs.org](http://nodejs.org).


#### Intializing the Project Dependencies
The project includes an NPM configuration file called package.json.  It includes a section that declares all of the packages that the project needs to build and run, including most of the necessary development tools; typescript, less and http-server (the exception is Dart, see [Installing Dart SDK](#installing-dart-sdk) below).  You can run this from within the root of the project folder to retrieve all the necessary depenancies:

`npm install`

#### Installing Dart SDK
Find instructions at https://dart.dev/get-dart

#### Installing Dart plugin in Visual Studio Code
See https://dart.dev/tools/vs-code.


### Building

#### Compiling Less Files
Both the Typescript and the Dart versions share the same css file.  We are using less.js for generating our css files.  This is certainly overkill for this project, but part of my goal for this project was to create a build system that is generally useful for small and large projects.  At this point, I have no good solution for running less in 'watch' mode, so it needs to be run each time the life.less file is changed.  From within the life folder, run this command:

```
npx lessc src/less/life.less src/css/life.css
```

#### Compiling the Typescript Version
Build with Typescript is easy.  We can run the typescript compiler in watch mode.  Whenever any of the typescript source files changes, the compiler will detect it and rebuild the javascript file that is used in the html file.  From within the root of the project folder, run this command:

```
npx tsc -w ./src/ts/LifeRunner.ts -outFile ./src/js/life.ts.js --sourcemap
```

That will compile the LifeRunner.ts file, which includes the other TypeScript files using `<reference path="<filename>.ts" />` style references.  This makes it very easy to compile this simple project into a single JavaScript file.  For more complicated projects you would likely use EcmaScript modules.

#### Compiling the Dart Version
We can use the dart to js compiler to create runnable Javascript; see https://dart.dev/tools/dart-compile#js.  From within the life folder, run the dart command (note that the example below assumes dart is on your path; if it is not then you will need to fully qualify the command.)

```
dart compile js -o src/js/life.dart.js src/dart/main.dart
```

### Running
We will run in a browser, but first we need to serve the page.  I've installed a node script using NPM called http-server that runs a local server on port 8080.  From within the life folder, run this command:

```
npx http-server src
```

Now you can open a browser to <kbd>http://localhost:8080/life.ts.html</kbd> to view the typescript version and/or <kbd>http://localhost:8080/life.dart.html</kbd> to see the dart version.


## Differences between TypeScript and Dart

#### Visibility
Typescript uses the 'public' and 'private' keywords to control visibility.  Private methods and properties are completely private to the class so that they are hidden even from cooperating classes in the same source file. This required the Typescript version to declare a public interface for an non-constructable Individual and a private implementation (_Individual) that allowed cooperating code to construct an individual.  This was necessary because the World class has a _getIndividualXY() method that it implements to allow cooperating classes to lookup an individual by it's world coordinates.  In the case of Typescript, there is no way to make this visibible to cooperating code, but invisible to uses of the World class.  This means that users of class will then need to see the return value of _getIndividualXY(), which is an individual.  So, to prevent users from constructing individuals (which they should really not even need to see), we implemented the interface.

    export interface Individual
    {
		...
    }

    class IndividualImpl implements Individual
	{
		...
	}

	export class World
	{
		...
		_getIndividualXY(x: number, y: number): Individual
		{
			...
		}
	}


Dart also has private visibility which is implemented by starting the class name with an underscore.  In Dart, private operates as 'package' private within a module file; cooperating classes in the same source file have access to private methods, but users of the module do not have access to private methods.  This allowed us to create a private Individual class that could be constructed by cooperating classes, but was completely invisible to users of the module.

	class _Individual
	{
		...
	}

	class World
	{
		...
	    _Individual _getIndividualXY(int x, int y)
	    {
			...
	    }
	}


The 'protected' keyword will be implemented in a near-future release of Typescript, which will eliminate the need for the public interface because we can make _getIndividualXY() protected.  However, I still prefer the Dart method as it handles most common cases very simply.  Also, using the underscore in a name, effectively codifying common usage, makes private visibility clear not only where the class (or method or property) is declared, but also where it is used.
