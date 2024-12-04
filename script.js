const canvas = document.getElementById("game-canvas");
const restartButton = document.getElementById("restart");
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const ctx = canvas.getContext("2d");
var audio = new Audio('Music.mp3');
audio.play();

canvas.width = 800;
canvas.height = 600;

// Cargar la imagen del jugador
const playerImage = new Image();
playerImage.src = "images/nave.png"; 

// Cargar la imagen del fondo
const backgroundImage = new Image();
backgroundImage.src = "images/background.jpg"; 

let isGameRunning = false;

//Objeto del jugador
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 30,
  height: 30,
  speed: 30,
  bullets: [],
  lives: 3,
  cooldown:1,
};

//Arreglo de objetos para los 3 tipos de enemigos
const enemies = [{
  id:1,
  width: 30,
  height: 30,
  speed: 20,
  bullets: []
},{
  id:2,
  width: 20,
  height: 20,
  speed: 20,
  bullets: []
},{
  id:3,
  width: 50,
  height: 30,
  speed: 20,
  bullets: []
}]

//Declaración de variables necesarias
let isGameOver = false;
let currentLevel = 1; 
const maxLevels = 10;
let lastShotTime = 0;
let enemyShootCooldown = 0
let enemyMoveTime=0;
let score = 0;

//Lectura de los inputs del jugador
document.addEventListener("keydown", (e) => {
  //Movimiento hacia la izquierda con la flecha izquierda
  if (e.key === "ArrowLeft" && player.x > 0 || e.key === "a" && player.x > 0) player.x -= player.speed;
  //Movimiento hacia la derecha con la flecha derecha
  if (e.key === "ArrowRight" && player.x + player.width < canvas.width || e.key === "d" && player.x + player.width < canvas.width)
    player.x += player.speed;
  //Se manda a llamar el disparo con el espacio
  if (e.key === " ") {
    playerShoot(); 
  }
});


startButton.addEventListener("click", function () {
  startScreen.style.display = "none"; 
  startScreen.style.visibility = "hidden";
  canvas.style.display = "block"; 
  canvas.style.visibility = "visible";
  
  isGameRunning = true;
  createEnemies(currentLevel); 
  gameLoop();  
});


//Un menu para mostrar información del nivel, vidas y puntaje
function Menu() {
  ctx.fillStyle = "white";
  ctx.font = "20px minecraft";
  ctx.clearRect(0, 0, canvas.width, 40); 
  ctx.fillText(`Nivel: ${currentLevel}`, 10, 30);
  ctx.fillText(`Vidas: ${player.lives}`, canvas.width / 2 - 50, 30);
  ctx.fillText(`Puntos: ${score}`, canvas.width - 150, 30);
}

//Funcion para el disparo enemigo
function enemyShoot() {
  enemiesDisplay.forEach((enemy) => {
    //Utilizar una variable para manejar el tiempo y poder tener un cooldown de disparo
    const currentTime = Date.now();

    if (!enemy.lastShootTime || currentTime - enemy.lastShootTime > 1000) {
      enemy.lastShootTime = currentTime;

      const bulletX = enemy.x + enemy.width / 2 - 5; 
      const bulletY = enemy.y + enemy.height;        

      // Creamos la bala del enemigo y la metemos al arreglo
      enemy.bullets.push({
        x: bulletX,
        y: bulletY,
        width: 5,
        height: 10,
        speed: 2
      });
    }
  });

}

//Funcion para el disparo del jugador
function playerShoot() {
  //Utilizar una variable para manejar el tiempo y poder tener un cooldown de disparo
  const currentTime = Date.now();
  //Creamos el objeto de la bala
  const bullet = {
    x: player.x + player.width / 2 - 5,
    y: player.y,
    width: 10,
    height: 20,
    speed: 7
  };
  //Si se cumple el cooldown meter la bala al arreglo
  if (currentTime - lastShotTime >= player.cooldown * 100) {
    player.bullets.push(bullet);
    lastShotTime = currentTime;
  }
}

//Función para saber cuando las balas golpean la hitbox del jugador o de los enemigos
function hitbox() {
  //Checa cada bala del jugador y cada enemigo
  player.bullets.forEach((bullet, bulletIndex) => {
    enemiesDisplay.forEach((enemy, enemyIndex) => {
      if (
        //Checar si la bala entra en contacto por cualquier lado
        bullet.x < enemy.x + enemy.width && 
        bullet.x + bullet.width > enemy.x && 
        bullet.y < enemy.y + enemy.height && 
        bullet.y + bullet.height > enemy.y 
      ) {
        //Eliminar la bala y el enemigo en caso de que si, tambien suma puntos
        enemiesDisplay.splice(enemyIndex, 1);
        player.bullets.splice(bulletIndex, 1);
        increaseScore(enemy.id);
      }
    });
  });
  //Igual pero para las balas del enemigo y la hitbox del jugador
  enemiesDisplay.forEach(enemy => {
    enemy.bullets.forEach((bullet, bulletIndex) => {
      if (
        bullet.x + bullet.width > player.x &&
        bullet.x < player.x + player.width &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y
      ) {
        // Si hay colisión, perder una vida. Si no tienes vidas pierdes el juego
        player.lives--;
        if(player.lives==0){
          isGameOver=true;
        }
        enemy.bullets.splice(bulletIndex, 1);
      }
    });
  });
}

