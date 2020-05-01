let cvs = document.querySelector("#canvas");
let ctx = cvs.getContext("2d");

let frames = 0;
let gravity = 0.2;
const sprite = new Image();
sprite.src = "img/night-sprite.png";
const gameState =
{
	current: 0,
	getReady: 0,
	game: 1,
	gameOver: 2
}
cvs.addEventListener("click", function(event)
{
	switch (gameState.current) {
		case gameState.getReady:
			gameState.current = gameState.game
			break;
		case gameState.game:
			bird.flap();
			break;
		case gameState.gameOver:
			gameState.current = gameState.getReady
			pipes.reset();
			score.reset();
			break;
	}
});
const bg = 
{
	sx: 0,
	sy : 0,
	x: 0,
	y: cvs.height - 226,
	width: 275,
	height: 226,
	draw : function()
	{
		ctx.drawImage(sprite, this.sx, this.sy, this.width, this.height, 
			this.x, this.y, this.width, this.height);
		ctx.drawImage(sprite, this.sx, this.sy, this.width, this.height, 
			this.x + this.width, this.y, this.width, this.height);
	}
}
const ground = 
{
	height: 112,
	width: 5 * cvs.width,
	y: cvs.height - 112,
	x: 0,
	draw : function()
	{
		ctx.fillStyle = "#263238";
		ctx.fillRect(this.x, this.y, this.width, this.height);

		ctx.fillStyle = "#BABABA";
		ctx.fillRect(this.x, this.y, this.width, 15);

		for (let i = 0; i < 8; i++) {
			ctx.fillStyle = "#fafafa";
			ctx.fillRect(this.x + 5 + 200 * i, this.y + this.height / 2, 40, 15);
		}
	},
	update: function()
	{
		if (gameState.current == gameState.game)
			this.x = (this.x - 3) % (this.width / 2)
	}
}
const stars =
{
	height: 112,
	width: cvs.width,
	a_param: 0.6,
	da: 0.01,
	draw : function()
	{
		ctx.beginPath();
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.arc(123, 93, 2, 0, 2 * Math.PI, true); // x, y, R, ang, ang, по часов\против
		ctx.fill();

		ctx.beginPath();
		ctx.fillStyle = "rgba(255, 255, 255,"+ String(this.a_param) + ")";
		ctx.arc(123, 93, 6, 0, 2 * Math.PI, true); // x, y, R, ang, ang, по часов\против
		ctx.fill();
	},
	update: function()
	{
		this.a_param = (this.a_param + this.da);
		if (this.a_param >= 0.6)
			this.da = -0.01;
		if (this.a_param <= 0)
			this.da = 0.01;
	}
}
const bird = 
{
	animationFrames: 
	[
		{sx: 276 + 1, sy: 112 + 1},
		{sx: 276 + 1, sy: 139 + 1},
		{sx: 276 + 1, sy: 164 + 1},
		{sx: 276 + 1, sy: 139 + 1},
	],
	x: 50,
	y: 150,
	width: 34,
	height: 26,
	frame: 0,
	fallingSpeed: 0,
	weight: 0.8,
	jump: 4,
	hitBox: 12,
	rotation: 0,
	draw: function()
	{
		let birdAnimation = this.animationFrames[this.frame];
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation)
		ctx.drawImage(sprite, birdAnimation.sx, birdAnimation.sy, this.width, this.height, 
			- this.width / 2, - this.height / 2, this.width, this.height);
		ctx.restore();
	},

	flap: function()
	{
		this.fallingSpeed = -this.jump;
		/*if (this.fallingSpeed < -this.jump / 1.2)
		{
			this.fallingSpeed = -this.jump / 1.2;
			console.log(this.fallingSpeed);
		}*/
	},

	fire: function()
	{
		
	},
	
	update: function()
	{
		if (frames % 5 == 0) // animate bird evry 5 frames
			this.frame++;
		this.frame = this.frame % this.animationFrames.length;
		if (gameState.current == gameState.getReady)
		{
			this.y = 150; // Place a bird in a starting position
			this.fallingSpeed = 0;
			this.rotation = 0;
		}
		else
		{
			this.fallingSpeed += this.weight * gravity;
			this.y += this.fallingSpeed;
			if (this.y + this.height / 2 >= cvs.height - ground.height) // touch the ground
			{
				this.y = cvs.height - ground.height - this.height / 2;
				if (gameState.current = gameState.game)
				{
					gameState.current = gameState.gameOver;
				}
			}
			if (this.fallingSpeed >= this.jump * gravity * 2.5) // == falling
			{
				this.rotation = (Math.PI / 2);
				this.frame = 1;
			}
			else if (this.fallingSpeed >= this.jump * gravity * 1.5) // == falling
				this.rotation = (Math.PI / 4);
			else if (this.fallingSpeed >= this.jump * gravity) // == falling
				this.rotation = 0;
			else
				this.rotation = -25 * Math.PI / 180;
		}
	}
}
const pipes = 
{
	pipe_positions: [],

	top_sx: 553,
	top_sy: 0,
	bottom_sx: 502,
	bottom_sy: 0,
	width: 53,
	height: 400,
	hole: 100,
	maxYPosition: -150,
	pipeSpeed: 2,
	reset: function()
	{
        this.pipe_positions = [];
    },
	draw: function()
	{
		for (let i = 0; i < this.pipe_positions.length; i++)
		{
			let pipe = this.pipe_positions[i];

			let topYPosition = pipe.y;
			let bottomYPosition = pipe.y + this.height + this.hole;
			ctx.drawImage(sprite, this.top_sx, this.top_sy, this.width, this.height, 
						pipe.x, topYPosition, this.width, this.height); // draw top pipe

			ctx.drawImage(sprite, this.bottom_sx, this.bottom_sy, this.width, this.height, 
						pipe.x, bottomYPosition, this.width, this.height); // draw bottom pipe
		}
	},
	update: function()
	{
		if(gameState.current != gameState.game) // if !game then: do nothing
			return;
		if (frames % 100 == 0)
		{
			this.pipe_positions.push(
			{
				x: cvs.width,
				y: this.maxYPosition * (Math.random() + 1)
			});
		}
		for (let i = 0; i < this.pipe_positions.length; i++)
		{
			let pipe = this.pipe_positions[i];
			let bottomPipeYPosition = pipe.y + this.height + this.hole;
			if (bird.x + bird.hitBox > pipe.x && bird.x - bird.hitBox < pipe.x + this.width &&
			 bird.y + bird.hitBox > pipe.y && bird.y - bird.hitBox < pipe.y + this.height)
                gameState.current = gameState.gameOver;
            if (bird.x + bird.hitBox > pipe.x && bird.x - bird.hitBox < pipe.x + this.width && 
            	bird.y + bird.hitBox > bottomPipeYPosition && bird.y - bird.hitBox < bottomPipeYPosition + this.height)
                gameState.current = gameState.gameOver;
            pipe.x -= this.pipeSpeed;
			if (pipe.x + this.width <= 0)
			{
				this.pipe_positions.shift();
				score.value++;
				score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }

		}
	}
}

