// Sprite Generation System - Draws all game sprites programmatically
class SpriteGen {
    constructor(scene) { this.scene = scene; }

    hex(c) { return '#' + c.toString(16).padStart(6, '0'); }

    makeSheet(key, w, h, frames, drawFn) {
        const c = document.createElement('canvas');
        c.width = w * frames; c.height = h;
        const x = c.getContext('2d');
        for (let i = 0; i < frames; i++) {
            x.save(); x.translate(i * w, 0);
            drawFn(x, i, w, h);
            x.restore();
        }
        this.scene.textures.addSpriteSheet(key, c, { frameWidth: w, frameHeight: h });
    }

    makeTex(key, w, h, drawFn) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        drawFn(c.getContext('2d'), w, h);
        this.scene.textures.addCanvas(key, c);
    }

    rect(x, cx, cy, w, h, col) {
        x.fillStyle = this.hex(col); x.fillRect(cx, cy, w, h);
    }

    circ(x, cx, cy, r, col) {
        x.fillStyle = this.hex(col);
        x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
    }

    // Arthur drawing helper
    drawArthur(x, frame, w, h, state) {
        const C = CONFIG.COLORS;
        const midX = w / 2, baseY = h - 4;
        const breathe = (state === 'idle') ? Math.sin(frame * 1.57) * 1 : 0;
        let legL = 0, legR = 0, armAngle = 0, bodyTilt = 0;

        if (state === 'walk') {
            legL = Math.sin(frame * 0.785) * 8;
            legR = -legL;
            armAngle = -legL * 0.5;
        } else if (state === 'run') {
            legL = Math.sin(frame * 0.785) * 14;
            legR = -legL;
            armAngle = -legL * 0.7;
            bodyTilt = 3;
        } else if (state === 'jump') {
            if (frame < 2) { legL = -6; legR = -6; }
            else { legL = 4; legR = 4; }
        }

        x.save();
        x.translate(bodyTilt, 0);

        // Boots
        this.rect(x, midX - 10 + legL, baseY - 8, 8, 8, C.BOOTS);
        this.rect(x, midX + 2 + legR, baseY - 8, 8, 8, C.BOOTS);
        // Legs
        this.rect(x, midX - 8 + legL, baseY - 24, 6, 16, C.PANTS);
        this.rect(x, midX + 2 + legR, baseY - 24, 6, 16, C.PANTS);
        // Belt
        this.rect(x, midX - 10, baseY - 28, 20, 4, C.BELT);
        this.rect(x, midX - 2, baseY - 28, 4, 4, C.BUCKLE);
        // Body
        this.rect(x, midX - 10, baseY - 46 + breathe, 20, 18, C.SHIRT);
        // Suspenders
        this.rect(x, midX - 8, baseY - 46 + breathe, 2, 18, C.SUSPENDERS);
        this.rect(x, midX + 6, baseY - 46 + breathe, 2, 18, C.SUSPENDERS);
        // Cartridge belt
        this.rect(x, midX - 12, baseY - 30, 24, 2, C.BELT);
        // Arms
        if (state === 'shoot') {
            // Shooting arm extended
            this.rect(x, midX + 10, baseY - 44, 16, 5, C.SHIRT);
            this.rect(x, midX + 22, baseY - 44, 8, 4, C.SKIN);
            // Gun
            this.rect(x, midX + 30, baseY - 46, 12, 4, 0x333333);
            this.rect(x, midX + 30, baseY - 43, 3, 6, 0x333333);
            // Other arm
            this.rect(x, midX - 14, baseY - 42 + armAngle, 5, 14, C.SHIRT);
        } else {
            this.rect(x, midX - 14, baseY - 42 + armAngle, 5, 14, C.SHIRT);
            this.rect(x, midX + 9, baseY - 42 - armAngle, 5, 14, C.SHIRT);
        }
        // Neck scarf
        this.rect(x, midX - 6, baseY - 50 + breathe, 12, 4, C.SCARF);
        // Head
        this.rect(x, midX - 7, baseY - 64 + breathe, 14, 14, C.SKIN);
        // Beard
        this.rect(x, midX - 6, baseY - 54 + breathe, 12, 4, C.BEARD);
        // Eyes
        this.rect(x, midX - 3, baseY - 60 + breathe, 2, 2, C.EYES);
        // Hat brim
        this.rect(x, midX - 14, baseY - 68 + breathe, 28, 4, C.HAT);
        // Hat crown
        this.rect(x, midX - 8, baseY - 78 + breathe, 16, 10, C.HAT);

        x.restore();
    }

    drawHorse(x, frame, w, h, state) {
        const C = CONFIG.COLORS;
        const midX = w / 2, baseY = h - 2;
        let legFL = 0, legFR = 0, legBL = 0, legBR = 0, headBob = 0, tailWag = 0;

        if (state === 'walk') {
            legFL = Math.sin(frame * 0.785) * 8; legFR = -legFL;
            legBL = Math.sin(frame * 0.785 + 1.57) * 8; legBR = -legBL;
            headBob = Math.sin(frame * 1.57) * 2;
        } else if (state === 'gallop') {
            legFL = Math.sin(frame * 0.785) * 16; legFR = Math.sin(frame * 0.785 + 0.5) * 16;
            legBL = Math.sin(frame * 0.785 + 2.5) * 16; legBR = Math.sin(frame * 0.785 + 3) * 16;
            headBob = Math.sin(frame * 1.57) * 4;
        } else if (state === 'jump') {
            legFL = -10; legFR = -8; legBL = 10; legBR = 12;
            headBob = -4;
        }
        tailWag = Math.sin(frame * 1.2) * 6;

        // Legs
        this.rect(x, midX + 20 + legFL, baseY - 24, 6, 24, C.HORSE_BODY);
        this.rect(x, midX + 28 + legFR, baseY - 24, 6, 24, C.HORSE_BODY);
        this.rect(x, midX - 28 + legBL, baseY - 24, 6, 24, C.HORSE_BODY);
        this.rect(x, midX - 20 + legBR, baseY - 24, 6, 24, C.HORSE_BODY);
        // Hooves
        this.rect(x, midX + 20 + legFL, baseY - 4, 6, 4, C.HORSE_MANE);
        this.rect(x, midX + 28 + legFR, baseY - 4, 6, 4, C.HORSE_MANE);
        this.rect(x, midX - 28 + legBL, baseY - 4, 6, 4, C.HORSE_MANE);
        this.rect(x, midX - 20 + legBR, baseY - 4, 6, 4, C.HORSE_MANE);
        // Body
        this.rect(x, midX - 30, baseY - 46, 64, 22, C.HORSE_BODY);
        // Saddle
        this.rect(x, midX - 10, baseY - 52, 24, 8, C.HORSE_SADDLE);
        this.rect(x, midX - 6, baseY - 54, 16, 4, C.HORSE_SADDLE_GOLD);
        // Tail
        x.save(); x.translate(midX - 34, baseY - 42);
        x.rotate((-30 + tailWag) * Math.PI / 180);
        this.rect(x, -3, 0, 6, 20, C.HORSE_MANE);
        x.restore();
        // Neck
        x.save();
        x.translate(midX + 30, baseY - 46 + headBob);
        this.rect(x, 0, -20, 12, 24, C.HORSE_BODY);
        // Mane
        this.rect(x, 2, -22, 4, 24, C.HORSE_MANE);
        // Head
        this.rect(x, 6, -30, 18, 14, C.HORSE_BODY);
        this.rect(x, 20, -26, 8, 8, 0xD0C0C0); // muzzle
        this.rect(x, 14, -28, 3, 3, C.HORSE_MANE); // eye
        // Ear
        this.rect(x, 10, -34, 4, 6, C.HORSE_BODY);
        x.restore();
    }

    drawBandit(x, frame, w, h, state) {
        const C = CONFIG.COLORS;
        const midX = w / 2, baseY = h - 4;
        let legL = 0, legR = 0;
        if (state === 'walk') { legL = Math.sin(frame * 0.785) * 8; legR = -legL; }

        this.rect(x, midX - 10 + legL, baseY - 8, 8, 8, 0x333333);
        this.rect(x, midX + 2 + legR, baseY - 8, 8, 8, 0x333333);
        this.rect(x, midX - 8 + legL, baseY - 24, 6, 16, 0x3B3B3B);
        this.rect(x, midX + 2 + legR, baseY - 24, 6, 16, 0x3B3B3B);
        this.rect(x, midX - 10, baseY - 28, 20, 4, 0x222222);
        this.rect(x, midX - 10, baseY - 46, 20, 18, C.BANDIT_SHIRT);
        if (state === 'shoot') {
            this.rect(x, midX + 10, baseY - 44, 16, 5, C.BANDIT_SHIRT);
            this.rect(x, midX + 26, baseY - 46, 10, 4, 0x333333);
        } else {
            this.rect(x, midX + 9, baseY - 42, 5, 14, C.BANDIT_SHIRT);
        }
        this.rect(x, midX - 14, baseY - 42, 5, 14, C.BANDIT_SHIRT);
        this.rect(x, midX - 6, baseY - 50, 12, 4, C.BANDIT_SCARF);
        this.rect(x, midX - 7, baseY - 64, 14, 14, C.SKIN);
        this.rect(x, midX - 6, baseY - 54, 12, 4, 0x333333); // mask
        this.rect(x, midX - 3, baseY - 60, 2, 2, C.EYES);
        this.rect(x, midX - 14, baseY - 68, 28, 4, C.BANDIT_HAT);
        this.rect(x, midX - 8, baseY - 76, 16, 8, C.BANDIT_HAT);
    }

    drawAnimal(x, frame, w, h, type, state) {
        const baseY = h - 2, midX = w / 2;
        let col, bodyW, bodyH, legH;
        if (type === 'wolf') { col = CONFIG.COLORS.WOLF_BODY; bodyW = 36; bodyH = 16; legH = 16; }
        else if (type === 'bear') { col = CONFIG.COLORS.BEAR_BODY; bodyW = 50; bodyH = 28; legH = 18; }
        else { col = CONFIG.COLORS.COUGAR_BODY; bodyW = 40; bodyH = 16; legH = 16; }

        let legAnim = (state === 'run') ? Math.sin(frame * 0.785) * 10 : 0;
        // Legs
        this.rect(x, midX - bodyW/2 + 4 + legAnim, baseY - legH, 5, legH, col);
        this.rect(x, midX - bodyW/2 + 12 - legAnim, baseY - legH, 5, legH, col);
        this.rect(x, midX + bodyW/2 - 16 + legAnim, baseY - legH, 5, legH, col);
        this.rect(x, midX + bodyW/2 - 8 - legAnim, baseY - legH, 5, legH, col);
        // Body
        this.rect(x, midX - bodyW/2, baseY - legH - bodyH, bodyW, bodyH, col);
        // Head
        let headW = type === 'bear' ? 18 : 14;
        let headH = type === 'bear' ? 16 : 10;
        this.rect(x, midX + bodyW/2 - 2, baseY - legH - bodyH + 2, headW, headH, col);
        // Eyes
        this.rect(x, midX + bodyW/2 + headW - 6, baseY - legH - bodyH + 4, 2, 2, 0xFF0000);
        // Ears
        if (type === 'bear') {
            this.rect(x, midX + bodyW/2 + 2, baseY - legH - bodyH - 4, 5, 5, col);
            this.rect(x, midX + bodyW/2 + 10, baseY - legH - bodyH - 4, 5, 5, col);
        }
        // Tail
        this.rect(x, midX - bodyW/2 - 8, baseY - legH - bodyH + 4, 10, 4, col);
    }

    generateAll() {
        const AW = 48, AH = 80; // Arthur sprite size
        const HW = 96, HH = 72; // Horse sprite size

        // Arthur sprites
        this.makeSheet('arthur_idle', AW, AH, 4, (x, f) => this.drawArthur(x, f, AW, AH, 'idle'));
        this.makeSheet('arthur_walk', AW, AH, 8, (x, f) => this.drawArthur(x, f, AW, AH, 'walk'));
        this.makeSheet('arthur_run', AW, AH, 8, (x, f) => this.drawArthur(x, f, AW, AH, 'run'));
        this.makeSheet('arthur_jump', AW, AH, 4, (x, f) => this.drawArthur(x, f, AW, AH, 'jump'));
        this.makeSheet('arthur_shoot', AW, AH, 4, (x, f) => this.drawArthur(x, f, AW, AH, 'shoot'));
        this.makeSheet('arthur_hit', AW, AH, 2, (x, f) => {
            x.globalAlpha = f === 0 ? 0.7 : 1;
            this.drawArthur(x, f, AW, AH, 'idle');
        });
        this.makeSheet('arthur_death', AW, AH, 6, (x, f) => {
            x.save();
            x.translate(AW/2, AH/2);
            x.rotate(f * 15 * Math.PI / 180);
            x.translate(-AW/2, -AH/2 + f * 4);
            this.drawArthur(x, 0, AW, AH, 'idle');
            x.restore();
        });

        // Horse sprites
        this.makeSheet('horse_idle', HW, HH, 4, (x, f) => this.drawHorse(x, f, HW, HH, 'idle'));
        this.makeSheet('horse_walk', HW, HH, 8, (x, f) => this.drawHorse(x, f, HW, HH, 'walk'));
        this.makeSheet('horse_gallop', HW, HH, 8, (x, f) => this.drawHorse(x, f, HW, HH, 'gallop'));
        this.makeSheet('horse_jump', HW, HH, 4, (x, f) => this.drawHorse(x, f, HW, HH, 'jump'));

        // Bandit sprites
        this.makeSheet('bandit_idle', AW, AH, 4, (x, f) => this.drawBandit(x, f, AW, AH, 'idle'));
        this.makeSheet('bandit_walk', AW, AH, 8, (x, f) => this.drawBandit(x, f, AW, AH, 'walk'));
        this.makeSheet('bandit_shoot', AW, AH, 4, (x, f) => this.drawBandit(x, f, AW, AH, 'shoot'));
        this.makeSheet('bandit_death', AW, AH, 4, (x, f) => {
            x.save(); x.translate(AW/2, AH/2);
            x.rotate(f * 22 * Math.PI / 180);
            x.translate(-AW/2, -AH/2 + f * 5);
            this.drawBandit(x, 0, AW, AH, 'idle'); x.restore();
        });

        // Animals
        const anW = 80, anH = 56;
        ['wolf', 'bear', 'cougar'].forEach(type => {
            this.makeSheet(type + '_idle', anW, anH, 4, (x, f) => this.drawAnimal(x, f, anW, anH, type, 'idle'));
            this.makeSheet(type + '_run', anW, anH, 8, (x, f) => this.drawAnimal(x, f, anW, anH, type, 'run'));
            this.makeSheet(type + '_death', anW, anH, 4, (x, f) => {
                x.save(); x.translate(anW/2, anH/2);
                x.rotate(f * 22 * Math.PI / 180);
                x.translate(-anW/2, -anH/2 + f * 5);
                this.drawAnimal(x, 0, anW, anH, type, 'idle'); x.restore();
            });
        });

        // Bullets
        this.makeTex('bullet', 8, 4, (x) => { x.fillStyle = '#FFD700'; x.fillRect(0, 0, 8, 4); });
        this.makeTex('bullet_enemy', 8, 4, (x) => { x.fillStyle = '#FF4444'; x.fillRect(0, 0, 8, 4); });
        this.makeTex('dynamite_proj', 12, 12, (x) => {
            x.fillStyle = '#CC3333'; x.fillRect(2, 2, 8, 10);
            x.fillStyle = '#FFD700'; x.fillRect(4, 0, 4, 3);
        });

        // Explosion
        this.makeSheet('explosion', 64, 64, 6, (x, f) => {
            const r = 10 + f * 8;
            const alpha = 1 - f * 0.15;
            x.globalAlpha = alpha;
            x.fillStyle = '#FF6600'; x.beginPath(); x.arc(32, 32, r, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#FFAA00'; x.beginPath(); x.arc(32, 32, r * 0.6, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#FFFF00'; x.beginPath(); x.arc(32, 32, r * 0.3, 0, Math.PI * 2); x.fill();
        });

        // Items
        this.makeTex('coin', 16, 16, (x) => {
            x.fillStyle = '#FFD700'; x.beginPath(); x.arc(8, 8, 7, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#DAA520'; x.font = '10px serif'; x.fillText('$', 4, 12);
        });
        this.makeTex('herb', 16, 16, (x) => {
            x.fillStyle = '#228B22'; x.fillRect(6, 4, 4, 10);
            x.fillStyle = '#32CD32';
            x.beginPath(); x.arc(8, 4, 5, 0, Math.PI * 2); x.fill();
        });
        this.makeTex('heart_item', 16, 16, (x) => {
            x.fillStyle = '#FF1744';
            x.beginPath(); x.arc(5, 6, 4, 0, Math.PI * 2); x.fill();
            x.beginPath(); x.arc(11, 6, 4, 0, Math.PI * 2); x.fill();
            x.beginPath(); x.moveTo(1, 8); x.lineTo(8, 15); x.lineTo(15, 8); x.fill();
        });
        this.makeTex('ammo_box', 18, 14, (x) => {
            x.fillStyle = '#8B5E2E'; x.fillRect(0, 0, 18, 14);
            x.fillStyle = '#C9A84C'; x.fillRect(2, 2, 14, 2);
            x.fillStyle = '#FFD700'; x.font = '8px serif'; x.fillText('A', 5, 12);
        });
        this.makeTex('weapon_pickup', 20, 12, (x) => {
            x.fillStyle = '#555'; x.fillRect(0, 4, 16, 4);
            x.fillStyle = '#444'; x.fillRect(12, 2, 4, 8);
            x.fillStyle = '#FF0'; x.fillRect(0, 3, 2, 2);
        });

        // Environment tiles
        this.makeTex('ground_plains', 48, 48, (x) => {
            x.fillStyle = '#8B7355'; x.fillRect(0, 0, 48, 48);
            x.fillStyle = '#6B8E23'; x.fillRect(0, 0, 48, 6);
            x.fillStyle = '#7A6645'; x.fillRect(10, 20, 8, 4); x.fillRect(30, 35, 6, 3);
        });
        this.makeTex('ground_forest', 48, 48, (x) => {
            x.fillStyle = '#5C4033'; x.fillRect(0, 0, 48, 48);
            x.fillStyle = '#2E5E1A'; x.fillRect(0, 0, 48, 6);
            x.fillStyle = '#4A3020'; x.fillRect(8, 18, 10, 5); x.fillRect(28, 30, 8, 4);
        });
        this.makeTex('ground_city', 48, 48, (x) => {
            x.fillStyle = '#A0896E'; x.fillRect(0, 0, 48, 48);
            x.fillStyle = '#8B7355'; x.fillRect(0, 0, 48, 4);
            x.fillStyle = '#907860'; x.fillRect(12, 12, 24, 3);
        });
        this.makeTex('ground_snow', 48, 48, (x) => {
            x.fillStyle = '#D3D3D3'; x.fillRect(0, 0, 48, 48);
            x.fillStyle = '#E8E8E8'; x.fillRect(0, 0, 48, 6);
            x.fillStyle = '#C0C0C0'; x.fillRect(10, 22, 10, 3); x.fillRect(32, 34, 8, 3);
        });

        // Obstacles
        this.makeTex('rock', 48, 36, (x) => {
            x.fillStyle = '#777'; x.beginPath();
            x.moveTo(4, 36); x.lineTo(12, 4); x.lineTo(36, 2); x.lineTo(44, 36); x.fill();
            x.fillStyle = '#888'; x.beginPath();
            x.moveTo(12, 4); x.lineTo(24, 8); x.lineTo(36, 2); x.lineTo(24, 0); x.fill();
        });
        this.makeTex('log', 64, 24, (x) => {
            x.fillStyle = '#6B4423'; x.fillRect(0, 6, 64, 16);
            x.fillStyle = '#5C3D1E';
            x.beginPath(); x.arc(0, 14, 10, 0, Math.PI * 2); x.fill();
            x.beginPath(); x.arc(64, 14, 10, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#8B6914';
            x.beginPath(); x.arc(64, 14, 7, 0, Math.PI * 2); x.fill();
        });
        this.makeTex('barrel', 28, 36, (x) => {
            x.fillStyle = '#8B5E2E'; x.fillRect(2, 4, 24, 28);
            x.fillStyle = '#666';
            x.fillRect(0, 6, 28, 3); x.fillRect(0, 26, 28, 3);
            x.fillStyle = '#7A4E1E';
            x.beginPath(); x.ellipse(14, 4, 12, 4, 0, 0, Math.PI * 2); x.fill();
        });
        this.makeTex('fence', 48, 48, (x) => {
            x.fillStyle = '#8B6914';
            x.fillRect(4, 10, 4, 38); x.fillRect(40, 10, 4, 38);
            x.fillRect(0, 16, 48, 4); x.fillRect(0, 32, 48, 4);
            x.fillStyle = '#7A5A10';
            x.fillRect(4, 6, 4, 6); x.fillRect(40, 6, 4, 6);
        });

        // Phase end marker
        this.makeTex('phase_end', 48, 96, (x) => {
            x.fillStyle = '#8B5E2E'; x.fillRect(20, 0, 8, 96);
            x.fillStyle = '#C9A84C'; x.fillRect(4, 4, 40, 28);
            x.fillStyle = '#3B2A1A'; x.font = 'bold 10px sans-serif';
            x.fillText('EXIT', 8, 22);
        });

        // Checkpoint flag
        this.makeTex('checkpoint', 24, 48, (x) => {
            x.fillStyle = '#8B5E2E'; x.fillRect(2, 0, 4, 48);
            x.fillStyle = '#CC3333'; x.fillRect(6, 2, 16, 12);
            x.fillStyle = '#FFD700'; x.font = '8px sans-serif'; x.fillText('✓', 9, 12);
        });

        // Particle
        this.makeTex('particle', 4, 4, (x) => {
            x.fillStyle = '#FFF'; x.fillRect(0, 0, 4, 4);
        });
    }
}
