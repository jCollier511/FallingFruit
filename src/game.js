
let canvas, div, ctx, video, poseNet;
let poses = [];
let lastTime = 0;
let dt = 0;
let bgTime = 0;
let sunshineHeights = [];
let basket = {'x':0,'y':0,'width':150,'height':70};
let fruitTime = 0;
let fruitList = [];
let score = 0;
let gamestate = "start";
let gametime;
let images = [];
let imagesToLoad = ['./images/strawberry.png','./images/basket-texture.jpeg']
let gameData;

const loadJsonFetch = (url,callback) => {
    fetch(url)
        .then(response => {
            // If the response is successful, return the JSON
            if (response.ok) {
                return response.json();
            }

            // else throw an error that will be caught below
            return response.text().then(text =>{
                throw text;
            });
        }) // send the response.json() promise to the next .then()
        .then(json => { // the second promise is resolved, and `json` is a JSON object
            gameData = json;
            gametime = gameData.presets.gameLength;
            callback();
        }).catch(error => {
            // error
            console.log(error);
    });
};

function preloadImage(){
// 1 - create a new Image object
    let numImg = 0;
    for(let url in imagesToLoad){
        let img = new Image();
    
        // 2 - set up event handlers for the Image object
        img.onload = () => {
            // 4 - when the image shows up, call `init(img)`
            'imgLoaded'
            numImg++;
            images.push(img)
            if(numImg==imagesToLoad.length){
                init();
            }
        };
    
        img.onerror = _=>{
        // 4B - called if there is an error
            console.log(`Image at url "${url}" wouldn't load! Check your URL!`);
        };
    
        // 3 - start downloading the image (it is located on an RIT server)
        img.src = imagesToLoad[url];
    }
    
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    if(gamestate == "start" || gamestate == "end"){
        if(x>220 && x<520 && y>420 && y<520){
            score = 0;
            gamestate = "game";
        }
    }
}
let canvasElem = document.querySelector("canvas");
    
canvasElem.addEventListener("mousedown", function(e)
{
    getMousePosition(canvasElem, e);
});


class Fruit{
    constructor(x,y,r,fwd,speed=200,fruit){
        Object.assign(this,{x,y,r,fwd,speed,fruit});
    }

    move(dt){
        this.y += this.fwd.y * this.speed * dt;
    }
    
    
    colissionCheck(){
        if(this.x<basket.x+basket.width && this.x+this.r>basket.x && this.y<basket.y+basket.height && this.y+this.r>basket.y){
            return true;
        }
        return false;
    }
    
    draw(ctx){
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.drawImage(this.fruit,this.x-this.r,this.y-this.r,this.r*2,this.r*2)
        ctx.restore();
    }
    
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// I. CALLBACKS
// When the model is loaded
const modelLoaded = () => {
    console.log("Model Loaded!");
    div.innerHTML = "PoseNet model loaded!";
};


// II. SETUP
const setupUI = () => {
    div = document.querySelector("#msg");
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
};
const setupVideo = () => {
    // Create a webcam capture
    video = document.querySelector("video");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.srcObject = stream;
            video.play();
        
            /* double check your webcam width / height */
            const stream_settings = stream.getVideoTracks()[0].getSettings();
            console.log('Width: ' + stream_settings.width);
            console.log('Height: ' + stream_settings.height);
        });
    }
};

const setupPosenet = () => {
    // Create a new poseNet instance
    poseNet = ml5.poseNet(video, modelLoaded);
    // Listen to new 'pose' events
    poseNet.on('pose', results => {
        poses = results;
    });
};

// III. UTILS
// Note that we are drawing eveything from the "center"
// which is a good idea becaue the canvas is flipped on its x-axis
// meaning that (0,0) is in the upper-right corner
const drawScore = (ctx) => {
    ctx.save();
    ctx.scale(-1,1);
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.fillText("Score: " +score,-300,50);
    ctx.font = "bold 40px Arial";
    ctx.fillText("Time Remaining: " + Math.round(100*gametime)/100,-800,50);
    ctx.restore();
}

const fillRect = (ctx,x,y,width,height,fillStyle="white") => {
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle=fillStyle;
    ctx.fillRect(-width/2,-height/2,width,height);
    ctx.restore();
};

const strokeRect = (ctx,x,y,width,height,strokeStyle="white",lineWidth=5) =>{
    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle=strokeStyle;
    ctx.lineWidth=lineWidth;
    ctx.strokeRect(-width/2,-height/2,width,height);
    ctx.restore();
}

