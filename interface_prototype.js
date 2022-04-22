// Main background
let Interface = {
    main: {
        Mode: "main",
        BackgroundColor: "#95B8C4",
        TextColor: "#FFFFFF"
    },
    meditation: {
        Mode: "meditation",
        Mood: ["focused", "cheerful", "loving"],
        BackgroundColor: ["#A3CCA9", "#A3C7CC", "#CAA4CC"],
        CircleColor: ["#3C9344", "#38B2BF", "#C960A5"],
        Sound: ["sound_focused", "sound_cheerful", "sound_loving"]
    }
};

let mode = "loading";
let mood = false;
let moodNum = false;
let bgd = Interface.main.BackgroundColor;
let diam;

//mouseCounter used only for prototype
let mouse = true;

// Particle system
let system;
let rad;
let angle;

//Images
let namaste;

//Offscreen graphic for circle effect
let pg;

var hand = 0;  // the number of hands being tracked
var handX = 0;
var handY = 0;
var handZ = 0;

//Sound
let sound_cheerful, sound_focused, sound_loving, sound_bell;
let sound = false;
let sound_prev = true;
let val; // control sound volume

//Speech
var myRec;

// KNN
let data;
let data_all = [];
let row = [];
let labels = [];
let test = [];
let knn;
let ans ;
let ans_prev;
let count = -1;

// Mudra img
let one;
let two;
let three;
let four;
let five;

// LEAP SENSOR
//let controller;
//let swiper;
//let listener;
//let brush = [];
let LEAPSCALE = 0.6;
let g = null;
let flat_frame = null;
let swipeDirection = null;


function preload() {
    sound_cheerful = loadSound('sounds/cheerful.mp3');
    sound_focused = loadSound('sounds/focused.mp3');
    sound_loving = loadSound('sounds/loving.mp3');
    sound_bell = loadSound('sounds/bell.mp3');
    namaste = loadImage('assets/namaste.png');

    // Load mudra img
    one = loadImage('assets/1.png');
    two = loadImage('assets/2.png');
    three = loadImage('assets/3.png');
    four = loadImage('assets/4.png');
    five = loadImage('assets/5.png');


    // preload table data
    data = loadTable('data/all_data_copy.csv', 'csv');
    test_data = loadTable('data/test_data_Kat.csv', 'csv');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(bgd);
    fill(Interface.main.TextColor);
    noStroke();
    textAlign(CENTER, CENTER);

    pg = createGraphics(windowWidth, windowHeight);

    // console.log("DATA: " + data);
    // // how many rows?
    // console.log("Row Count: " + data.getRowCount());
    // // what are the columns?
    // console.log("Columns: " + data.getColumnCount());

    ///////////////////// KNN
    ans = null;
    ans_prev = null;

    for (var i = 0; i < data.getRowCount(); i++) {
        row = [];
        for (var j = 0; j < data.getColumnCount(); j++) {
            if (j < 15) {
                row.push(parseFloat(data.getNum(i, j)));
            } else {
                labels.push(parseInt(data.getNum(i, j), 10));
            }

        }

        data_all.push(row);

    }
    console.log("All DATA: " + data_all);
    console.log(typeof(data_all))


    for (var i = 0; i < data.getRowCount(); i++){
        console.log(data_all[i])
        // console.log(labels[i])
    }

    //  read test data
    for (var i = 0; i < test_data.getRowCount(); i++) {
        row = [];
        for (var j = 0; j < test_data.getColumnCount(); j++) {
            if (j < 15) {
                row.push(parseFloat(test_data.getNum(i, j)));
            }

        }

        test.push(row);

    }
    console.log("test DATA: " + test);
    // console.log(typeof(data_all))

    for (var i = 0; i < test_data.getRowCount(); i++){
        console.log(test[i])
        // console.log(labels[i])
    }
    // end of reading test data


    // train knn

    knn = new KNN(data_all, labels, {k:1}); // consider 2 nearest neighbors
    console.log(knn)
    /////////////////////

    //Particle system
    system = new ParticleSystem(createVector(windowWidth / 2, windowHeight / 2));

    // controller = new Leap.Controller({
    //     enableGestures: true
    // });
    // controller.connect();
    //controller.setBackground(false);
    // swiper = controller.gesture('swipe');

    //Speech
    myRec = new p5.SpeechRec('en-US', parseResult); // new P5.SpeechRec object
    myRec.continuous = true; // do continuous recognition
    myRec.interimResults = true; // allow partial recognition (faster, less accurate)
    myRec.start(); // start engine

    //g = null;
    frameRate(5);
}


