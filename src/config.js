// ============================================
// GAME CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    GAME_WIDTH: 1280,
    GAME_HEIGHT: 720,
    GRAVITY: 800,
    TILE_SIZE: 48,

    ARTHUR: {
        WALK_SPEED: 200,
        RUN_SPEED: 320,
        JUMP_FORCE: -480,
        MAX_HP: 100,
        START_LIVES: 3,
        HITBOX_W: 32,
        HITBOX_H: 64,
        PUNCH_DAMAGE: 10,
        PUNCH_RANGE: 40,
        INVINCIBLE_TIME: 1000,
    },

    HORSE: {
        SPEED: 480,
        JUMP_FORCE: -420,
        MAX_HP: 150,
        HITBOX_W: 80,
        HITBOX_H: 64,
        STOMP_DAMAGE: 30,
    },

    WEAPONS: {
        REVOLVER:  { key: 'REVOLVER',  name: 'Revólver',    damage: 20, fireRate: 400,  maxAmmo: 24, range: 1280, bulletSpeed: 600, bulletW: 8,  bulletH: 4 },
        SHOTGUN:   { key: 'SHOTGUN',   name: 'Espingarda',  damage: 45, fireRate: 800,  maxAmmo: 12, range: 768,  bulletSpeed: 500, bulletW: 12, bulletH: 6 },
        RIFLE:     { key: 'RIFLE',     name: 'Rifle',       damage: 35, fireRate: 300,  maxAmmo: 18, range: 1280, bulletSpeed: 700, bulletW: 10, bulletH: 3 },
        DYNAMITE:  { key: 'DYNAMITE',  name: 'Dinamite',    damage: 80, fireRate: 1500, maxAmmo: 4,  range: 400,  bulletSpeed: 300, bulletW: 12, bulletH: 12, isArc: true, aoeRadius: 96 },
    },

    ENEMIES: {
        BANDIT_MELEE:   { key: 'BANDIT_MELEE',   hp: 40,  contactDmg: 15, bulletDmg: 0,  speed: 100, fireRate: 0,    detectRange: 400 },
        BANDIT_SHOOTER: { key: 'BANDIT_SHOOTER',  hp: 40,  contactDmg: 10, bulletDmg: 20, speed: 0,   fireRate: 2500, detectRange: 400 },
        SNIPER:         { key: 'SNIPER',          hp: 60,  contactDmg: 0,  bulletDmg: 30, speed: 0,   fireRate: 3500, detectRange: 600 },
        WOLF:           { key: 'WOLF',            hp: 30,  contactDmg: 20, bulletDmg: 0,  speed: 250, detectRange: 400 },
        BEAR:           { key: 'BEAR',            hp: 200, contactDmg: 40, bulletDmg: 0,  speed: 60,  detectRange: 300 },
        COUGAR:         { key: 'COUGAR',          hp: 80,  contactDmg: 35, bulletDmg: 0,  speed: 350, detectRange: 400 },
    },

    SCORING: {
        ENEMY_KILL: 200,
        PHASE_COMPLETE: 1000,
        TIME_BONUS_PER_SEC: 10,
        PERFECT_BONUS: 500,
        COIN: 100,
    },

    ITEMS: {
        COIN_VALUE: 100,
        HERB_HEAL: 25,
        AMMO_REFILL_PERCENT: 0.5,
    },

    COLORS: {
        HAT:        0x3B2A1A,
        SHIRT:      0x4A7AB5,
        SCARF:      0x2C2C2C,
        SUSPENDERS: 0x5C3D1E,
        BELT:       0x5C3D1E,
        BUCKLE:     0xC9A84C,
        PANTS:      0x2E2416,
        BOOTS:      0x5C3D1E,
        SKIN:       0xD4A574,
        BEARD:      0x6B4423,
        HAIR:       0x3B2A1A,
        EYES:       0x1a1a1a,

        HORSE_BODY: 0xF5F5F5,
        HORSE_MANE: 0x1A1A1A,
        HORSE_SADDLE: 0x8B5E2E,
        HORSE_SADDLE_GOLD: 0xC9A84C,

        BANDIT_HAT:   0x222222,
        BANDIT_SHIRT: 0x8B4513,
        BANDIT_SCARF: 0x8B0000,

        WOLF_BODY:  0x808080,
        BEAR_BODY:  0x4A3728,
        COUGAR_BODY: 0xC9A84C,

        BULLET:     0xFFD700,
        DYNAMITE:   0xCC3333,
        EXPLOSION:  0xFF6600,

        GOLD_COIN:  0xFFD700,
        HERB:       0x228B22,
        HEART:      0xFF1744,
        AMMO_BOX:   0x8B5E2E,

        SKY_BLUE:   0x87CEEB,
        GROUND:     0x8B7355,
        GRASS:      0x6B8E23,
    },

    CHECKPOINT_INTERVAL: 1000,

    LEVELS: {
        1: { name: 'Planícies de Heartlands', length: 3000, hasHorse: true,  skyColor: '#87CEEB', groundColor: '#8B7355', grassColor: '#6B8E23' },
        2: { name: 'Floresta de Roanoke',     length: 4000, hasHorse: true,  skyColor: '#4A6741', groundColor: '#5C4033', grassColor: '#2E5E1A', horseSpeedMult: 0.7 },
        3: { name: 'Cidade de Rhodes',         length: 3500, hasHorse: false, skyColor: '#C4A882', groundColor: '#A0896E', grassColor: '#8B7355' },
        4: { name: 'Montanhas de Ambarino',    length: 5000, hasHorse: true,  skyColor: '#B0C4DE', groundColor: '#D3D3D3', grassColor: '#E8E8E8', hasIce: true },
    },
};