const fillCircle = (ctx,x,y,radius,fillStyle="white",startAngle=0,endAngle=Math.PI*2,counterClockwise=false) =>{
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle=fillStyle;
    ctx.beginPath();
    ctx.arc(0,0,radius,startAngle,endAngle,counterClockwise);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

const strokeCircle = (ctx,x,y,radius,strokeStyle="white",lineWidth=5,startAngle=0,endAngle=Math.PI*2,counterClockwise=false) =>{
    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle=strokeStyle;
    ctx.lineWidth=lineWidth;
    ctx.beginPath();
    ctx.arc(0,0,radius,startAngle,endAngle,counterClockwise);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}


const DrawBackground = (dt) => {
    bgTime+=dt;
    ctx.save();

    let grad2 = ctx.createLinearGradient(0,0,0,600);
    grad2.addColorStop(0, 'blue');
    grad2.addColorStop(5 / 6, 'lightblue');
    grad2.addColorStop(1, 'white');
    ctx.fillStyle = grad2;
    ctx.fillRect(0,0,800,600);
    let x = 0;
    if(sunshineHeights.length==0 || bgTime>0.75){
        sunshineHeights = [];
        while(x<10){
            sunshineHeights.push(Math.floor(Math.random() * 30) + 10);
            x++;
        }
        bgTime = 0;
    }
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(150, 150, 50, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

    ctx.translate(150,150);

    x = 0;
    while(x<10){
        //Math.floor(Math.random() * 50)
        ctx.fillRect(0,70,4,sunshineHeights[x]);
        ctx.rotate(Math.PI*2/10);
        x++;
    }
    ctx.restore();
}


const fruitManager = (dt) => {
    fruitTime+=dt;
    if(fruitTime>gameData.presets.fruitOccorance){
        fruitList.push(new Fruit(Math.floor(Math.random() * 780) + 10,0,Math.floor(Math.random()*25 + 10),{x:1,y:1},Math.floor(Math.random()*gameData.presets.maxFruitSpeed+gameData.presets.minFruitSpeed),images[0]));
        fruitTime = 0;
    }
    for(let i = 0; i<fruitList.length; i++){
        fruitList[i].move(dt);
        fruitList[i].draw(ctx);
        if(fruitList[i].colissionCheck()){
            fruitList.splice(i,1);
            score++;
        }
    }
}

const drawStuff = () => {
    for (let item of poses){
        const leftEye = item.pose.leftEye;
        const rightEye = item.pose.rightEye;
        const nose = item.pose.nose;
        const rightEar = item.pose.rightEar;
        const leftEar = item.pose.leftEar;

        let distance = Math.sqrt((Math.pow(rightEar.x-leftEar.x,2) + Math.pow(rightEar.y-leftEar.y,2)))/2;

        let basketPat = ctx.createPattern(images[1],"repeat");
        
        if(nose){
            let headConstraint = clamp(nose.y,400,600);
            fillCircle(ctx,nose.x,headConstraint-20,distance,"blue");
            strokeCircle(ctx,nose.x,headConstraint-20,distance,"black",4);
            fillCircle(ctx,nose.x,headConstraint,20,"red");
            basket.x = nose.x-basket.width/2;
            basket.y = headConstraint-distance-20-basket.height/2;
            fillRect(ctx,nose.x,headConstraint-distance-20,150,70,basketPat);
        }

        if(leftEye){
            let lEyeConstraint = clamp(leftEye.y,370,600);
            fillCircle(ctx,leftEye.x,lEyeConstraint,15,"white");
            strokeCircle(ctx,leftEye.x,lEyeConstraint,15,"black",1);
            fillCircle(ctx,leftEye.x,lEyeConstraint,4,"black");
        }

        if(rightEye){
            let rEyeConstraint = clamp(rightEye.y,370,600);
            fillCircle(ctx,rightEye.x,rEyeConstraint,15,"white");
            strokeCircle(ctx,rightEye.x,rEyeConstraint,15,"black",1);
            fillCircle(ctx,rightEye.x,rEyeConstraint,4,"black");
        }
    }
};

const DrawGameLoop = (strawberry, dt) => {
    drawStuff();
    fruitManager(strawberry,dt);
    drawScore(ctx);
} 

const DrawStart = () => {
    ctx.save();
    ctx.scale(-1,1);
    ctx.fillStyle = "white";
    ctx.font = "bold 100px Arial";
    ctx.fillText("Fruit Catcher",-725,350);
    fillRect(ctx,-430,470,300,100,"red");
    ctx.fillText("Start",-550,500);
    ctx.restore();
}

const DrawEnd = () => {
    ctx.save();
    ctx.scale(-1,1);
    ctx.fillStyle = "white";
    ctx.font = "bold 100px Arial";
    ctx.fillText("Final Score: " + score,-725,350);
    fillRect(ctx,-430,480,300,100,"red")
    ctx.font = "bold 50px Arial";
    ctx.fillText("Try Again",-550,500);
    ctx.restore();
}

const loop = (time =0) => {
    requestAnimationFrame(loop);
    dt = (time - lastTime)/1000;
    dt = clamp(dt,1/144,1/12);
    lastTime = time;
    DrawBackground(dt);
    if(gametime<0){
        gamestate= "end";
        gametime = gameData.presets.gameLength;
        fruitList = [];
    }

    if(gamestate == "start"){
        DrawStart();
    }
    else if(gamestate == "game"){
        DrawGameLoop(dt);
        gametime-=dt;
    }
    else if(gamestate == "end"){
        DrawEnd();
    }
};

function init(){
    setupUI();
    setupVideo();
    setupPosenet();
    loop();
};

loadJsonFetch("./src/gamedata.json",preloadImage);