//--------------------------------------------------------
class GameplayService {
    constructor() {
        this.canvas = null;
        this.bulletsManager = null;
        this.wavesManager = null;
        this.bossManager = null;
        this.player = null;
        this.scrollingBackground = null;
        this.lifePlayer = null;
        this.currentScreen = null;
    }
    setCanvas(pCanvas) {
        this.canvas = pCanvas;
    }
    setBulletManager(pBulletManager) {
        this.bulletsManager = pBulletManager;
    }
    setWaveManager(pWaveManager) {
        this.wavesManager = pWaveManager;
    }
    setBossManager(pBossManager) {
        this.bossManager = pBossManager;
    }
    setPlayer(pPlayer) {
        this.player = pPlayer;
    }
    setScrollingBackground(pScrollingBackground) {
        this.scrollingBackground = pScrollingBackground;
    }
    setLifePlayer(pLifePlayer){
        this.lifePlayer = pLifePlayer;
    }
    setCurrentScreen(pCurrentScreen){
        this.currentScreen = pCurrentScreen;
    }
}
//--------------------------------------------------------
class SceneJeu {
    constructor() {

        this.keyboard = null;
        this.imageLoader = null;
        this.imgBackground = null;
        
        //------------------------------------------------------
        this.gameplayService = new GameplayService();
        this.bulletsManager = new bulletsManager(this.gameplayService);
        this.wavesManager = new WavesManager(this.gameplayService);

        this.gameplayService.setCanvas(canvas);
        this.gameplayService.setWaveManager(this.wavesManager);
        this.gameplayService.setBulletManager(this.bulletsManager);
        //--------------------------------------------------------

        this.shotSpeed = 0.5;
        this.shotTimer = 0;

        this.currentScreen = "MENU";
        this.score = 0;
        this.meilleurScore = 0;

        this.lstBullets = [];
        this.lstEmitters = [];

        this.sndExplosion = new sound("sounds/explosion.wav", 0.25);
        this.sndShoot = new sound("sounds/shoot.wav", 0.4);
        this.sndHit = new sound("sounds/hitHurt.wav", 0.4);
        //this.sndMusic = new sound("sounds/Jaunter-TheSearch.mp3", 0.2);
        

    }

    load(pImageLoader) {
        this.imageLoader = pImageLoader;
        this.imgBackground = this.imageLoader.getImage("images/background.png");
        
        this.logo = this.imageLoader.getImage("images/logo_devodome_mini.png")
        this.fleches = this.imageLoader.getImage("images/wing.png")
        this.toucheEspace = this.imageLoader.getImage("images/space.png")
    }

    demmareJeu(){
        this.player = new Player(5, 300);
        this.gameplayService.setPlayer(this.player);
        
        //this.sndMusic.play();

        let imgAlien1 = this.imageLoader.getImage("images/alien1.png");
        let spriteAlien1 = new Sprite(imgAlien1);
        spriteAlien1.setTileSheet(43, 38);
        spriteAlien1.addAnimation("IDLE", [0], 0, "false");
        spriteAlien1.startAnimation("IDLE");

        /*Calcule du pStartDistance : (largeur/speedAlien) + (largeur*speedBackground)+(largeurAlien*nombreAliens)+((nombreAliens-1)*(speedBackground*pPendingDelay)+ pDistance
        or
        1534 + (43 (or largeurAlien)*NombreAliens) + ((NombreAliens-1)*(2 or (vitesseBackground)*0.75 or (pPendingDelay))))+pDistance*/

        this.wavesManager.addWave(new AlienWave(spriteAlien1, 5, 0.75, 600 , 620, 300));
        this.wavesManager.addWave(new AlienWave(spriteAlien1, 7, 0.75, 1755 -50, 620, 150));
        this.wavesManager.addWave(new AlienWave(spriteAlien1, 7, 0.75, 1755+1755 -(50*10), 620, 450));
        this.wavesManager.addWave(new AlienWave(spriteAlien1, 10, 0.75, 1977.5+1755+1755 -(50*20), 620, 300));
        this.wavesManager.addWave(new AlienWave(spriteAlien1, 10, 0.75, (1977.5*2)+1755+1755 -(50*24), 620, 450));
        this.wavesManager.addWave(new AlienWave(spriteAlien1, 11, 0.75, (1977.5*3)+1755+1755 -(50*28), 620, 150));

        let imgBoss = this.imageLoader.getImage("images/boss2.png");
        let spriteBoss = new Sprite(imgBoss);
        spriteBoss.setTileSheet(184, 137);
        spriteBoss.addAnimation("IDLE", [0,1], 2, "true");
        spriteBoss.startAnimation("IDLE");

        this.wavesManager.addWave(new BossWave(spriteBoss, 0.75, (1977.5*4)+(1755*2) -(50*32), 620, 300));
        //this.wavesManager.addWave(new BossWave(spriteBoss, 0.75, 600, 620, 300));
        
        this.background = new ScrollingBackground(this.imgBackground);

        this.background.speed = 2;
    }