Leap.loop({enableGestures: true}, function(obj) {

    if (obj.id % 70 ==0){

    if (obj.gestures.length > 0) {
        obj.gestures.forEach(function (gesture) {
            output(gesture);
            console.log(gesture);
            g = gesture;
        });
    }
    console.log('OBJ ' + obj);
    var frame_data = [];

    right_hand_position = [-999, -999, -999];

    // ******** get right hand data ********

    hand = obj.hands[0];
    if (hand !== undefined ) {
        console.log(hand)
        // save right hand position to data
        // data.push(right_hand_position);

        // get finger data
        hand.pointables.forEach(pointable => {
            x = pointable.tipPosition[0];
            y = pointable.tipPosition[1];
            z = pointable.tipPosition[2];
            frame_data.push([x, y, z]);
        });
        frame_data = frame_data.flat();

        output2(frame_data);
        // hand = null;
    }
    }
});


function draw() {
    console.log(mode)
    background(bgd);
    diam = windowWidth / 6;
    rad = diam / 2;

    if (frameCount < 20){
        fill(Interface.main.TextColor);
        textSize(24);
        text('Loading…', windowWidth/2, windowHeight/2);
        // Erase Instructions
        //textSize(12);
        //text('This page is used until connection with sensor is established. Hit SPACEBAR to go to first page', windowWidth/2, windowHeight/8);

    }else if (frameCount === 20){
        mode = "main"
        moodNum = "0"
    }

    // if (g!=null){
    //     console.log(g); //plots the object
    //     console.log(g.direction); //plots the direction
    //     console.log(g.type);    //plots the typer of gesture
    // }

    //// MAIN
    if (mode === "main") {
        bgd = Interface.main.BackgroundColor;
        fill(Interface.main.TextColor);
        textSize(30);
        text('How are you feeling today?', windowWidth / 2, windowHeight / 5);


        // Mood text
        textSize(17);
        text('focused', windowWidth / 4, 4 * windowHeight / 5);
        text('cheerful', 2 * windowWidth / 4, 4 * windowHeight / 5);
        text('loving', 3 * windowWidth / 4, 4 * windowHeight / 5);

        textSize(12)
        text('Click on your preferred meditation mood', windowWidth / 2, 7 * windowHeight / 8);

        // Draw three ellipses
        ellipseMode(CENTER);
        noStroke();
        for (let i = 0; i < 3; ++i) {
            fill(Interface.meditation.BackgroundColor[i]);
            ellipse((i + 1) * windowWidth / 4, windowHeight / 2, diam, diam);
        }

        if (sound != false) {
            sound.pause();
        }

        ////Draw fingers
        //paint();

    ////// MEDITATION
    } else if (mode === "meditation") {
        /// Control volume with swipe up gesture
        if (g !== null){
            //console.log(g.type)
            if (g.type === "swipe"){
                console.log (swipeDirection)
                if (swipeDirection === 'up'){
                    //console.log("HERE !!!!!!!!!!!!")
                    if(val < 0.3){
                        let setVol = 0.1 + val;
                        sound.setVolume(setVol);
                        val += 0.001;
                        textSize(20);
                        fill(255);
                        text('Increasing volume', windowWidth / 2, windowHeight / 8);
                    }
                } else if (swipeDirection === 'down') {
                    if (val > 0.1) {
                        let setVol = 0.1 - val;
                        sound.setVolume(setVol);
                        val -= 0.001;
                        textSize(20);
                        fill(255);
                        text('Decreasing volume', windowWidth / 2, windowHeight / 8);
                    }
                }
            }
        }
        //Check mood selection to set mood/colors
        background(Interface.meditation.BackgroundColor[moodNum]);

        if (system.particles.length < 3) {
            system.particles.push(new Particle());
        } else {
            system.particles.shift();
            system.particles.shift();
        }
        system.run();
        //pg.images[gesture_type];
        tint(255, 120);
        //image(pg, 0, 0);
        fill(Interface.meditation.CircleColor[moodNum]);
        ellipseMode(CENTER);
        ellipse(windowWidth / 2, windowHeight / 2, diam, diam);

        //Erase Instructions
        fill(255);
        textSize(12);
        text('Return to previous page with SPACEBAR', windowWidth / 2, 7 * windowHeight / 8);

        sound_prev = sound;
        if (moodNum === 0) {
            sound = sound_focused;
        } else if (moodNum === 1) {
            sound = sound_cheerful;
        } else if (moodNum === 2) {
            sound = sound_loving;
        }

        if (sound_prev === false){
            sound.setVolume(0.02);
            sound.play();
        }

        if (sound_prev != false && sound_prev != sound) {
            sound_prev.pause();
            sound.setVolume(0.02);
            sound.play();
            val = 0.005;
        }

            console.log("KNN ANSWER", ans)
        if (ans !==null){
            imageMode(CENTER);
            if (ans[0] === 0){ image(one, windowWidth/2, windowHeight/2)}
            else if (ans[0] === 1){image(two, windowWidth/2, windowHeight/2)}
            else if (ans[0] === 2){image(three, windowWidth/2, windowHeight/2)}
            else if (ans[0] === 3){image(four, windowWidth/2, windowHeight/2)}
            else if (ans[0] === 4){image(five, windowWidth/2, windowHeight/2)}
            else {
                //Interface.meditation.CircleColor[moodNum]
                ellipse(windowWidth / 2, windowHeight / 2, diam, diam);
            }
        }

    ////END SCREEN
    } else if (mode === "end_screen") {
        fill(Interface.main.TextColor);
            textSize(30);
            text('Namaste', windowWidth/2, 2* windowHeight/3);
            textSize(20);
            text('Until next time...', windowWidth/2, windowHeight/3);
            imageMode(CENTER);
            image(namaste, windowWidth/2, windowHeight/2, windowHeight/3, windowHeight/4);
            sound.fade(0, 1)
    }

}

