 let board = document.getElementById("board");
 const rowCount=21;
 const colCount=19;
 const tile=32;
 let boardWid=colCount*tile;
 let boardLen=rowCount*tile;
 let context;

 let blueGhost;
 let redGhost;
 let orangeGhost;
 let pinkGhost;
 let scaredGhost;
 let pacUp;
 let pacDown;
 let pacLeft;
 let pacRight;
 let wallImg;

// creating tilemap
//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls = new Set();//does not allow duplicates
const foods = new Set();
const Ghosts = new Set();
let pacman;
const directions=['U','D','L','R'];
let score = 0;
let lives = 3;
let gamOver = false;


//creating  game board 
 window.onload = function() {
    board.height = boardLen;
    board.width = boardWid;
    context= board.getContext("2d");
    loadImg();
    loadMap();
    for (let Ghost of Ghosts.values()){
      const newDirection=directions[Math.floor(Math.random()*4)];
      Ghost.updateDirection(newDirection);
    }
    update();
    document.addEventListener("keyup" , movePacman);
     
 }

 //load images on board
 function loadImg(){
    wallImg=new Image();
    wallImg.src="imgs/wall.png";
    blueGhost=new Image();
    blueGhost.src="imgs/blueGhost.png";
    redGhost=new Image();
    redGhost.src="imgs/redGhost.png";
    orangeGhost=new Image();
    orangeGhost.src="imgs/orangeGhost.png";
    pinkGhost=new Image();
    pinkGhost.src="imgs/pinkGhost.png"
    scaredGhost=new Image();
    scaredGhost.src="imgs/scaredGhost.png";

    pacDown=new Image();
    pacDown.src="imgs/pacmanDown.png";
    pacUp=new Image();
    pacUp.src="imgs/pacmanUp.png";
    pacLeft=new Image();
    pacLeft.src="imgs/pacmanLeft.png";
    pacRight=new Image();
    pacRight.src="imgs/pacmanRight.png";


 } 
 function loadMap(){
   //to reset
   walls.clear();
   foods.clear();
   Ghosts.clear();

   for(let r=0;r<rowCount;r++){
      for(let c=0;c<colCount;c++){
         const row = tileMap[r];
         const tileChar = row[c];

         const x = c*tile;
         const y = r*tile;

      if(tileChar === 'X' ){
         const wall = new block(wallImg , x,y,tile,tile);
         walls.add(wall);

      }
      else if(tileChar ==='b'){
         const Ghost = new block(blueGhost, x,y,tile ,tile);
         Ghosts.add(Ghost);

      }
      else if(tileChar ==='p'){
         const Ghost = new block(pinkGhost, x,y,tile ,tile);
         Ghosts.add(Ghost);
         
      }
      else if(tileChar ==='o'){
         const Ghost = new block(orangeGhost, x,y,tile ,tile);
         Ghosts.add(Ghost);
         
      }
      else if(tileChar ==='r'){
         const Ghost = new block(redGhost, x,y,tile ,tile);
         Ghosts.add(Ghost);
         
      }
      else if(tileChar === ' '){
         //why 13?
         //as 32by32 is size of 1 tile inside this tile we need our food 
         //by removing 6 from 32 =26 dividing 26 by 2 as we want eqaul from both sides
         //so add 13
         const food = new block(null,x+13,y+13, 6 ,6);//as the food will be of small size tahn others
         foods.add(food);
         
      }
      else if(tileChar ==='P'){
          pacman = new block(pacRight, x,y,tile ,tile);
        
      }
      
      }
   }
 }
 function update() {
   if(gamOver){
      return;
   }
   move();
   draw();
   //why timeout ans not time interval?
   //as timeout reduces the chance of overlapping 
   setTimeout(update,50);//20FPS 1-> 1000ms/20=50
 }


 function draw(){
context.clearRect(0,0,board.width,board.height);

   context.drawImage(pacman.image,pacman.x,pacman.y,pacman.width,pacman.height );

   for (let Ghost of Ghosts.values()){
      context.drawImage(Ghost.image,Ghost.x,Ghost.y,Ghost.width,Ghost.height)
   }
   for(let wall of walls.values()){
      context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height)
   }
   context.fillStyle ="white";
   for(let food of foods.values()){
      context.fillRect(food.x,food.y,food.width,food.height)
   }

   //score card
   context.fillStyle = "white";
   context.font="20px sans-serif";
   if(gamOver){
      context.fillText("Game Over :" + String(score) , tile/2,tile/2);
   }
   else{
      context.fillText("❤️"+String(lives) +"   " + String(score),tile/2,tile/2 )
   }


 }
 function move() {
   pacman.x += pacman.velocityX;
   pacman.y += pacman.velocityY;

   //wall collision 
   for(let wall of walls.values()){
      if(collision(pacman,wall)){
         pacman.x -= pacman.velocityX;
         pacman.y -= pacman.velocityY;
         break;
      }
   }
   for(let Ghost of Ghosts.values()){
      // gost and pacman collision
        if(collision(Ghost,pacman)){
         lives -= 1;
         if(lives === 0){
            gamOver=true;
            return;
         }
         resetPositions();

        }

      //ghost and wall collision
      if(Ghost.y == tile*9 && Ghost.direction != 'U' && Ghost.direction != 'D'){
          Ghost.updateDirection('U');
          const newDirection = directions[Math.floor(Math.random()*4)];
            Ghost.updateDirection(newDirection)
      }
      Ghost.x += Ghost.velocityX;
      Ghost.y += Ghost.velocityY;

      for(let wall of walls.values()){
         if(collision(Ghost,wall) || Ghost.x <=0 || Ghost.x + Ghost.width >= boardWid ){
            Ghost.x -= Ghost.velocityX;
            Ghost.y -= Ghost.velocityY;
            const newDirection = directions[Math.floor(Math.random()*4)];
            Ghost.updateDirection(newDirection);
         }
      }
   }

   //food collision means pacman eating food
   let foodEaten = null;
   for(let food of foods.values()){
      if(collision(pacman,food)){
         foodEaten = food;
         score +=10;
         break;

      }
   }
   foods.delete(foodEaten);

   //next level
   if(foods.size === 0){
      loadMap();
      resetPositions();
   }
 }

 function movePacman(e){
   if(gamOver){
      loadMap();
      resetPositions();
      lives=3;
      score=0;
      gamOver=false;
      update();
      return;
   }
   if(e.code == "ArrowUp" || e.code == "KeyW"){
      pacman.updateDirection('U')
   }
   else if(e.code == "ArrowDown" || e.code == "KeyS"){
      pacman.updateDirection('D')
   }
   else if(e.code == "ArrowLeft" || e.code == "KeyA"){
      pacman.updateDirection('L')
   }
   else if(e.code == "ArrowRight" || e.code == "KeyD"){
      pacman.updateDirection('R')
   }
   //updating pac img
   if(pacman.direction === 'U'){
      pacman.image = pacUp;
   }
   else if(pacman.direction === 'D'){
      pacman.image = pacDown;
   }
   else if(pacman.direction === 'L'){
      pacman.image = pacLeft;
   }
   else if(pacman.direction === 'R'){
      pacman.image = pacRight;
   }
 }

 //collision b/w 2 rectangeles that is either pac and ghost pr pac and wall
 //checks for overlapping 
 function collision(a,b){
      return a.x < b.x + b.width &&
             a.x + a.width > b.x &&
             a.y < b.y +b.height &&
             a.y + a.height > b.y;
 }

 function resetPositions(){
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;
    for(let Ghost of Ghosts.values()){
      Ghost.reset();
      const newDirection = directions[Math.floor(Math.random()*4)];
      Ghost.updateDirection(newDirection);
    }
 }

 class block{
   constructor(image,x,y,width,height){
      this.image = image;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
//starting position of pac and ghost
      this.startX=x;
      this.startY=y;

      //direction property
      this.direction = 'R';
      this.velocityX = 0;
      this.velocityY = 0;
   }
   updateDirection(direction) {
      const prevDirec = this.direction;
      this.direction = direction ;
      this.updateVelocity();
   }
   updateVelocity(){
      if(this.direction === 'U'){
         this.velocityX =0;
         this.velocityY= -tile/4;
      }
       else if(this.direction === 'D'){
         this.velocityX =0;
         this.velocityY= tile/4;
      }
       else if(this.direction === 'L'){
         this.velocityX= -tile/4;
         this.velocityY=0;  
      }
       else if(this.direction === 'R'){
         this.velocityX= tile/4;
         this.velocityY=0;  
      }
   }
   reset(){
      this.x=this.startX;
      this.y=this.startY;
   }
 }