    updateMenu(dt){

        for (let index = this.lstBullets.length - 1; index >= 0; index--) {
            const b = this.lstBullets[index];
            this.lstBullets.splice(index, index + 1);
        }

        let lstWaves = this.wavesManager.wavesList;
        for (let indexWave = lstWaves.length - 1; indexWave>=0; indexWave--){
            const w = lstWaves[indexWave];
            lstWaves.splice(indexWave, indexWave);
        }
        
        this.demmareJeu();
    }

    updateJeu(dt){
        this.background.update(dt);
        this.wavesManager.update(dt, this.background.distance);
        this.bulletsManager.update(dt);

        if(this.player.life <= 0){
            this.sndExplosion.stop();
            this.sndExplosion.play();
            this.currentScreen = "OVER";
            bulletsManager.sndHitPlayer.stop();
            this.sndExplosion.play();
        }

        let lstAliens = this.wavesManager.currentWave.alienList;

        for (let index = this.lstBullets.length - 1; index >= 0; index--) {
            const b = this.lstBullets[index];
            b.update(dt);
            if (b.outOfScreen(canvas.width, canvas.height)) {
                this.lstBullets.splice(index, 1);
            } else {
                let lstAliens = this.wavesManager.currentWave.alienList;
                for (let indexAlien = lstAliens.length - 1; indexAlien >= 0; indexAlien--) {
                    const a = lstAliens[indexAlien].sprite;
                    if (b.pType = "PLAYER"){
                        if (b.collideWith(a)) {
                            this.lstBullets.splice(index, 1);

                            this.wavesManager.currentWave.life -= 1;
                            if(this.wavesManager.currentWave.life <= 0){

                                this.score += 10;

                                let newExplosion = new ParticleEmitter(a.x + a.width, a.y + a.height);
                                for (let n = 0; n < 40; n++) {
                                    newExplosion.add();
                                }
                                this.lstEmitters.push(newExplosion);
                                lstAliens.splice(indexAlien, 1);
                            }

                                this.wavesManager.currentWave.lifeBoss -= 1;
                                if(this.wavesManager.currentWave.lifeBoss <= 0){
                                    this.sndHit.stop();
                                    this.sndExplosion.stop();
                                    this.sndExplosion.play();

                                    let newExplosion = new ParticleEmitter(a.x + a.width, a.y + a.height);
                                    for (let n = 0; n < 80; n++) {
                                        newExplosion.add();
                                    }
                                    this.lstEmitters.push(newExplosion);
                                    lstAliens.splice(indexAlien, 1);

                                    if(this.wavesManager.currentWave.win = true){
                                        this.currentScreen ="WIN";
                                        this.score += 500;
                                    }
                                }
                                this.sndHit.stop();
                                this.sndHit.play();
                        }
                    }
                }
                
            } 
        }

        //-------COLLISION DU JOUEUR AVEC L'ENNEMI--------------------
        //let lstAliens = this.wavesManager.currentWave.alienList;
        for (let indexAlien = lstAliens.length - 1; indexAlien >= 0; indexAlien--) {
            const a = lstAliens[indexAlien].sprite;
            if (this.player.sprShip.collideWith(a)){
                lstAliens.splice(indexAlien, 1);
                this.player.life -= 1;
                this.sndExplosion.stop();
                this.sndExplosion.play();
            }
        }

        if (this.keyboard["ArrowDown"] == true && this.player.y < canvas.height - 27 - 1) {
            this.player.y += 3.5;
        }
        if (this.keyboard["ArrowUp"] == true && this.player.y > 1) {
            this.player.y -= 3.5;
        }
        if (this.keyboard["ArrowRight"] == true && this.player.x < canvas.width - 56 - 1) {
            this.player.x += 3;
        }
        if (this.keyboard["ArrowLeft"] == true && this.player.x > 1) {
            this.player.x -= 3;
        }

        if (this.keyboard["Space"] == true) {
            this.player.showCanon = true;
            if (this.shotTimer <= 0) {
                let position = this.player.getShotPosition(14);
                this.shoot(position.x, position.y, 0, 3.5,"PLAYER");
                this.shotTimer = this.shotSpeed;

                this.sndShoot.stop();
                this.sndShoot.play();
            }
        }
        else {
            this.player.showCanon = false;
        }

        if (this.shotTimer > 0) {
            this.shotTimer -= dt;
        }

        this.player.update(dt);

        this.lstEmitters.forEach(emitter => {
            emitter.update(dt);
        });
    }

