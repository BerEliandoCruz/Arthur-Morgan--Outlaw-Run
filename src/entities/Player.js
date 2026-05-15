// ============================================
// PLAYER - Arthur Morgan
// ============================================

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'arthur_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);
        this.body.setSize(CONFIG.ARTHUR.HITBOX_W, CONFIG.ARTHUR.HITBOX_H);
        this.body.setOffset(8, 16);
        this.setCollideWorldBounds(false);
        this.setDepth(10);

        this.facingRight = true;
        this.isRunning = false;
        this.isShooting = false;
        this.shootTimer = 0;
        this.invincible = false;
        this.invTimer = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.mounted = false;
        this.horse = null;
        this.lastGrounded = true;

        this.setupAnimations();
    }

    setupAnimations() {
        const anims = this.scene.anims;
        if (anims.exists('arthur_idle')) return;

        anims.create({ key: 'arthur_idle', frames: anims.generateFrameNumbers('arthur_idle', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'arthur_walk', frames: anims.generateFrameNumbers('arthur_walk', { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        anims.create({ key: 'arthur_run', frames: anims.generateFrameNumbers('arthur_run', { start: 0, end: 7 }), frameRate: 14, repeat: -1 });
        anims.create({ key: 'arthur_jump', frames: anims.generateFrameNumbers('arthur_jump', { start: 0, end: 3 }), frameRate: 8, repeat: 0 });
        anims.create({ key: 'arthur_shoot', frames: anims.generateFrameNumbers('arthur_shoot', { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
        anims.create({ key: 'arthur_hit', frames: anims.generateFrameNumbers('arthur_hit', { start: 0, end: 1 }), frameRate: 8, repeat: 0 });
        anims.create({ key: 'arthur_death', frames: anims.generateFrameNumbers('arthur_death', { start: 0, end: 5 }), frameRate: 6, repeat: 0 });
    }

    update(time, delta, cursors, keys) {
        if (this.isDead) {
            this.deathTimer -= delta;
            if (this.deathTimer <= 0) {
                this.scene.handlePlayerDeath();
            }
            return;
        }

        if (this.mounted && this.horse) {
            this.updateMounted(time, delta, cursors, keys);
            return;
        }

        this.updateMovement(cursors, keys);
        this.updateShooting(time, keys);
        this.updateAnimation();
        this.updateInvincibility(delta);

        // Check fall death
        if (this.y > this.scene.levelBottom + 200) {
            this.die();
        }

        // Update checkpoint
        if (this.x > GameState.checkpointX + CONFIG.CHECKPOINT_INTERVAL) {
            GameState.checkpointX = Math.floor(this.x / CONFIG.CHECKPOINT_INTERVAL) * CONFIG.CHECKPOINT_INTERVAL;
        }
    }

    updateMovement(cursors, keys) {
        const onFloor = this.body.onFloor();
        this.isRunning = keys.shift.isDown;

        let speed = this.isRunning ? CONFIG.ARTHUR.RUN_SPEED : CONFIG.ARTHUR.WALK_SPEED;
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
            this.setVelocityY(CONFIG.ARTHUR.JUMP_FORCE);
            SFX.jump();
        }

        if (!onFloor && this.lastGrounded) {
            // Just left ground
        }
        this.lastGrounded = onFloor;
    }

    updateMounted(time, delta, cursors, keys) {
        if (!this.horse || !this.horse.active) {
            this.dismount();
            return;
        }

        this.x = this.horse.x;
        this.y = this.horse.y - 40;
        this.setFlipX(!this.horse.facingRight);
        this.facingRight = this.horse.facingRight;

        // Dismount
        if (keys.e.isDown && !this._dismountPressed) {
            this._dismountPressed = true;
            this.dismount();
            return;
        }
        if (!keys.e.isDown) this._dismountPressed = false;

        this.horse.handleInput(cursors, keys);
        this.updateShooting(time, keys);
        this.updateInvincibility(delta);

        // Shooting animation while mounted
        if (this.isShooting) {
            this.anims.play('arthur_shoot', true);
        } else {
            this.anims.play('arthur_idle', true);
        }
    }

    updateShooting(time, keys) {
        if (this.isShooting && time > this.shootTimer) {
            this.isShooting = false;
        }

        if ((keys.f.isDown || keys.ctrl.isDown) && time > this.shootTimer) {
            const weapon = GameState.getCurrentWeapon();
            if (!weapon) return;

            if (weapon.ammo <= 0) {
                // Punch if no ammo and close range
                if (!weapon.isArc) {
                    this.punch(time);
                }
                return;
            }

            weapon.ammo--;
            this.isShooting = true;
            this.shootTimer = time + weapon.fireRate;

            const dir = this.facingRight ? 1 : -1;
            const bx = this.x + dir * 30;
            const by = this.y - 10;

            if (weapon.isArc) {
                this.scene.spawnDynamite(bx, by, dir);
                SFX.throwDynamite();
            } else {
                this.scene.spawnBullet(bx, by, dir, weapon);
                if (weapon.key === 'REVOLVER') SFX.shootRevolver();
                else if (weapon.key === 'SHOTGUN') SFX.shootShotgun();
                else SFX.shootRifle();
            }
        }
    }

    punch(time) {
        this.isShooting = true;
        this.shootTimer = time + 400;
        SFX.punch();

        const dir = this.facingRight ? 1 : -1;
        const punchX = this.x + dir * CONFIG.ARTHUR.PUNCH_RANGE;
        const punchY = this.y;

        // Check enemies in punch range
        if (this.scene.enemies) {
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy.active && Math.abs(enemy.x - punchX) < 40 && Math.abs(enemy.y - punchY) < 40) {
                    enemy.takeDamage(CONFIG.ARTHUR.PUNCH_DAMAGE);
                }
            });
        }
    }

    updateAnimation() {
        if (this.isDead) return;

        const onFloor = this.body.onFloor();

        if (this.isShooting) {
            this.anims.play('arthur_shoot', true);
        } else if (!onFloor) {
            this.anims.play('arthur_jump', true);
        } else if (Math.abs(this.body.velocity.x) > 10) {
            if (this.isRunning) {
                this.anims.play('arthur_run', true);
            } else {
                this.anims.play('arthur_walk', true);
            }
        } else {
            this.anims.play('arthur_idle', true);
        }
    }

    updateInvincibility(delta) {
        if (this.invincible) {
            this.invTimer -= delta;
            this.setAlpha(Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.3);
            if (this.invTimer <= 0) {
                this.invincible = false;
                this.setAlpha(1);
            }
        }
    }

    takeDamage(amount) {
        if (this.invincible || this.isDead) return;

        GameState.hp -= amount;
        GameState.damageTaken = true;
        SFX.hit();

        // Knockback
        const kb = this.facingRight ? -100 : 100;
        this.setVelocityX(kb);

        this.invincible = true;
        this.invTimer = CONFIG.ARTHUR.INVINCIBLE_TIME;

        // Flash effect
        this.scene.cameras.main.shake(100, 0.01);

        if (GameState.hp <= 0) {
            GameState.hp = 0;
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.setVelocityX(0);
        this.anims.play('arthur_death', true);
        SFX.death();
        this.deathTimer = 2000;
        if (this.mounted) this.dismount();
    }

    mount(horse) {
        if (this.mounted || this.isDead || !horse || !horse.active) return;
        this.mounted = true;
        this.horse = horse;
        GameState.mounted = true;
        this.body.enable = false;
        horse.ridden = true;
    }

    dismount() {
        if (!this.mounted) return;
        this.mounted = false;
        GameState.mounted = false;
        this.body.enable = true;

        if (this.horse) {
            this.x = this.horse.x - 40;
            this.y = this.horse.y - 20;
            this.horse.ridden = false;
        }
        this.horse = null;
        this.setVelocityY(-200);
    }

    heal(amount) {
        GameState.hp = Math.min(GameState.hp + amount, CONFIG.ARTHUR.MAX_HP);
    }
}