//Upon mouse click, it checks is it happens within mood-circles and sets the mood accordingly
function mouseReleased() {
    if (dist(windowWidth / 4, windowHeight / 2, mouseX, mouseY) < diam / 2) {
        //focused
        mode = "meditation";
        moodNum = 0;
    } else if (dist(2 * windowWidth / 4, windowHeight / 2, mouseX, mouseY) < diam / 2) {
        mode = "meditation";
        moodNum = 1;
    } else if (dist(3 * windowWidth / 4, windowHeight / 2, mouseX, mouseY) < diam / 2) {
        mode = "meditation";
        moodNum = 2;
    }
    mouse = false;
}

function keyPressed() {
    // Change btw modes/pages
    mouse = !mouse;
    if (mouse === true) {
        mode = "main";
    } else if (mouse === false) {
        mode = "meditation";
    }
    //console.log(mode);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    system = new ParticleSystem(createVector(windowWidth / 2, windowHeight / 2));
}


//Particle Effect Classes

let Particle = function () {
    this.position = createVector(system.center.x, system.center.y);
    this.pcolor = color(255, 255, 255, random(180));
    this.radius = random(width / 9, width / 5);
    this.a = 0;
};

Particle.prototype.run = function () {
    this.update();
    this.display();
};

Particle.prototype.update = function () {
    if (frameCount % 60 === 0) {
        this.a = Math.cos(2 * Math.PI * frameCount / 60);
    }
    this.radius += this.a;
    this.pcolor = color(255, 255, 255, random(50, 100));
};

Particle.prototype.display = function () {
    noStroke();
    //pg.fill(255, 220);
    fill(this.pcolor, random(180));
    ellipse(this.position.x, this.position.y, this.radius, this.radius);
};

let ParticleSystem = function (center) {
    this.center = center.copy();
    this.particles = [];
};


Particle.prototype.connect = function () {
    system.particles.forEach(particle => {
        let d = dist(this.position.x, this.position.y, particle.position.x, particle.position.y);
        if (d < windowWidth / 10) {
            fill(255, 20);
            strokeWeight(30);
            stroke(255, 10);
            line(this.position.x, this.position.y, particle.position.x, particle.position.y);
        }
    });

};


ParticleSystem.prototype.run = function () {
    for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];
        //p.connect();
        p.run();
    }
};