    updateOver(dt){

    }
    updateWin(dt){

    }

    update(dt) {

        if(this.score > this.meilleurScore){
            this.meilleurScore = this.score;
        }

        if(this.currentScreen=="JEU"){
            this.updateJeu(dt);
        }
        if(this.currentScreen=="MENU"){
            this.updateMenu(dt);
        }
        if(this.currentScreen=="OVER"){
            this.updateOver(dt);
        }

        this.gameplayService.setCurrentScreen(this.currentScreen);
    }

    drawText(pCtx, px, py, pfont, pColor, pText){
        pCtx.font = pfont;
        pCtx.fillStyle = pColor;
        pCtx.fillText(pText, px, py);
    }

    drawScore(pCtx, px, py){
        this.drawText(pCtx, px, py, "15px Symtext", "#fff", "Score: "+this.score);
    }

    drawMenu(pCtx){
        this.background.draw(pCtx);
        
        this.drawText(pCtx, 100, 135, "60px Symtext" ,"#e6007e", "DEV'O SHOOT");
        this.drawText(pCtx, 90, 125, "60px Symtext" ,"#fff", "DEV'O SHOOT");

        this.drawText(pCtx, 140, 250, "40px Symtext" ,"#fff", "Press Enter");
        this.drawText(pCtx, 140, 300, "30px Symtext", "#fff", "Meilleur Score: "+this.meilleurScore);
        this.drawText(pCtx, 140, 340, "30px Symtext", "#fff", "Score: "+this.score);

        this.drawText(pCtx, 25, 600-100, "25px Symtext", "#fff", "for moving");
        pCtx.drawImage(this.fleches,50,600-100);
        this.drawText(pCtx, 370, 600-100, "25px Symtext", "#fff", "for shooting");
        pCtx.drawImage(this.toucheEspace,370,525);
    }

    drawJeu(pCtx){
        this.background.draw(pCtx);
        this.wavesManager.draw(pCtx);
        this.bulletsManager.draw(pCtx);

        this.player.draw(pCtx);

        this.lstBullets.forEach(b => {
            b.draw(pCtx);
        });

        this.lstEmitters.forEach(emitter => {
            emitter.draw(pCtx);
        });

        if(this.player.life == 2){
            pCtx.drawImage(this.logo, 5,5);
            pCtx.drawImage(this.logo, 5+ this.logo.width ,5);
        }

        if(this.player.life == 1){
            pCtx.drawImage(this.logo, 5,5);
        }

        this.drawScore(pCtx, 5, 595);
    }

    drawOver(pCtx){
        this.background.draw(pCtx);
        this.drawText(pCtx, 140, 300, "40px Symtext" ,"#fff", "GAME OVER");
        this.drawText(pCtx, 140, 340, "30px Symtext", "#fff", "Score: "+this.score);
    }

    drawWin(pCtx){
        this.background.draw(pCtx);
        this.drawText(pCtx, 140, 250, "40px Symtext" ,"#fff", "You WIN");
        this.drawText(pCtx, 140, 300, "30px Symtext", "#fff", "Meilleur Score: "+this.meilleurScore);
        this.drawText(pCtx, 140, 340, "30px Symtext", "#fff", "Score: "+this.score);
    }

    draw(pCtx) {
        pCtx.save();
        pCtx.scale(1, 1);

        if(this.currentScreen=="JEU"){
            this.drawJeu(pCtx);
        }
        if(this.currentScreen=="MENU"){
            this.drawMenu(pCtx);
        }
        if(this.currentScreen=="OVER"){
            this.drawOver(pCtx);
        }
        if(this.currentScreen=="WIN"){
            this.drawWin(pCtx);
        }

        pCtx.restore();
    }

    shoot(px, py, pAngle, pSpeed, pType){
        let vx, vy;
        vx = pSpeed * Math.cos(pAngle);
        vy = pSpeed * Math.sin(pAngle);
        let b = new Bullet(px, py, vx, vy, pType);
        this.lstBullets.push(b);
    }

    keypressed(pKey) {
        if (pKey == "Enter" && this.currentScreen=="MENU") {
            this.currentScreen = "JEU";
            this.score = 0;
        }
        if (pKey == "Enter" && this.currentScreen=="OVER") {
            this.currentScreen = "MENU";
            this.bulletsManager.hit = 0;
        }
        if (pKey == "Enter" && this.currentScreen=="WIN") {
            this.currentScreen = "MENU";
            this.bulletsManager.hit = 0;
        }
    }
}