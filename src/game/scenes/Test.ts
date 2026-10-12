import Phaser from 'phaser';
import { Humanoid, KAEL } from '../anims/humanoid';
import { EnemyDirector } from '../actors/EnemyDirector';
import { Loot } from '../actors/Loot';
import type { Police } from '../actors/Police';
import { Waves } from '../actors/Waves';
import { bus, type BulletType } from '../events';
import { WIDTH, GROUND_Y, SIDEWALK_DEPTH } from '../screen';
import { LEVEL_1 } from '../levels/level_1';
import { CameraRig } from '../world/CameraRig';
import { Parallax } from '../world/Parallax';
import { Props, addGround } from '../world/Props';
import { DayCycle, ambient, lerpColors, smoothstep } from '../world/DayCycle';
import { Sky } from '../world/Sky';
import { Street } from '../world/Street';

// Valores provisórios [TESTE]: só servem para a cena de teste.
const WALK_SPEED = 120; // px/s
/** Velocidade para a qual a animação de andar foi feita: acima disso ela acelera junto, para o pé não escorregar. */
const WALK_ANIM_BASE = 90;
const START_AMMO = { lethal: 12, nonLethal: 6 };
const MORALE_MAX = 10;
const LIFE_MAX = 100;
const SHOT_RANGE = 900;
const DAY_CYCLE_MS = 8 * 60 * 1000; // entardecer até a noite
const CLOCK_STEP = 0.1; // quanto [ e ] mexem no relógio (fração do ciclo)
/** Kael atingido: pisca em vermelho por este tempo e a tela treme de leve. */
const HURT_FLASH_MS = 220;
const HURT_TINT = 0xff4040;
const HURT_SHAKE = { ms: 90, intensity: 0.004 };

/** Silhueta distante: anda a 0,3 da câmera e desce até a calçada, para nada flutuar nos vãos. */
const SKYLINE_FACTOR = 0.3;
const SKYLINE_BOTTOM = GROUND_Y - SIDEWALK_DEPTH;
/** Silhueta: tint do entardecer à noite (fica para trás, então escurece mais que a rua). */
const SKYLINE_TINT = [0xffffff, 0xd0a0c0, 0x7a6aa0, 0x404070];

const CONTROLS = [
  'Cena de teste.',
  'A/D ou ←/→: andar. A fase tem 4 telas; a câmera segue o Kael.',
  '1: sacar ou guardar a arma (começa sem arma).',
  'Com a arma: botão direito do mouse mira (segure), botão esquerdo atira.',
  'Q ou roda do mouse: troca entre bala letal e não letal.',
  'Perto de cada barricada a câmera trava e os policiais entram em ondas.',
  'O policial mira (aviso) e atira. Nocauteado (bala não letal), solta uma caixa de munição: passe por cima.',
  'F1: mostra a aparência de cada policial e a seed (?seed=... na URL repete o sorteio).',
  'K: testa a morte do Kael. R: reinicia. Esc: pausa. C: mostra a zona morta da câmera.',
  '[ e ]: volta ou avança o relógio (do entardecer à noite em 8 minutos).',
].join('\n');

/** raising: levantando a arma; aimed: segurando a mira; lowering: abaixando. */
type KaelMode = 'free' | 'raising' | 'aimed' | 'shooting' | 'lowering' | 'dead';

export class Test extends Phaser.Scene {
  private kael!: Humanoid;
  private waves!: Waves;
  private loot!: Loot;
  private hurtFlash = 0;
  private keys!: Record<'left' | 'right' | 'a' | 'd', Phaser.Input.Keyboard.Key>;
  private camRig!: CameraRig;
  private parallax!: Parallax;
  private cycle!: DayCycle;
  private sky!: Sky;
  private street!: Street;
  private props!: Props;
  private skyline!: Phaser.GameObjects.TileSprite;
  private skylineLights!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private clockText!: Phaser.GameObjects.Text;