// Speech
function parseResult()
{
    // recognition system will often append words into phrases.
    // so here the last word is used:
    var mostrecentword = myRec.resultString.split(' ').pop();
    console.log(mostrecentword);

    if (mode === 'meditation'){
        var user_commands = ['namaste', 'nice', 'finish', 'end', 'I am done', 'back']; // end commands
        user_commands.forEach(word => {
            if(mostrecentword.indexOf(word)!==-1) {
                if (word.indexOf('back')===-1){
                    mode = "end_screen";
                }else{
                    mode = 'main';
                }

            }
        })

        if (mostrecentword.indexOf("hi")!==-1 || mostrecentword.indexOf("high")!==-1) {
            sound.setVolume(0.2)
            //console.log("HIGH")
        } else if (mostrecentword.indexOf("silence")!==-1) {
            sound.setVolume(0)
            //console.log("BANANA")
        } else if (mostrecentword.indexOf("medium")!==-1) {
            sound.setVolume(0.1)
        }




    }else if (mode === 'main'){
        //var user_mood = ['calm', 'focused', 'loving', 'I feel calm', 'I feel focused'];
        if(mostrecentword.indexOf('focused')!==-1 ||(mostrecentword.indexOf('I feel focused')!==-1)) {
            mode = "meditation";
            moodNum = 0;
            //mouse = false;
        }else if (mostrecentword.indexOf('cheerful')!==-1 ||(mostrecentword.indexOf('I am cheerful')!==-1)) {
            mode = "meditation";
            moodNum = 1;
            //mouse = false;
            console.log("CHEERFUL")
            console.log(mode)
        } else if (mostrecentword.indexOf('loving')!==-1) {
            mode = "meditation";
            moodNum = 2;
            //mouse = false;
        }
    }

    // var user_go_back = ['back', 'go back'];
    // user_go_back.forEach(word => {
    //     if(mostrecentword.indexOf(word)!==-1) {
    //        if (mode === 'main'){
    //            fill(255);
    //            text('Your heart is in the right place', windowWidth/2, 3 * windowHeight/5);
    //        } else {
    //            mode === 'main';
    //        }
    //     }
    // })

    // else if(mostrecentword.indexOf("down")!==-1) { dx=0;dy=1; }
    // else if(mostrecentword.indexOf("clear")!==-1) { background(255); }
}

//LEAP FUNCTioNS
//Trial
// function paint() {
//     let frame = controller.frame();
//     rgb = (255, 255, 255);
//     frame.fingers.forEach(finger => {
//         x = finger.dipPosition[0] + width / 2;
//         y = height - finger.dipPosition[1];
//         brush.push(new Brush(x, y, color(rgb), random(15)));
//     });
//
//     frame.fingers.forEach(finger => {
//         for (let i = 0; i < brush.length; i++) {
//             brush[i].render(createVector(finger.dipPosition[0] + width / 2, height - finger.dipPosition[1]));
//         }
//     });
//
//     frame.fingers.forEach(finger => {
//         for (let i = 0; i < brush.length; i++) {
//             brush[i].render(createVector(finger.dipPosition[0] + width / 2, height - finger.dipPosition[1]));
//         }
//     });
// }
//
// let Brush = function (x, y, col, size) {
//     this.pos = createVector();
//     this.col = col;
//     this.size = size;
// }

// Brush.prototype.display = function (pos) {
//     this.pos.set(pos.x, pos.y);
//     noStroke();
//     fill(this.col);
//     ellipse(this.pos.x, this.pos.y, this.size, this.size);
//
//     return this;
// }
//
// Brush.prototype.render = function (pos) {
//     return this.display(pos);
// }




//Leap
function output(gestureType){
    //console.log("in")
    g = gestureType;
    if (g.type == "swipe") {
        //Classify swipe as either horizontal or vertical
        var isHorizontal = Math.abs(g.direction[0]) > Math.abs(g.direction[1]);
        //Classify as right-left or up-down
        if(isHorizontal){
            if(g.direction[0] > 0){
                swipeDirection = "right";
            } else {
                swipeDirection = "left";
            }
        } else { //vertical
            if(g.direction[1] > 0){
                swipeDirection = "up";
            } else {
                swipeDirection = "down";
            }
        }
    }
}