// Global game state shared across scenes
const GameState = {
    currentLevel: 1,
    lives: CONFIG.ARTHUR.START_LIVES,
    score: 0,
    hp: CONFIG.ARTHUR.MAX_HP,
    weapons: [{ ...CONFIG.WEAPONS.REVOLVER, ammo: CONFIG.WEAPONS.REVOLVER.maxAmmo }],
    currentWeaponIndex: 0,
    horseHP: CONFIG.HORSE.MAX_HP,
    horseAlive: true,
    mounted: false,
    damageTaken: false,
    checkpointX: 0,
    phaseTime: 0,

    reset() {
        this.currentLevel = 1;
        this.lives = CONFIG.ARTHUR.START_LIVES;
        this.score = 0;
        this.resetLevel();
    },

    resetLevel() {
        this.hp = CONFIG.ARTHUR.MAX_HP;
        this.weapons = [{ ...CONFIG.WEAPONS.REVOLVER, ammo: CONFIG.WEAPONS.REVOLVER.maxAmmo }];
        this.currentWeaponIndex = 0;
        const lvl = CONFIG.LEVELS[this.currentLevel];
        this.horseHP = CONFIG.HORSE.MAX_HP;
        this.horseAlive = lvl.hasHorse;
        this.mounted = false;
        this.damageTaken = false;
        this.checkpointX = 0;
        this.phaseTime = 0;
    },

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex] || null;
    },

    addWeapon(weaponConfig) {
        const exists = this.weapons.find(w => w.key === weaponConfig.key);
        if (exists) {
            exists.ammo = Math.min(exists.ammo + Math.ceil(weaponConfig.maxAmmo * 0.5), weaponConfig.maxAmmo);
        } else {
            this.weapons.push({ ...weaponConfig, ammo: weaponConfig.maxAmmo });
        }
    },

    nextWeapon() {
        if (this.weapons.length <= 1) return;
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    },

    prevWeapon() {
        if (this.weapons.length <= 1) return;
        this.currentWeaponIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
    },
};