  private mode: KaelMode = 'free';
  private armed = false;
  private aimHeld = false;
  private pendingShot = false;
  private ammo = { ...START_AMMO };
  private bullet: BulletType = 'lethal';
  private life = LIFE_MAX;
  private morale = MORALE_MAX;

  constructor() {
    super('Test');
  }

  create(): void {
    this.mode = 'free';
    this.armed = false;
    this.aimHeld = false;
    this.pendingShot = false;
    this.ammo = { ...START_AMMO };
    this.bullet = 'lethal';
    this.life = LIFE_MAX;
    this.morale = MORALE_MAX;
    this.hurtFlash = 0;

    this.buildWorld();

    this.kael = new Humanoid(this, LEVEL_1.kaelX, GROUND_Y, KAEL, 'idle');
    this.camRig = new CameraRig(this, this.kael, LEVEL_1.width);
    // seed das aparências no registro: ?seed=... na URL repete a mesma sequência
    const seed = new URLSearchParams(window.location.search).get('seed') ?? Math.random().toString(36).slice(2, 8);
    this.registry.set('enemySeed', seed);
    this.waves = new Waves(this, LEVEL_1, GROUND_Y, this.camRig, new EnemyDirector(seed));
    this.waves.onFire = (cop) => this.onCopFire(cop);
    this.loot = new Loot(this, GROUND_Y);
    // o fundo anda depois que a câmera calcula a posição do quadro, senão fica um quadro atrasado
    const cam = this.cameras.main;
    cam.on(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE, () => this.parallax.update(cam));
    this.parallax.update(cam);
    this.kael.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.onKaelAnimDone());

    this.setupInput();

