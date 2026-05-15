// ============================================
// HORSE
// ============================================

class Horse extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'horse_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.body.setSize(CONFIG.HORSE.HITBOX_W, CONFIG.HORSE.HITBOX_H);
        this.body.setOffset(8, 8);
        this.setCollideWorldBounds(false);
        this.setDepth(9);

        this.facingRight = true;
        this.ridden = false;
        this.isDead = false;
        this.speedMultiplier = 1;

        this.setupAnimations();
    }

    setupAnimations() {
        const anims = this.scene.anims;
        if (anims.exists('horse_idle_anim')) return;

        anims.create({ key: 'horse_idle_anim', frames: anims.generateFrameNumbers('horse_idle', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
        anims.create({ key: 'horse_walk_anim', frames: anims.generateFrameNumbers('horse_walk', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
        anims.create({ key: 'horse_gallop_anim', frames: anims.generateFrameNumbers('horse_gallop', { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
        anims.create({ key: 'horse_jump_anim', frames: anims.generateFrameNumbers('horse_jump', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
    }

    update(time, delta) {
        if (this.isDead || !this.active) return;

        if (!this.ridden) {
            this.setVelocityX(0);
            this.anims.play('horse_idle_anim', true);
        }

        // Check fall
        if (this.y > this.scene.levelBottom + 200) {
            this.die();
        }
    }

    handleInput(cursors, keys) {
        if (this.isDead) return;

        const speed = CONFIG.HORSE.SPEED * this.speedMultiplier;
        const onFloor = this.body.onFloor();
        let vx = 0;

        if (cursors.left.isDown || keys.a.isDown) {
            vx = -speed;
            this.facingRight = false;
        } else if (cursors.right.isDown || keys.d.isDown) {
            vx = speed;
            this.facingRight = true;
        }

        this.setVelocityX(vx);
        this.setFlipX(!this.facingRight);

        if (onFloor && (cursors.up.isDown || keys.w.isDown || cursors.space.isDown)) {
            this.setVelocityY(CONFIG.HORSE.JUMP_FORCE);
            SFX.jump();
        }

        // Animation
        if (!onFloor) {
            this.anims.play('horse_jump_anim', true);
        } else if (Math.abs(vx) > 400) {
            this.anims.play('horse_gallop_anim', true);
        } else if (Math.abs(vx) > 10) {
            this.anims.play('horse_walk_anim', true);
        } else {
            this.anims.play('horse_idle_anim', true);
        }
    }

    takeDamage(amount) {
        if (this.isDead) return;
        GameState.horseHP -= amount;
        SFX.hit();
        this.setTint(0xFF0000);
        this.scene.time.delayedCall(200, () => { if (this.active) this.clearTint(); });

        if (GameState.horseHP <= 0) {
            GameState.horseHP = 0;
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        GameState.horseAlive = false;
        SFX.death();

        // Force dismount
        if (this.ridden && this.scene.player) {
            this.scene.player.dismount();
        }

        this.setVelocityX(0);
        this.setTint(0x888888);
        this.scene.time.delayedCall(1000, () => {
            if (this.active) this.destroy();
        });
    }
}
