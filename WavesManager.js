class Alien {
    constructor(pSprite, pGameplayService){
        this.sprite = pSprite;
        this.gameplayService = pGameplayService;
        this.timer = 0;
        this.pendingDelay = 0;
        this.speed = 1.8;
        this.started = false;
        this.fireTimer = 1;
        this.bossFireTimer = 1;
        this.bossFireTimer2 = 1.75;
        
    }

    update(dt) {
        this.sprite.update(dt);
        this.fireTimer -= dt;
        this.bossFireTimer -= dt;
        this.bossFireTimer2 -= dt;
    }

    fire(){
        if(this.fireTimer <= 0 ){
            this.gameplayService.bulletsManager.shoot(this.sprite.x, this.sprite.y + (this.sprite.height/2), angle(this.sprite.x, this.sprite.y, this.gameplayService.player.sprShip.x, this.gameplayService.player.sprShip.y), 3, "ALIEN");
            this.fireTimer=2;
        }
    }

    bossFire(){
        if(this.bossFireTimer <= 0 ){
            this.gameplayService.bulletsManager.shoot(this.sprite.x, this.sprite.y + (this.sprite.height/2), 91.1, 3, "ALIEN");
            this.gameplayService.bulletsManager.shoot(this.sprite.x, this.sprite.y + (this.sprite.height/2), 230, 3, "ALIEN");
            this.gameplayService.bulletsManager.shoot(this.sprite.x, this.sprite.y + (this.sprite.height/2), -230, 3, "ALIEN");
            this.bossFireTimer=1;
        }

        if(this.bossFireTimer2 <= 0 ){
            this.gameplayService.bulletsManager.shoot(this.sprite.x, this.sprite.y + (this.sprite.height/2), angle(this.sprite.x, this.sprite.y, this.gameplayService.player.sprShip.x, this.gameplayService.player.sprShip.y), 3, "ALIEN");
            this.bossFireTimer2= 1.75;
        }
    }

    draw(pCtx) {
        this.sprite.draw(pCtx);
    }
}

class AlienWave {
    constructor(pSprite, pNumber, pPendingDelay, pStartDistance, pX, pY) {
        this.alienList = [];
        this.sprite = pSprite;
        this.startDistance = pStartDistance;
        this.started = false;
        this.number = pNumber;
        this.pendingDelay = pPendingDelay;
        this.x = pX;
        this.y = pY;
        this.life = 1;
    }

    addAlien(pAlien) {
        this.alienList.push(pAlien);
    }

    update(dt) {
        for (let i = this.alienList.length - 1; i >= 0; i--) {
            let alien = this.alienList[i];

            if (alien.started == false) {
                alien.timer += dt;
                if (alien.timer >= alien.pendingDelay) {
                    //console.log("alien qui démarre à " + alien.timer);
                    alien.started = true;
                }
            }

            if (alien.started) {
                alien.update(dt);

                alien.fire();

                alien.sprite.x -= alien.speed;
                if (alien.sprite.x < 0 - alien.sprite.tileSize.x) {
                    //console.log("suppresion d'un alien hors écran");
                    this.alienList.splice(i, 1);
                }
            }
        }
    }

    draw(pCtx) {
        this.alienList.forEach(alien => {
            alien.draw(pCtx);
        });
    }
}

//-------------------BOSS---------------------------------

class BossWave {
    constructor(pSprite, pPendingDelay, pStartDistance, pX, pY) {
        this.alienList = [];
        this.sprite = pSprite;
        this.startDistance = pStartDistance;
        this.started = false;
        this.number = 1;
        this.pendingDelay = pPendingDelay;
        this.x = pX;
        this.y = pY;
        this.lifeBoss = 35;
        this.currentScreen = null;
        this.win = false;
        this.speedY = 1
    }

    addAlien(pAlien) {
        this.alienList.push(pAlien);
    }

    update(dt) {

        if (this.lifeBoss <= 0){
            this.win = true;
        }

        for (let i = this.alienList.length - 1; i >= 0; i--) {
            let alien = this.alienList[i];

            if (alien.started == false) {
                alien.timer += dt;
                if (alien.timer >= alien.pendingDelay) {
                    //console.log("alien qui démarre à " + alien.timer);
                    alien.started = true;
                }
            }

            if (alien.started) {
                alien.update(dt);
               
                alien.bossFire();

                alien.sprite.x -= alien.speed;
                if (alien.sprite.x < 0 - alien.sprite.tileSize.x) {
                    //console.log("suppresion d'un alien hors écran");
                    this.alienList.splice(i, 1);
                }
                if(alien.sprite.x <= 450){
                    alien.speed = 0;

                    alien.sprite.y -= this.speedY;
                    if (alien.sprite.y < 0){
                        this.speedY = this.speedY * -1;
                    }
                    if (alien.sprite.y > canvas.height - this.sprite.height){
                        this.speedY = this.speedY * -1;
                    }
                }
            }
        }
    }

    draw(pCtx) {
        this.alienList.forEach(alien => {
            alien.draw(pCtx);
        });
    }
}

//-------------------------------------------------------------

class WavesManager {
    constructor(pGameplayService){
        this.gameplayService = pGameplayService;
        this.wavesList = [];
        this.currentWave = null;
    }

    addWave(pWave) {
        this.wavesList.push(pWave);
    }

    stopWave(pWave) {
        //console.log("Stoppe la vague précédente");
        let index = this.wavesList.indexOf(pWave);
        if (index != -1) {
            this.wavesList.splice(index, index);
        }
    }

    startWave(pWave) {
        //console.log("Vague démarrée à " + pWave.startDistance);
        pWave.started = true;

        if (this.currentWave != null) {
            this.stopWave(pWave);
        }

        this.currentWave = pWave;

        for (let i = 0; i < pWave.number; i++) {
            //console.log("Crée alien " + i);

            let mySprite = new Sprite(pWave.sprite.img);
            Object.assign(mySprite, pWave.sprite);
            
            let alien = new Alien(mySprite, this.gameplayService);
            alien.sprite.x = pWave.x;
            alien.sprite.y = pWave.y;
            alien.pendingDelay = i * pWave.pendingDelay;
            pWave.addAlien(alien);
        }
    }

    update(dt, pDistance) {
        this.wavesList.forEach(wave => {
            canvas = this.gameplayService.canvas;
            if (pDistance >= wave.startDistance && !wave.started) {
                this.startWave(wave);
            }
        });
        if (this.currentWave != null) {
            this.currentWave.update(dt, this.gameplayService.bulletsManager);
        }
    }

    draw(pCtx) {
        if (this.currentWave != null) {
            this.currentWave.draw(pCtx);
        }
    }
}