function output2(flat_frame_data){

    let flat_frame_list = [];
    flat_frame = flat_frame_data;
    if (flat_frame !== null) {
        //console.log("THIS IS THE FRAME I NEED " + flat_frame)

        flat_frame_list.push(flat_frame);
        console.log(flat_frame_list)
        ans = knn.predict(flat_frame_list)
        // see predictions
        console.log(ans)
    }
    if (ans_prev != ans){
        count = 0;
    }
    else{
        count = 1
    }
    ans_prev = ans;
}





////////// CODE FROM https://github.com/mljs/knn
class KNN {
    /**
     * @param {Array} dataset
     * @param {Array} labels
     * @param {object} options
     * @param {number} [options.k=numberOfClasses + 1] - Number of neighbors to classify.
     * @param {function} [options.distance=euclideanDistance] - Distance function that takes two parameters.
     */
    constructor(dataset, labels, options = {}) {
        if (dataset === true) {
            const model = labels;
            this.kdTree = new KDTree(model.kdTree, options);
            this.k = model.k;
            this.classes = new Set(model.classes);
            this.isEuclidean = model.isEuclidean;
            return;
        }

        const classes = new Set(labels);

        const { distance = euclidean, k = classes.size + 1 } = options;

        const points = new Array(dataset.length);
        for (var i = 0; i < points.length; ++i) {
            points[i] = dataset[i].slice();
        }

        for (i = 0; i < labels.length; ++i) {
            points[i].push(labels[i]);
        }

        this.kdTree = new KDTree(points, distance);
        this.k = k;
        this.classes = classes;
        this.isEuclidean = distance === euclidean;
    }

    /**
     * Create a new KNN instance with the given model.
     * @param {object} model
     * @param {function} distance=euclideanDistance - distance function must be provided if the model wasn't trained with euclidean distance.
     * @return {KNN}
     */
    static load(model, distance = euclidean) {
        if (model.name !== 'KNN') {
            throw new Error(`invalid model: ${model.name}`);
        }
        if (!model.isEuclidean && distance === euclidean) {
            throw new Error(
                'a custom distance function was used to create the model. Please provide it again'
            );
        }
        if (model.isEuclidean && distance !== euclidean) {
            throw new Error(
                'the model was created with the default distance function. Do not load it with another one'
            );
        }
        return new KNN(true, model, distance);
    }

    /**
     * Return a JSON containing the kd-tree model.
     * @return {object} JSON KNN model.
     */
    toJSON() {
        return {
            name: 'KNN',
            kdTree: this.kdTree,
            k: this.k,
            classes: Array.from(this.classes),
            isEuclidean: this.isEuclidean
        };
    }

    /**
     * Predicts the output given the matrix to predict.
     * @param {Array} dataset
     * @return {Array} predictions
     */
    predict(dataset) {
        if (Array.isArray(dataset)) {
            if (typeof dataset[0] === 'number') {
                return getSinglePrediction(this, dataset);
            } else if (
                Array.isArray(dataset[0]) &&
                typeof dataset[0][0] === 'number'
            ) {
                const predictions = new Array(dataset.length);
                for (var i = 0; i < dataset.length; i++) {
                    predictions[i] = getSinglePrediction(this, dataset[i]);
                }
                return predictions;
            }
        }
        throw new TypeError('dataset to predict must be an array or a matrix');
    }
}

function getSinglePrediction(knn, currentCase) {
    var nearestPoints = knn.kdTree.nearest(currentCase, knn.k);
    var pointsPerClass = {};
    var predictedClass = -1;
    var maxPoints = -1;
    var lastElement = nearestPoints[0][0].length - 1;

    for (var element of knn.classes) {
        pointsPerClass[element] = 0;
    }

    for (var i = 0; i < nearestPoints.length; ++i) {
        var currentClass = nearestPoints[i][0][lastElement];
        var currentPoints = ++pointsPerClass[currentClass];
        if (currentPoints > maxPoints) {
            predictedClass = currentClass;
            maxPoints = currentPoints;
        }
    }

    return predictedClass;
}