//Suma de puntos al eliminar enemigos dependiendo del tipo
function increaseScore(id) {
  switch (id) {
    case 1:
      score += 25; 
      break;
    case 2:
      score += 50; 
      break;
    case 3:
      score += 80;
      break;
  }
}

//Funcion para dibujar las balas del jugador y de los enemigos
function drawBullets() {
  ctx.fillStyle = "yellow";
  player.bullets.forEach((bullet, index) => {
    //mover la bala dependiendo de la variable de velocidad
    bullet.y -= bullet.speed;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    //eliminar la bala si se sale el canvas
    if (bullet.y < 0) player.bullets.splice(index, 1);
  });
  ctx.fillStyle = "red"; 
  enemiesDisplay.forEach(enemy => {
    enemy.bullets.forEach((bullet, index) => {
      bullet.y += bullet.speed; 
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

      if (bullet.y > canvas.height) {
        enemy.bullets.splice(index, 1);
      }
    });
  });
}

//Funcion para dibujar la nave del jugador
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

}

//Funcion para crear los enemigos con un switch para cada nivel, genera un arreglo de displays de enemigos
function createEnemies(level) {
  enemiesDisplay = [];
  switch(level){
    case 1:
      for (let i = 0; i < 5; i++) {
        enemiesDisplay.push({
          ...enemies[0],
          x: i * (enemies[0].width + 20) + 250,
          y: 50,
          lastShootTime: 0, 
          bullets: []
        });
      }
    break;
    case 2:
      for (let i = 0; i < 5; i++) {
        enemiesDisplay.push({
          ...enemies[0], // Tipo 1
          x: i * (enemies[0].width + 20) + 250,
          y: 50,
          lastShootTime: 0, 
          bullets: []
        });
        enemiesDisplay.push({
          ...enemies[1], // Tipo 2
          x: i * (enemies[1].width + 20) + 250,
          y: 100,
          lastShootTime: 0, 
          bullets: []
        });
      }
    break;
    case 3:
      for (let i = 0; i < 6; i++) {
        enemiesDisplay.push({
          ...enemies[0], // Tipo 1
          x: i * (enemies[0].width + 20) + 230,
          y: 50,
          lastShootTime: 0, 
          bullets: []
        });
        enemiesDisplay.push({
          ...enemies[1], // Tipo 2
          x: i * (enemies[1].width + 20) + 230,
          y: 100,
          lastShootTime: 0, 
          bullets: []
        });
        enemiesDisplay.push({
          ...enemies[2], // Tipo 3
          x: i * (enemies[2].width + 20) + 230,
          y: 150,
          lastShootTime: 0, 
          bullets: []
        });
      }
    break;
    case 4:
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4 - row; col++) {
          enemiesDisplay.push({
            ...enemies[row % 3], // Alterna tipos
            x: col * (enemies[row % 3].width + 20) + 100 + row * 20,
            y: row * (enemies[row % 3].height + 20) + 50,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    case 5:
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4 - row; col++) {
          enemiesDisplay.push({
            ...enemies[row % 3], // Alterna tipos
            x: col * (enemies[row % 3].width + 20) + 100 + row * 20,
            y: row * (enemies[row % 3].height + 20) + 50,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    case 6:
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4 - row; col++) {
          enemiesDisplay.push({
            ...enemies[row % 3], // Alterna tipos
            x: col * (enemies[row % 3].width + 20) + 100 + row * 20,
            y: row * (enemies[row % 3].height + 20) + 50,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    case 7:
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4 - row; col++) {
          enemiesDisplay.push({
            ...enemies[row % 3], // Alterna tipos
            x: col * (enemies[row % 3].width + 20) + 100 + row * 20,
            y: row * (enemies[row % 3].height + 20) + 50,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    case 8:
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 3; j++) {
          enemiesDisplay.push({
            ...enemies[j % 3], // Alterna tipos
            x: i * (enemies[j % 3].width + 15) + 30,
            y: j * (enemies[j % 3].height + 15) + 50,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    case 9:
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 4;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 50 + i * 10;
        enemiesDisplay.push({
          ...enemies[i % 3], // Alterna tipos
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          lastShootTime: 0, 
          bullets: []
        });
      }
    break;
    case 10:
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 5; j++) {
          enemiesDisplay.push({
            ...enemies[(i + j) % 3], // Alterna tipos
            x: i * (enemies[(i + j) % 3].width + 10) + 30,
            y: j * (enemies[(i + j) % 3].height + 10) + 30,
            lastShootTime: 0, 
            bullets: []
          });
        }
      }
    break;
    default:
      break;
      
  }
}
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height); 
}

function drawEnemies() {
  //Dibuja a los enemigos dependiendo de su id con diferentes formas
  enemiesDisplay.forEach((enemy) => {
    switch (enemy.id) {
      case 1:
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x, enemy.y, 6, 7);
        ctx.fillRect(enemy.x+14, enemy.y, 6, 7);
        ctx.fillRect(enemy.x, enemy.y+14, 6, 7);
        ctx.fillRect(enemy.x+14, enemy.y+14, 6, 7);
        ctx.fillStyle = "green";
        ctx.fillRect(enemy.x+4, enemy.y+4, 12, 12);
        ctx.closePath();
        ctx.fill();
        break;
      case 2:
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(enemy.x+2, enemy.y+20, 6, 12);
        ctx.fillRect(enemy.x+12, enemy.y+20, 6, 12);
        ctx.fillStyle = "green";
        ctx.arc(enemy.x + 10, enemy.y + 10, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        break;
      case 3:
        ctx.beginPath();
        ctx.fillStyle = "purple";
        ctx.fillRect(enemy.x+18, enemy.y+20, 14 , 26);
        ctx.fillStyle = "red";
        ctx.moveTo(enemy.x + 10, enemy.y);
        ctx.lineTo(enemy.x + enemy.width - 10, enemy.y); 
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height); 
        ctx.lineTo(enemy.x, enemy.y + enemy.height); 
        ctx.fill();
        ctx.closePath();
        break;
      default:
        break;
    }
  });
}

function moveEnemies() {
  //También utilizamos un cooldown para el movimiento de los enemigos
  const currentTime = Date.now();
  if (currentTime - enemyMoveTime < 250) return; 
  enemyMoveTime = currentTime;
  enemiesDisplay.forEach((enemy, index) => {
    //Escoge de manera random el movimiento hacia la derecha o izquierda de los enemigos
    const nextX = enemy.x + (Math.random() > 0.5 ? enemy.speed : -enemy.speed);
    //Checa que no se salga del canvas
    if (nextX < 0 || nextX + enemy.width > canvas.width) return;
    //Comprueba si almenos un elemento del arreglo cumple con la condición de abajo
    const collision = enemiesDisplay.some((otherEnemy, otherIndex) => {
      if (index === otherIndex) return false;
      //Checa que no este en la misma posicion en el eje X y Y con otro enemigo (que no hayan chocado)
      const isSameX = nextX < otherEnemy.x + otherEnemy.width && nextX + enemy.width > otherEnemy.x;
      const isSameY = enemy.y === otherEnemy.y;
      return isSameX && isSameY;
    });
    //Si no chocaron se mueven
    if (!collision) {
      enemy.x = nextX;
    }
  });
}

function restartGame(){
  window.location.reload();
}

//Función que permite que el juego se actualice constantemente, aqui se llaman todas las funciones de arriba
function gameLoop() {
  if (!isGameRunning) return; // Salir si el juego no está corriendo

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
  drawBackground(); // Dibujar el fondo
  drawPlayer(); // Dibujar el jugador
  drawEnemies(); // Dibujar los enemigos
  drawBullets(); // Dibujar las balas
  Menu(); // Mostrar información del nivel

  moveEnemies(); // Mover enemigos
  enemyShoot(); // Disparo enemigo
  hitbox(); // Detectar colisiones
  //En caso de perder mostrar el boton de restart
  if (!isGameOver) {
    requestAnimationFrame(gameLoop); // Continuar el ciclo
  } else {
    handleGameOver(); // Llamar a la función de fin de juego
  }
  //Si ya venciste todos los enemigos pasar de nivel y mostrar el mensaje de victoria en caso de pasar todos los niveles
  if (enemiesDisplay.length == 0) {
    currentLevel += 1;
    score+=500;
    if (currentLevel > maxLevels) {
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      ctx.fillText("Ganaste!", canvas.width / 2 - 100, canvas.height / 2);
      restartButton.style.display = "block";
      restartButton.style.visibility = "visible";
      return;
    }
    createEnemies(currentLevel);
  }
}

// Función de fin de juego
function handleGameOver() {
  isGameRunning = false;
  alert("¡Juego terminado!"); // Mensaje de fin de juego
  restartGame(); // Reiniciar el juego (puedes implementar esta función)
}

createEnemies(currentLevel);
gameLoop();