    const off = [
      bus.on('game:pause', () => this.scene.pause()),
      bus.on('game:resume', () => this.scene.resume()),
      bus.on('game:restart', () => this.scene.restart()),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      off.forEach((f) => f());
      cam.off(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE);
    });

    this.emitHud();
    if (!this.registry.get('controlsShown')) {
      this.registry.set('controlsShown', true);
      bus.emit('dialog:open', { text: CONTROLS });
    }
  }

  /** Céu, silhueta distante, chão, fachadas, postes e objetos de cena, e o relógio do entardecer à noite. */
  private buildWorld(): void {
    this.cycle = new DayCycle(DAY_CYCLE_MS);
    this.sky = new Sky(this);
    this.parallax = new Parallax(this);
    const skyH = this.textures.get('skyline_dusk').getSourceImage().height;
    this.skyline = this.parallax.add('skyline_dusk', SKYLINE_BOTTOM - skyH, SKYLINE_FACTOR);
    this.skylineLights = this.parallax.add('skyline_lights', SKYLINE_BOTTOM - skyH, SKYLINE_FACTOR);
    this.ground = addGround(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH);
    this.street = new Street(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH, GROUND_Y);
    this.props = new Props(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH, GROUND_Y);
    this.clockText = this.add
      .text(this.scale.width - 10, 10, '', { fontFamily: 'monospace', fontSize: '14px', color: '#e6e9f0' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);
    for (let x = 0; x < LEVEL_1.width; x += WIDTH) {
      this.add
        .text(x + 8, GROUND_Y + 22, `tela ${x / WIDTH + 1}`, { fontFamily: 'monospace', fontSize: '12px', color: '#cfd6e4' })
        .setAlpha(0.6);
    }
  }

  private setupInput(): void {
    const kb = this.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      a: kb.addKey(K.A),
      d: kb.addKey(K.D),
    };
    kb.on('keydown-ONE', () => this.toggleWeapon());
    kb.on('keydown-Q', () => this.switchBullet());
    kb.on('keydown-K', () => this.killKael());
    kb.addCapture('F1');
    kb.on('keydown-F1', () => this.waves.toggleDebug());
    kb.on('keydown-R', () => this.scene.restart());
    kb.on('keydown-C', () => this.camRig.toggleDebug(this));
    // pela tecla digitada, não pelo código: no teclado ABNT o [ fica em outro lugar
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.key === '[') this.cycle.shift(-CLOCK_STEP);
      if (e.key === ']') this.cycle.shift(CLOCK_STEP);
    });

    this.input.mouse?.disableContextMenu();
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (p.button === 2) this.onAimPressed();
      if (p.button === 0) this.onFirePressed();
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, (p: Phaser.Input.Pointer) => {
      if (p.button === 2) this.onAimReleased();
    });
    this.input.on(Phaser.Input.Events.POINTER_WHEEL, () => this.switchBullet());
  }

  update(_time: number, delta: number): void {
    this.camRig.update(delta);
    this.updateTime(delta);
    const alive = this.mode !== 'dead';
    if (!alive) {
      this.waves.update(delta, this.kael.x, false);
      return;
    }

    this.kael.anims.timeScale = 1;
    if (this.mode === 'free' || this.mode === 'lowering') {
      const dir = this.moveInput();
      if (dir !== 0) {
        this.mode = 'free';
        this.kael.face(dir);
        this.kael.x = Phaser.Math.Clamp(this.kael.x + dir * WALK_SPEED * (delta / 1000), 40, LEVEL_1.width - 40);
        this.kael.act(this.armed ? 'walk_gun' : 'walk');
        this.kael.anims.timeScale = WALK_SPEED / WALK_ANIM_BASE;
      } else if (this.mode === 'free') {
        this.kael.act(this.armed ? 'idle_gun' : 'idle');
      }
    } else {
      // mirando ou atirando: vira para o lado do mouse. Converte a posição da tela para o mundo
      // a cada quadro, porque a câmera anda mesmo com o mouse parado.
      const p = this.input.activePointer;
      const px = this.cameras.main.getWorldPoint(p.x, p.y).x;
      if (Math.abs(px - this.kael.x) > 4) this.kael.face(px < this.kael.x ? -1 : 1);
    }

    // arena: o Kael fica dentro da tela travada
    const bounds = this.waves.bounds;
    if (bounds) this.kael.x = Phaser.Math.Clamp(this.kael.x, ...bounds);
    this.waves.update(delta, this.kael.x);
    for (const { type, amount } of this.loot.update(this.kael.x, true)) {
      this.ammo[type] += amount;
      this.emitAmmo();
    }
  }

  /** Relógio do entardecer à noite: céu, fundo, luzes e a luz ambiente nos personagens. */
  private updateTime(delta: number): void {
    this.cycle.update(delta);
    const t = this.cycle.t;
    const tint = ambient(t);
    this.sky.update(t);
    this.street.update(t);
    this.props.update(t, delta);
    this.skyline.setTint(lerpColors(SKYLINE_TINT, t));
    this.skylineLights.setAlpha(smoothstep(0.45, 0.85, t));
    this.ground.setTint(tint);
    this.hurtFlash = Math.max(0, this.hurtFlash - delta);
    this.kael.setTint(this.hurtFlash > 0 ? HURT_TINT : tint);
    this.waves.setTint(tint);
    // canto direito acompanha a largura da janela
    this.clockText.setText(this.cycle.clock()).setX(this.scale.width - 10);
  }

  private moveInput(): -1 | 0 | 1 {
    const left = this.keys.left.isDown || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;
    return left === right ? 0 : left ? -1 : 1;
  }

  // ---------- arma ----------

  /** Tecla 1: saca ou guarda. Só com o Kael livre (não mirando, não atirando). */
  private toggleWeapon(): void {
    if (this.mode !== 'free') return;
    this.armed = !this.armed;
    const walking = this.moveInput() !== 0;
    this.kael.act(this.armed ? (walking ? 'walk_gun' : 'idle_gun') : walking ? 'walk' : 'idle');
    bus.emit('hud:weapon', { armed: this.armed });
  }

  private onAimPressed(): void {
    this.aimHeld = true;
    if (!this.armed || this.mode === 'dead') return;
    if (this.mode === 'free' || this.mode === 'lowering') this.raise();
  }

  private onAimReleased(): void {
    this.aimHeld = false;
    if (this.mode === 'aimed') this.lower();
  }

  /** Clique esquerdo: atira. Se não estiver mirando, levanta a arma e atira assim que a mira termina. */
  private onFirePressed(): void {
    if (!this.armed || this.mode === 'dead' || this.mode === 'shooting') return;
    if (this.mode === 'aimed') return this.shoot();
    this.pendingShot = true;
    if (this.mode !== 'raising') this.raise();
  }

  private raise(): void {
    this.mode = 'raising';
    this.kael.act('aim_gun', { restart: true });
  }

  private lower(): void {
    this.mode = 'lowering';
    this.kael.act('aim_gun', { reverse: true });
  }

  private holdAim(): void {
    this.mode = 'aimed';
    this.kael.hold('aim_gun', this.kael.frameCount('aim_gun') - 1);
  }

  private shoot(): void {
    if (this.ammo[this.bullet] <= 0) {
      // sem bala do tipo escolhido: não atira
      if (!this.aimHeld) this.lower();
      return;
    }
    this.ammo[this.bullet] -= 1;
    this.emitAmmo();
    this.mode = 'shooting';
    this.kael.act('shoot_gun', { restart: true });

    // tiro instantâneo (hitscan): acerta o policial em pé mais perto, na direção em que o Kael olha
    const target = this.waves.cops
      .filter((c) => c.alive && Math.sign(c.x - this.kael.x) === this.kael.facing && Math.abs(c.x - this.kael.x) <= SHOT_RANGE)
      .sort((a, b) => Math.abs(a.x - this.kael.x) - Math.abs(b.x - this.kael.x))[0];
    if (target) {
      const type = this.bullet;
      this.time.delayedCall(60, () => {
        if (!target.active) return;
        const result = target.hit(type);
        if (result === 'death') {
          this.morale = Math.max(0, this.morale - 1);
          bus.emit('hud:morale', { current: this.morale, max: MORALE_MAX });
        }
        if (result === 'knockout') this.loot.drop(target.x);
      });
    }
  }

  private onKaelAnimDone(): void {
    switch (this.mode) {
      case 'raising':
        this.holdAim();
        if (this.pendingShot) {
          this.pendingShot = false;
          this.shoot();
        } else if (!this.aimHeld) this.lower();
        break;
      case 'shooting':
        this.holdAim();
        if (!this.aimHeld) this.lower();
        break;
      case 'lowering':
        this.mode = 'free';
        break;
    }
  }

  private switchBullet(): void {
    this.bullet = this.bullet === 'lethal' ? 'nonLethal' : 'lethal';
    this.emitAmmo();
  }

  /** Tiro do policial: instantâneo, com chance de errar. O dano sai junto com o clarão do shoot_gun. */
  private onCopFire(cop: Police): void {
    const { damage, hitChance } = cop.archetype;
    this.time.delayedCall(60, () => {
      if (this.mode === 'dead' || Math.random() >= hitChance) return;
      this.life = Math.max(0, this.life - damage);
      bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
      this.hurtFlash = HURT_FLASH_MS;
      this.cameras.main.shake(HURT_SHAKE.ms, HURT_SHAKE.intensity);
      if (this.life === 0) this.killKael();
    });
  }

  private killKael(): void {
    if (this.mode === 'dead') return;
    this.mode = 'dead';
    this.life = 0;
    bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
    this.kael.act('death');
    this.kael.anims.timeScale = 1;
    // derrota ainda EM ABERTO (decisions.md, item 14): na cena de teste, só reinicia
    this.add
      .text(this.scale.width / 2, 200, 'O Kael caiu. R reinicia.', { fontFamily: 'monospace', fontSize: '18px', color: '#f4ebe8', backgroundColor: '#000a' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setPadding(10, 6);
  }

  // ---------- HUD ----------

  private emitAmmo(): void {
    bus.emit('hud:ammo', { ...this.ammo, selected: this.bullet });
  }

  private emitHud(): void {
    this.emitAmmo();
    bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
    bus.emit('hud:morale', { current: this.morale, max: MORALE_MAX });
    bus.emit('hud:weapon', { armed: this.armed });
  }
}