/*
 * Original code from:
 *
 * k-d Tree JavaScript - V 1.01
 *
 * https://github.com/ubilabs/kd-tree-javascript
 *
 * @author Mircea Pricop <pricop@ubilabs.net>, 2012
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

function Node(obj, dimension, parent) {
    this.obj = obj;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.dimension = dimension;
}

class KDTree {
    constructor(points, metric) {
        // If points is not an array, assume we're loading a pre-built tree
        if (!Array.isArray(points)) {
            this.dimensions = points.dimensions;
            this.root = points;
            restoreParent(this.root);
        } else {
            this.dimensions = new Array(points[0].length);
            for (var i = 0; i < this.dimensions.length; i++) {
                this.dimensions[i] = i;
            }
            this.root = buildTree(points, 0, null, this.dimensions);
        }
        this.metric = metric;
    }

    // Convert to a JSON serializable structure; this just requires removing
    // the `parent` property
    toJSON() {
        const result = toJSONImpl(this.root, true);
        result.dimensions = this.dimensions;
        return result;
    }

    nearest(point, maxNodes, maxDistance) {
        const metric = this.metric;
        const dimensions = this.dimensions;
        var i;

        const bestNodes = new BinaryHeap(function (e) {
            return -e[1];
        });

        function nearestSearch(node) {
            const dimension = dimensions[node.dimension];
            const ownDistance = metric(point, node.obj);
            const linearPoint = {};
            var bestChild, linearDistance, otherChild, i;

            function saveNode(node, distance) {
                bestNodes.push([node, distance]);
                if (bestNodes.size() > maxNodes) {
                    bestNodes.pop();
                }
            }

            for (i = 0; i < dimensions.length; i += 1) {
                if (i === node.dimension) {
                    linearPoint[dimensions[i]] = point[dimensions[i]];
                } else {
                    linearPoint[dimensions[i]] = node.obj[dimensions[i]];
                }
            }

            linearDistance = metric(linearPoint, node.obj);

            if (node.right === null && node.left === null) {
                if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                    saveNode(node, ownDistance);
                }
                return;
            }

            if (node.right === null) {
                bestChild = node.left;
            } else if (node.left === null) {
                bestChild = node.right;
            } else {
                if (point[dimension] < node.obj[dimension]) {
                    bestChild = node.left;
                } else {
                    bestChild = node.right;
                }
            }

            nearestSearch(bestChild);

            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }

            if (
                bestNodes.size() < maxNodes ||
                Math.abs(linearDistance) < bestNodes.peek()[1]
            ) {
                if (bestChild === node.left) {
                    otherChild = node.right;
                } else {
                    otherChild = node.left;
                }
                if (otherChild !== null) {
                    nearestSearch(otherChild);
                }
            }
        }

        if (maxDistance) {
            for (i = 0; i < maxNodes; i += 1) {
                bestNodes.push([null, maxDistance]);
            }
        }

        if (this.root) {
            nearestSearch(this.root);
        }

        const result = [];
        for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
        }
        return result;
    }
}

function toJSONImpl(src) {
    const dest = new Node(src.obj, src.dimension, null);
    if (src.left) dest.left = toJSONImpl(src.left);
    if (src.right) dest.right = toJSONImpl(src.right);
    return dest;
}

function buildTree(points, depth, parent, dimensions) {
    const dim = depth % dimensions.length;

    if (points.length === 0) {
        return null;
    }
    if (points.length === 1) {
        return new Node(points[0], dim, parent);
    }

    points.sort((a, b) => a[dimensions[dim]] - b[dimensions[dim]]);

    const median = Math.floor(points.length / 2);
    const node = new Node(points[median], dim, parent);
    node.left = buildTree(points.slice(0, median), depth + 1, node, dimensions);
    node.right = buildTree(points.slice(median + 1), depth + 1, node, dimensions);

    return node;
}

function restoreParent(root) {
    if (root.left) {
        root.left.parent = root;
        restoreParent(root.left);
    }

    if (root.right) {
        root.right.parent = root;
        restoreParent(root.right);
    }
}

// Binary heap implementation from:
// http://eloquentjavascript.net/appendix2.html
class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    push(element) {
        // Add the new element to the end of the array.
        this.content.push(element);
        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    }

    pop() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    peek() {
        return this.content[0];
    }

    size() {
        return this.content.length;
    }

    bubbleUp(n) {
        // Fetch the element that has to be moved.
        var element = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.floor((n + 1) / 2) - 1;
            const parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            } else {
                // Found a parent that is less, no need to move it further.
                break;
            }
        }
    }

    sinkDown(n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) * 2;
            var child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                var child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else {
                // Otherwise, we are done.
                break;
            }
        }
    }
}

function squaredEuclidean(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
        d += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return d;
}

function euclidean(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}