const fireball =
{
	x: 50,
	y: 150,
	width: 20,
	height: 20
}
const getReady = 
{
	sx: 0,
	sy: 228,
	width: 173,
	height: 152,
	x: cvs.width / 2 - 173 / 2,
	y: 80,
	draw: function()
	{
		if(gameState.current == gameState.getReady)
		{
			ctx.drawImage(sprite, this.sx, this.sy, this.width, this.height, 
				this.x, this.y, this.width, this.height);
		}
	}
}


const gameOver = 
{
	sx: 175,
	sy: 228,
	width: 225,
	height: 202,
	x: cvs.width / 2 - 225 / 2,
	y: 90,
	draw: function()
	{
		if(gameState.current == gameState.gameOver)
		{
			ctx.drawImage(sprite, this.sx, this.sy, this.width, this.height, 
				this.x, this.y, this.width, this.height);
		}
	}
}

const score = 
{
	best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    
    draw: function()
    {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(gameState.current == gameState.game)
        {
            ctx.lineWidth = 1;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);  
        }
		else if(gameState.current == gameState.gameOver)
		{
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}
// MAIN FUNCTIONS
function draw ()
{
	ctx.fillStyle = "#01114C";
	ctx.fillRect(0, 0, cvs.width, cvs.height);

	bg.draw();
	stars.draw();
	pipes.draw();
	ground.draw();
	bird.draw();
	getReady.draw();
	gameOver.draw();
	score.draw();
}

function update()
{
	bird.update();
	ground.update();
	stars.update();
	pipes.update();
}

function loop()
{
	update();
	draw();
	frames++;

	requestAnimationFrame(loop);
}
window.onload = function()
{
	loop();
}