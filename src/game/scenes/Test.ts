import Phaser from 'phaser';
import { ADRIANA, HUMANOID_STEP, Humanoid, JUMP_PHASES, KAEL, jumpMs, type AnimName } from '../anims/humanoid';
import { Cutscene } from '../cutscene/Cutscene';
import { endingSteps } from '../cutscene/ending';
import { openingSteps } from '../cutscene/opening';
import { t } from '../../i18n';
import { VOLUME, playAt, playStep, startMusic } from '../audio/Sfx';
import { Blood } from '../actors/Blood';
import { Bullets, type BodyBox, type HitPoint } from '../actors/Bullets';
import { BossFight } from '../actors/BossFight';
import { EnemyDirector } from '../actors/EnemyDirector';
import { KaelHabits, type Gunner } from '../actors/Gunner';
import { DEATH_DROP_CHANCE, Loot } from '../actors/Loot';
import { MERCENARY_TONES, Mercenary } from '../actors/Mercenary';
import { Waves } from '../actors/Waves';
import { bus, type BulletType } from '../events';
import { WIDTH, HEIGHT, GROUND_Y, SIDEWALK_DEPTH } from '../screen';
import { LEVEL_1 } from '../levels/level_1';
import { CameraRig } from '../world/CameraRig';
import { Parallax } from '../world/Parallax';
import { Props, addGround } from '../world/Props';
import { GoArrow } from '../world/GoArrow';
import { Shadows } from '../world/Shadows';
import { Rain } from '../world/Rain';
import { DayCycle, ambient, lerpColors, smoothstep } from '../world/DayCycle';
import { Sky } from '../world/Sky';
import { Street } from '../world/Street';

// Valores provisórios [TESTE]: só servem para a cena de teste.
const WALK_SPEED = 120; // px/s
/** Velocidade para a qual a animação de andar foi feita: acima disso ela acelera junto, para o pé não escorregar. */
const WALK_ANIM_BASE = 90;
/** Correndo (Shift). O pé de apoio do run recua cerca de 15 px por quadro de 72 ms: ~200 px/s. */
const RUN_SPEED = 200; // px/s
/** Munição total do começo; o pente sai cheio de balas letais tiradas daqui. */
const START_AMMO = { lethal: 12, nonLethal: 6 };
const MAG_SIZE = 8;
/** Sem atirar e sem segurar o botão direito por este tempo, o Kael abaixa a arma. */
const AIM_IDLE_MS = 1200;
/** Intervalo mínimo entre tiros: o recuo do shoot_gun (quadros 0 a 3). Clique antes disso fica guardado. */
const FIRE_MIN_MS = 270;
/** Recarga [TESTE]: dura o som (colt_reload_fast, 1,21 s), igual à reload_gun do Kael (RELOAD_FAST_MS). Era 2,08 s. */
const RELOAD_MS = 1210;
const MORALE_MAX = 10;
const LIFE_MAX = 100;
const SHOT_RANGE = 900;
const DAY_CYCLE_MS = 3 * 60 * 1000; // entardecer até a noite [TESTE] (era 8 min)
const CLOCK_STEP = 0.1; // quanto [ e ] mexem no relógio (fração do ciclo)
/** Kael atingido: pisca em vermelho por este tempo e a tela treme de leve. */
const HURT_FLASH_MS = 220;
const HURT_TINT = 0xff4040;
const HURT_SHAKE = { ms: 90, intensity: 0.004 };
/** Pulo para a frente (1,5 m ≈ 85 px; o Kael tem ~100 px). Correndo vai mais longe. Não muda de direção no ar. */
const JUMP_DIST = 180;
const JUMP_DIST_RUN = 240;
const JUMP_HEIGHT = 85;
/** Caixa do corpo para as balas (altura a partir dos pés): em pé, encolhido no ar e agachado; meia largura.
 *  Os policiais usam as mesmas (o ajoelhado deles é o mesmo truque do tronco descido 18 px). */
const BODY_H = 100;
const BODY_H_AIR = 80;
const BODY_H_CROUCH = 86; // topo da cabeça ajoelhado (y 35 do quadro, chão 121)
const BODY_HALF_W = 12;
/** Bala do Kael: sai do cano e voa reta para o lado em que ele olha; ajoelhado, o tronco desce 18 px. */
const KAEL_MUZZLE = { x: 36, h: 91 };
const KAEL_MUZZLE_CROUCH = { x: 36, h: 73 };
/** Trocar de pose mirando (abaixar a arma, agachar ou levantar, subir a arma) toca as animações mais rápido. */
const POSTURE_SWAP_SPEED = 2;
const KAEL_BULLET = { speed: 1400, maxDist: SHOT_RANGE };
/** Tiro do inimigo em pé: sai do cano (kit.muzzle) e vai alto,
 *  na altura do pescoço do Kael, com uma variação. Passa por cima do Kael ajoelhado (86 px); o pulo não sobe
 *  o bastante para passar por baixo dela. O tiro torto (1 - hitChance) passa por cima da cabeça.
 *  A bala baixa (que o pulo desvia) vem do policial agachado, na fase 3. */
const COP_AIM_H = 93; // [TESTE]
const COP_AIM_SPREAD = 3;
/** Inimigo ajoelhado: a bala sai do cano mais baixo (kit.muzzleCrouch) e chega baixa no Kael (64 px). Acerta em pé e
 *  ajoelhado; pulando, passa por baixo dele na maior parte do voo. */
const COP_LOW_H = 64; // [TESTE]
const COP_WILD_H: [number, number] = [112, 126];
const COP_BULLET = { speed: 650, maxDist: 1100 };

/** Combo sem arma (botão direito): jab, direto e chute. Cada golpe tem o quadro do acerto, o quadro depois do
 *  qual o próximo emenda (clique guardado) e o quadro em que o próximo começa (pula a mão baixa).
 *  Os quadros vêm de tools/build_melee.py (CHAIN_OUT, CHAIN_IN). O chute nocauteia; os socos só dão o tranco. */
const COMBO: { anim: AnimName; hit: number; chainOut: number; chainIn: number }[] = [
  { anim: 'punch_1', hit: 3, chainOut: 3, chainIn: 0 },
  { anim: 'punch_2', hit: 4, chainOut: 5, chainIn: 0 },
  { anim: 'kick', hit: 4, chainOut: Infinity, chainIn: 1 },
];
/** Alcance do golpe à frente do Kael até a borda do corpo do policial; altura do acerto (estrelinha). */
const MELEE_REACH = 48; // [TESTE]
const MELEE_HIT_H = { punch: 88, kick: 84 };
/** Estrelinha de impacto: cores de efeito, fora da paleta. */
const IMPACT_MS = 200;
const IMPACT_COLORS = { core: 0xffffff, rim: 0xffd84a };

/** Adriana presa: fica esta distância à frente do mercenário que a segura (a mão dele no pulso dela). */
const HOLD_DX = 55; // [TESTE]
/** Final triste: o mercenário caído atira de perto do chão; a bala mira o peito do Kael. */
const LAST_SHOT = { muzzleH: 14, aimH: 60, ahead: 30 }; // [TESTE]

/** Sangue: gotas no ar na frente dos personagens; quem leva tiro pinga do ponto do acerto (altura sobre os pés). */
const BLOOD_DEPTH = 3;
/** Chuva: camada da frente por cima do carro e da faixa da frente (5), abaixo do relógio (10). Respingos da calçada até a rua. */
const RAIN_DEPTH = 6;
const RAIN_SPLASH_BAND: [number, number] = [GROUND_Y - SIDEWALK_DEPTH + 4, HEIGHT - 4];

/** Silhueta distante: anda a 0,3 da câmera e desce até a calçada, para nada flutuar nos vãos. */
const SKYLINE_FACTOR = 0.3;
const SKYLINE_BOTTOM = GROUND_Y - SIDEWALK_DEPTH;
/** Silhueta: tint do entardecer à noite (fica para trás, então escurece mais que a rua). */
const SKYLINE_TINT = [0xffffff, 0xd0a0c0, 0x7a6aa0, 0x404070];

/** raising: levantando a arma; aimed: segurando a mira; lowering: abaixando; reloading: parado, recarregando;
 *  crouching: abaixando ou levantando (a pose fica em `crouched`); melee: golpeando no combo, parado. */
type KaelMode = 'free' | 'raising' | 'aimed' | 'shooting' | 'lowering' | 'reloading' | 'jumping' | 'crouching' | 'melee' | 'dead';

export class Test extends Phaser.Scene {
  private kael!: Humanoid;
  private waves!: Waves;
  private loot!: Loot;
  /** Parados no fim da rua, virados para o Kael, até a luta (BossFight). */
  private mercenaries: Mercenary[] = [];
  private fight!: BossFight;
  private goArrow!: GoArrow;
  /** Presa pelo braço no fim da rua, virada para o Kael. */
  private adriana!: Humanoid;
  /** Balas dos policiais (miram o Kael) e do Kael (miram os policiais em pé). */
  private copBullets!: Bullets<number>;
  private kaelBullets!: Bullets<BulletType>;
  /** Pulo em curso: tempo desde o começo, de onde saiu, direção e distância. */
  private jump = { t: 0, fromX: 0, dir: 1 as 1 | -1, dist: JUMP_DIST };
  private jumpKeys!: Phaser.Input.Keyboard.Key[];
  private crouchKeys!: Phaser.Input.Keyboard.Key[];
  /** Agachado (ou abaixando). Levantando, já volta a false. */
  private crouched = false;
  /** O que o Kael costuma fazer para fugir do tiro (os policiais leem isso). */
  private habits = new KaelHabits();
  /** Trocando de pose com a mira: as animações da troca vão a POSTURE_SWAP_SPEED. */
  private postureSwap = false;
  private hurtFlash = 0;
  private keys!: Record<'left' | 'right' | 'a' | 'd' | 'shift', Phaser.Input.Keyboard.Key>;
  private running = false;
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
  private blood!: Blood;
  private rain!: Rain;

  private mode: KaelMode = 'free';
  private armed = false;
  private aimHeld = false;
  private pendingShot = false;
  /** Reserva de cada tipo, fora do pente. O pente tem sempre o tipo selecionado (`bullet`). */
  private reserve = { ...START_AMMO };
  private mag = 0;
  private bullet: BulletType = 'lethal';
  /** Tempo mirando sem atirar até abaixar a arma (só sem o botão direito). */
  private aimIdle = 0;
  private lastShotAt = 0;
  private reloadTimer?: Phaser.Time.TimerEvent;
  private reloadSound?: Phaser.Sound.BaseSound;
  private life = LIFE_MAX;
  private morale = MORALE_MAX;
  /** Golpe do combo em curso (índice em COMBO), clique guardado para o próximo e se o golpe já acertou. */
  private combo = { step: 0, queued: false, landed: false };

  constructor() {
    super('Test');
  }

  create(): void {
    this.mode = 'free';
    this.armed = false;
    this.aimHeld = false;
    this.pendingShot = false;
    this.reserve = { ...START_AMMO };
    this.bullet = 'lethal';
    this.mag = Math.min(MAG_SIZE, this.reserve.lethal);
    this.reserve.lethal -= this.mag;
    this.aimIdle = 0;
    this.lastShotAt = 0;
    this.reloadTimer = undefined;
    this.reloadSound = undefined;
    this.life = LIFE_MAX;
    this.morale = MORALE_MAX;
    this.hurtFlash = 0;
    this.crouched = false;
    this.habits = new KaelHabits();
    this.postureSwap = false;
    this.combo = { step: 0, queued: false, landed: false };

    // seed das aparências e da chuva no registro: ?seed=... na URL repete a mesma jogada
    const seed = new URLSearchParams(window.location.search).get('seed') ?? Math.random().toString(36).slice(2, 8);
    this.registry.set('enemySeed', seed);
    this.buildWorld(seed);

    const boss = LEVEL_1.boss;
    // a Adriana vem antes: o mercenário que a segura fica por cima, com a mão no pulso dela
    this.adriana = new Humanoid(this, boss.mercenaries[boss.holder] - HOLD_DX, GROUND_Y, ADRIANA, 'held');
    this.adriana.face(-1);
    this.mercenaries = boss.mercenaries.map((x, i) => {
      const m = new Mercenary(this, x, GROUND_Y, MERCENARY_TONES[i % MERCENARY_TONES.length], i === boss.holder ? 'hold' : 'idle_rifle');
      m.face(-1);
      return m;
    });
    this.kael = new Humanoid(this, LEVEL_1.kaelX, GROUND_Y, KAEL, 'idle');
    this.camRig = new CameraRig(this, this.kael, LEVEL_1.width);
    this.waves = new Waves(this, LEVEL_1, GROUND_Y, this.camRig, new EnemyDirector(seed));
    this.waves.onFire = (cop) => this.onCopFire(cop);
    this.goArrow = new GoArrow(this);
    this.waves.onCleared = () => this.goArrow.show(this.kael.x);
    this.fight = new BossFight(this, LEVEL_1, this.camRig, this.mercenaries, this.adriana);
    this.fight.onFire = (m) => this.onCopFire(m);
    this.fight.onWon = () => this.playEnding();
    this.loot = new Loot(this, GROUND_Y);
    this.copBullets = new Bullets(this, 2, GROUND_Y, COP_BULLET);
    this.kaelBullets = new Bullets(this, 2, GROUND_Y, KAEL_BULLET);
    // o fundo anda depois que a câmera calcula a posição do quadro, senão fica um quadro atrasado
    const cam = this.cameras.main;
    cam.on(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE, () => this.parallax.update(cam));
    this.parallax.update(cam);
    this.kael.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.onKaelAnimDone());
    this.kael.on(Phaser.Animations.Events.ANIMATION_UPDATE, (_a: Phaser.Animations.Animation, f: Phaser.Animations.AnimationFrame) =>
      this.onKaelFrame(f.index - 1),
    );
    this.kael.on(HUMANOID_STEP, () => playStep(this, this.running ? 'run' : 'walk', this.kael.x, VOLUME.kaelStep));

    this.setupInput();

    const off = [
      // o som não para com a cena: música e sons em curso pausam junto
      bus.on('game:pause', () => {
        this.scene.pause();
        this.sound.pauseAll();
      }),
      bus.on('game:resume', () => {
        // a tecla que fechou o diálogo ou a pausa (Espaço, Enter) não vale para o jogo
        this.input.keyboard?.resetKeys();
        this.scene.resume();
        this.sound.resumeAll();
      }),
      bus.on('game:restart', () => this.scene.restart()),
    ];
    // reiniciar a cena dá SHUTDOWN; voltar ao título destrói o jogo (DESTROY): nos dois, o bus solta a cena
    const cleanup = () => {
      this.events.off(Phaser.Scenes.Events.SHUTDOWN, cleanup);
      this.events.off(Phaser.Scenes.Events.DESTROY, cleanup);
      off.forEach((f) => f());
      this.reloadSound?.stop();
      cam.off(Phaser.Cameras.Scene2D.Events.FOLLOW_UPDATE);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    this.emitHud();
    // a abertura toca uma vez por jogo: reiniciar a fase vai direto ao jogo
    if (this.registry.get('openingPlayed')) this.begin();
    else {
      this.registry.set('openingPlayed', true);
      this.playOpening();
    }
  }

  /** Cutscene de abertura: o Kael fica parado e sem controle até ela acabar (ou o Esc pular). */
  private playOpening(): void {
    this.setControls(false);
    const xs = LEVEL_1.boss.mercenaries;
    const arenaX = (Math.min(...xs) + Math.max(...xs)) / 2;
    void new Cutscene(this, this.camRig).play(openingSteps(arenaX, this.adriana), () => {
      this.adriana.act('held');
      this.setControls(true);
      this.begin();
    });
  }

  /** Os três mercenários caíram: final pela índole (≥ 50% feliz). Sem controle até voltar ao título. */
  private playEnding(): void {
    if (this.mode === 'dead') return;
    this.setControls(false);
    this.aimHeld = false;
    this.pendingShot = false;
    if (this.mode === 'free') this.kael.face(this.adriana.x < this.kael.x ? -1 : 1);
    const steps = endingSteps({
      kael: this.kael,
      adriana: this.adriana,
      happy: this.morale >= MORALE_MAX / 2,
      lastShot: () => this.lastShot(),
      quietRain: (factor, ms) => this.rain.quiet(factor, ms),
    });
    void new Cutscene(this, this.camRig).play(steps, () => bus.emit('game:ended'));
  }

  /** Final triste: o mercenário caído mais perto atira do chão; quando a bala chega, o Kael cai. */
  private lastShot(): void {
    const m = [...this.mercenaries].sort((a, b) => Math.abs(a.x - this.kael.x) - Math.abs(b.x - this.kael.x))[0];
    const dir = this.kael.x < m.x ? -1 : 1;
    const x = m.x + dir * LAST_SHOT.ahead;
    const y = GROUND_Y - LAST_SHOT.muzzleH;
    playAt(this, 'rifle_shot', m.x, VOLUME.rifleShot);
    this.impact(x, y);
    // a bala do Kael não acerta ninguém aqui (a luta acabou): só o traço voando
    this.kaelBullets.fire(x, y, this.kael.x, this.kael.y - LAST_SHOT.aimH, 'lethal');
    this.time.delayedCall((Math.abs(this.kael.x - x) / KAEL_BULLET.speed) * 1000, () => {
      this.hurtFlash = HURT_FLASH_MS;
      this.cameras.main.shake(HURT_SHAKE.ms, HURT_SHAKE.intensity);
      this.blood.splash({ x: this.kael.x - dir * BODY_HALF_W, y: this.kael.y - LAST_SHOT.aimH, dir: dir === 1 ? 1 : -1 });
      this.killKael(false);
    });
  }

  private setControls(on: boolean): void {
    const kb = this.input.keyboard!;
    kb.enabled = on;
    kb.resetKeys();
    this.input.enabled = on;
  }

  /** Começa a jogar: a OST entra e, na primeira vez, a dica de onde ficam os controles. */
  private begin(): void {
    startMusic(this, 'ost_level_1');
    if (!this.registry.get('controlsShown')) {
      this.registry.set('controlsShown', true);
      bus.emit('toast:show', { text: t('controls.toast') });
    }
  }

  /** Céu, silhueta distante, chão, fachadas, postes e objetos de cena, o relógio do entardecer à noite,
   *  e o que fica no chão atrás dos personagens (manchas de sangue e a camada de trás da chuva). */
  private buildWorld(seed: string): void {
    this.cycle = new DayCycle(DAY_CYCLE_MS);
    this.sky = new Sky(this);
    this.parallax = new Parallax(this);
    const skyH = this.textures.get('skyline_dusk').getSourceImage().height;
    this.skyline = this.parallax.add('skyline_dusk', SKYLINE_BOTTOM - skyH, SKYLINE_FACTOR);
    this.skylineLights = this.parallax.add('skyline_lights', SKYLINE_BOTTOM - skyH, SKYLINE_FACTOR);
    this.ground = addGround(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH);
    this.street = new Street(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH, GROUND_Y);
    this.props = new Props(this, LEVEL_1, GROUND_Y - SIDEWALK_DEPTH, GROUND_Y);
    this.blood = new Blood(this, GROUND_Y, BLOOD_DEPTH);
    // sombras: antes dos personagens, para ficarem atrás de todos; cada Humanoid se inscreve ao nascer
    new Shadows(this, GROUND_Y);
    this.rain = new Rain(this, seed, RAIN_SPLASH_BAND, RAIN_DEPTH);
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
      shift: kb.addKey(K.SHIFT),
    };
    this.jumpKeys = [kb.addKey(K.SPACE), kb.addKey(K.W), kb.addKey(K.UP)];
    // Command fica de fora: Command + Espaço abre o Spotlight e Command + W fecha a aba
    this.crouchKeys = [kb.addKey(K.S), kb.addKey(K.DOWN), kb.addKey(K.CTRL)];
    kb.on('keydown-ONE', () => this.toggleWeapon());
    kb.on('keydown-Q', () => this.switchBullet());
    kb.on('keydown-K', () => this.killKael());
    kb.addCapture('F1');
    kb.on('keydown-F1', () => this.waves.toggleDebug());
    kb.on('keydown-R', () => this.reload());
    kb.on('keydown-C', () => this.camRig.toggleDebug(this));
    // pela tecla digitada, não pelo código: no teclado ABNT o [ fica em outro lugar
    kb.on('keydown', (e: KeyboardEvent) => {
      if (e.key === '[') this.cycle.shift(-CLOCK_STEP);
      if (e.key === ']') this.cycle.shift(CLOCK_STEP);
      // teste: liga e desliga a chuva
      if (e.key === 'n' || e.key === 'N') this.rain.toggle();
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
    this.camRig.update(delta, this.running);
    // cutscene deslizando a câmera: sem seguir ninguém, o FOLLOW_UPDATE não vem e o fundo anda daqui
    if (this.camRig.detached) this.parallax.update(this.cameras.main);
    this.updateTime(delta);
    this.habits.update(delta);
    const alive = this.mode !== 'dead';
    this.copBullets.update(delta, alive ? [this.bodyBox()] : [], (damage, _i, at) => this.hurtKael(damage, at));
    const enemies: Gunner[] = [...this.waves.cops.filter((c) => c.alive), ...this.fight.targets];
    this.kaelBullets.update(delta, enemies.map((c) => this.copBox(c)), (type, i, at) => this.onCopHit(enemies[i], type, at));
    if (!alive) {
      this.waves.update(delta, this.copTarget(false));
      this.fight.update(delta, this.copTarget(false));
      return;
    }

    this.kael.anims.timeScale = this.postureSwap ? POSTURE_SWAP_SPEED : 1;
    const dir = this.moveInput();
    if (this.jumpKeys.some((k) => Phaser.Input.Keyboard.JustDown(k))) this.startJump(dir);
    if (this.mode === 'jumping') this.updateJump(delta);
    this.updatePosture();
    // mirando sem segurar o botão direito: andar abaixa a arma na hora (agachado, A/D só viram)
    if (dir !== 0 && this.mode === 'aimed' && !this.aimHeld && !this.crouched) this.mode = 'free';
    this.running = false;
    if ((this.mode === 'free' || this.mode === 'lowering') && this.crouched) {
      // agachado não anda: A/D só viram
      if (dir !== 0) this.kael.face(dir);
      if (this.mode === 'free') this.rest();
    } else if (this.mode === 'free' || this.mode === 'lowering') {
      if (dir !== 0) {
        this.mode = 'free';
        // corre só livre: mirar, atirar e recarregar param o Kael
        this.running = this.keys.shift.isDown;
        const speed = this.running ? RUN_SPEED : WALK_SPEED;
        this.kael.face(dir);
        this.kael.x = Phaser.Math.Clamp(this.kael.x + dir * speed * (delta / 1000), 40, LEVEL_1.width - 40);
        if (this.running) this.kael.act(this.armed ? 'run_gun' : 'run');
        else {
          this.kael.act(this.armed ? 'walk_gun' : 'walk');
          this.kael.anims.timeScale = speed / WALK_ANIM_BASE;
        }
      } else if (this.mode === 'free') {
        // parando a corrida armado: junta a segunda mão na pistola antes do idle_gun
        if (this.kael.current === 'run_gun') this.kael.act('run_gun_stop');
        else if (this.kael.current !== 'run_gun_stop' || !this.kael.anims.isPlaying)
          this.kael.act(this.armed ? 'idle_gun' : 'idle');
      }
    } else if (dir !== 0 && (this.mode === 'raising' || this.mode === 'aimed' || this.mode === 'shooting')) {
      // mirando ou atirando: A/D viram, e o tiro sai para o lado em que ele olha (o mouse não vira)
      this.kael.face(dir);
    }
    if (this.mode === 'aimed' && !this.aimHeld) {
      this.aimIdle -= delta;
      if (this.aimIdle <= 0) this.lower();
    }
    // clique guardado durante o recuo: sai assim que o intervalo mínimo passa
    if (this.mode === 'shooting' && this.pendingShot && this.time.now - this.lastShotAt >= FIRE_MIN_MS) {
      this.pendingShot = false;
      this.shoot();
    }

    // arena: o Kael fica dentro da tela travada
    const bounds = this.waves.bounds ?? this.fight.bounds;
    if (bounds) this.kael.x = Phaser.Math.Clamp(this.kael.x, ...bounds);
    this.waves.update(delta, this.copTarget(true));
    this.fight.update(delta, this.copTarget(true));
    // barricada vencida: a seta pede para seguir em frente até o Kael andar (ou outra arena travar)
    if (this.waves.bounds ?? this.fight.bounds) this.goArrow.hide();
    else this.goArrow.update(this.kael.x);
    for (const { type, amount } of this.loot.update(this.kael.x, true)) {
      this.reserve[type] += amount;
      this.emitAmmo();
      // pente vazio e chegou bala do tipo certo: recarrega
      if (this.mag === 0 && type === this.bullet && (this.mode === 'free' || this.mode === 'aimed')) this.reload();
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
    this.rain.update(delta, t);
    this.blood.update(delta, tint, this.rain.intensity);
    this.hurtFlash = Math.max(0, this.hurtFlash - delta);
    this.kael.setTint(this.hurtFlash > 0 ? HURT_TINT : tint);
    this.waves.setTint(tint);
    for (const m of this.mercenaries) m.setTint(tint);
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
    if (this.crouched) this.rest();
    else this.kael.act(this.armed ? (walking ? 'walk_gun' : 'idle_gun') : walking ? 'walk' : 'idle');
    bus.emit('hud:weapon', { armed: this.armed });
  }

  private onAimPressed(): void {
    this.aimHeld = true;
    if (!this.armed) return this.onMeleePressed();
    if (this.mode === 'dead' || this.mode === 'reloading') return;
    if (this.mode === 'free' || this.mode === 'lowering') this.raise();
  }

  private onAimReleased(): void {
    this.aimHeld = false;
    if (this.mode === 'aimed') this.lower();
  }

  /** Clique esquerdo: atira. Se não estiver mirando, levanta a arma e atira assim que a mira termina. */
  private onFirePressed(): void {
    if (!this.armed || this.mode === 'dead' || this.mode === 'reloading' || this.mode === 'jumping') return;
    if (this.mode === 'aimed') return this.shoot();
    this.pendingShot = true;
    if (this.mode !== 'raising' && this.mode !== 'shooting') this.raise();
  }

  private raise(): void {
    this.mode = 'raising';
    this.kael.act(this.aimAnim(), { restart: true });
  }

  private lower(): void {
    this.mode = 'lowering';
    this.kael.act(this.aimAnim(), { reverse: true });
  }

  /** Segura a mira (último quadro do aim_gun) e recomeça a contagem para abaixar. */
  private holdAim(): void {
    this.mode = 'aimed';
    this.postureSwap = false;
    this.aimIdle = AIM_IDLE_MS;
    this.kael.hold(this.aimAnim(), this.kael.frameCount(this.aimAnim()) - 1);
  }

  private aimAnim(): 'aim_gun' | 'crouch_aim_gun' {
    return this.crouched ? 'crouch_aim_gun' : 'aim_gun';
  }

  private shoot(): void {
    if (this.mag <= 0) {
      // pente vazio: clique seco, continua mirando e recarrega se tiver reserva
      playAt(this, 'dry_fire', this.kael.x, VOLUME.dryFire);
      this.holdAim();
      this.reload();
      return;
    }
    this.mag -= 1;
    this.emitAmmo();
    this.mode = 'shooting';
    this.lastShotAt = this.time.now;
    this.kael.act(this.crouched ? 'crouch_shoot_gun' : 'shoot_gun', { restart: true });
    playAt(this, 'kael_shot', this.kael.x, VOLUME.kaelShot);

    // a bala sai do cano junto com o clarão e voa reta para o lado em que o Kael olha (kaelBullets)
    const m = this.crouched ? KAEL_MUZZLE_CROUCH : KAEL_MUZZLE;
    const x = this.kael.x + this.kael.facing * m.x;
    const y = this.kael.y - m.h;
    this.kaelBullets.fire(x, y, x + this.kael.facing * 100, y, this.bullet);
    // os inimigos veem o tiro e às vezes desviam (IA esperta)
    const shot = { x, h: m.h, dir: this.kael.facing, speed: KAEL_BULLET.speed };
    for (const c of [...this.waves.cops, ...this.fight.mercenaries]) c.dodge(shot);
  }

  /** Bala do Kael chegou num inimigo em pé. Matar mercenário não tira índole; acertar um antes da hora começa a luta.
   *  Bala letal sangra (e quem fica em pé pinga); a não letal só dá um respingo pequeno. */
  private onCopHit(cop: Gunner, type: BulletType, at: HitPoint): void {
    if (cop instanceof Mercenary) this.fight.start(this.kael.x);
    const result = cop.hit(type);
    if (result) this.blood.splash(at, type !== 'lethal');
    if (result === 'hurt' && type === 'lethal') this.bleedFrom(cop, at, () => cop.alive);
    if (cop instanceof Mercenary) {
      if (result === 'death' || result === 'knockout') this.loot.drop(cop.x);
      return;
    }
    if (result === 'death') {
      this.morale = Math.max(0, this.morale - 1);
      bus.emit('hud:morale', { current: this.morale, max: MORALE_MAX });
    }
    if (result === 'knockout' || (result === 'death' && Math.random() < DEATH_DROP_CHANCE)) this.loot.drop(cop.x);
  }

  private copBox(cop: Gunner): BodyBox {
    const h = cop.state === 'jumping' ? BODY_H_AIR : cop.crouched ? BODY_H_CROUCH : cop.kit.bodyH;
    return { x: cop.x, halfW: BODY_HALF_W, top: cop.y - h, bottom: cop.y };
  }

  /** O que os policiais sabem do Kael: onde está, se está agachado e se está com a arma apontada. */
  private copTarget(alive: boolean) {
    const aiming = this.mode === 'raising' || this.mode === 'aimed' || this.mode === 'shooting';
    return {
      x: this.kael.x,
      alive,
      crouched: this.crouched,
      aiming,
      facing: this.kael.facing,
      airborne: this.kael.y < GROUND_Y,
      reloading: this.mode === 'reloading',
      armed: this.armed,
      habit: this.habits,
    };
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
        // o braço fica na mira: só o recuo se repete a cada tiro
        this.holdAim();
        if (this.mag === 0) this.reload();
        else if (this.pendingShot) {
          this.pendingShot = false;
          this.shoot();
        }
        break;
      case 'lowering':
        this.mode = 'free';
        // abaixou a arma para trocar de pose, mas a tecla foi solta no meio: a troca acabou
        if (this.postureSwap && this.crouchKeys.some((k) => k.isDown) === this.crouched) this.postureSwap = false;
        break;
      case 'crouching':
        this.mode = 'free';
        this.rest();
        // ainda segurando o botão direito: volta para a mira na pose nova
        if (this.armed && this.aimHeld) this.raise();
        else this.postureSwap = false;
        break;
      case 'jumping':
        this.endJump();
        break;
      case 'melee':
        // golpe terminou sem emendar (o chute não emenda): volta ao idle e o combo zera
        this.mode = 'free';
        this.combo.queued = false;
        this.kael.act('idle');
        break;
    }
  }

  // ---------- combo sem arma ----------

  /** Botão direito sem arma: começa o combo ou guarda o clique para o próximo golpe. Não golpeia agachado nem no ar. */
  private onMeleePressed(): void {
    if (this.mode === 'free' && !this.crouched) return this.strike(0);
    if (this.mode !== 'melee' || this.combo.step >= COMBO.length - 1) return;
    // já passou do ponto de emenda (voltando à guarda): o próximo sai na hora
    const f = this.kael.anims.currentFrame;
    if (f && f.index - 1 > COMBO[this.combo.step].chainOut) this.strike(this.combo.step + 1);
    else this.combo.queued = true;
  }

  private strike(step: number): void {
    const blow = COMBO[step];
    this.mode = 'melee';
    this.combo = { step, queued: false, landed: false };
    this.kael.act(blow.anim, { restart: true, startFrame: blow.chainIn });
    playAt(this, 'swing', this.kael.x, VOLUME.swing);
  }

  /** Quadro novo do Kael: no golpe, acerta no quadro do acerto e emenda o próximo depois do ponto de emenda. */
  private onKaelFrame(frame: number): void {
    if (this.mode !== 'melee') return;
    const blow = COMBO[this.combo.step];
    if (!this.combo.landed && frame >= blow.hit) {
      this.combo.landed = true;
      this.landBlow(this.combo.step === COMBO.length - 1);
    }
    if (this.combo.queued && frame > blow.chainOut) this.strike(this.combo.step + 1);
  }

  /** Acerta todo policial de pé à frente, dentro do alcance. O chute nocauteia e a caixa cai como no nocaute por bala. */
  private landBlow(finisher: boolean): void {
    const dir = this.kael.facing;
    let hit = false;
    for (const cop of [...this.waves.cops, ...this.fight.targets]) {
      if (!cop.alive) continue;
      const ahead = (cop.x - this.kael.x) * dir;
      if (ahead < -BODY_HALF_W || ahead > MELEE_REACH + BODY_HALF_W) continue;
      if (cop instanceof Mercenary) this.fight.start(this.kael.x);
      const result = cop.strike(finisher);
      if (!result) continue;
      this.impact(cop.x - dir * BODY_HALF_W, cop.y - (finisher ? MELEE_HIT_H.kick : MELEE_HIT_H.punch));
      if (result === 'knockout') this.loot.drop(cop.x);
      hit = true;
    }
    if (hit) playAt(this, finisher ? 'kick_hit' : 'punch_hit', this.kael.x, finisher ? VOLUME.kickHit : VOLUME.punchHit);
  }

  /** Estrelinha de impacto desenhada no Phaser: cresce e some em IMPACT_MS. */
  private impact(x: number, y: number): void {
    const g = this.add.graphics({ x, y }).setDepth(this.kael.depth + 1);
    const star = (r: number, inner: number, color: number) => {
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 === 0 ? r * (i % 4 === 0 ? 1 : 0.7) : inner;
        pts.push(new Phaser.Math.Vector2(Math.round(Math.cos(a) * rr), Math.round(Math.sin(a) * rr)));
      }
      g.fillStyle(color, 1).fillPoints(pts, true);
    };
    star(14, 5, IMPACT_COLORS.rim);
    star(8, 3, IMPACT_COLORS.core);
    g.setScale(0.6);
    // cresce de uma vez e só some na segunda metade, para ser visto
    this.tweens.add({ targets: g, scale: 1.2, duration: IMPACT_MS / 2, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: g, alpha: 0, delay: IMPACT_MS / 2, duration: IMPACT_MS / 2, onComplete: () => g.destroy() });
  }

  /** R ou pente vazio. Parado: interrompe a mira, o tiro e o andar. Sem reserva ou pente cheio, não faz nada. */
  private reload(): void {
    if (!this.armed || this.mode === 'dead' || this.mode === 'reloading' || this.mode === 'jumping') return;
    if (this.mag >= MAG_SIZE || this.reserve[this.bullet] <= 0) return;
    this.mode = 'reloading';
    this.pendingShot = false;
    this.postureSwap = false;
    this.kael.act(this.crouched ? 'crouch_reload_gun' : 'reload_gun', { restart: true });
    this.reloadSound = playAt(this, 'colt_reload_fast', this.kael.x, VOLUME.reload);
    this.reloadTimer = this.time.delayedCall(RELOAD_MS, () => this.finishReload());
    this.emitAmmo();
  }

  private finishReload(): void {
    const n = Math.min(MAG_SIZE - this.mag, this.reserve[this.bullet]);
    this.mag += n;
    this.reserve[this.bullet] -= n;
    this.reloadTimer = undefined;
    this.reloadSound = undefined;
    this.mode = 'free';
    this.rest();
    // ainda segurando o botão direito: volta para a mira
    if (this.aimHeld) this.raise();
    this.emitAmmo();
  }

  /** Q ou roda: devolve o pente para a reserva e recarrega com o outro tipo. */
  private switchBullet(): void {
    if (this.mode === 'dead' || this.mode === 'reloading' || this.mode === 'jumping') return;
    this.reserve[this.bullet] += this.mag;
    this.mag = 0;
    this.bullet = this.bullet === 'lethal' ? 'nonLethal' : 'lethal';
    if (this.armed) this.reload();
    else {
      // arma guardada: troca o pente sem animação
      this.mag = Math.min(MAG_SIZE, this.reserve[this.bullet]);
      this.reserve[this.bullet] -= this.mag;
    }
    this.emitAmmo();
  }

  // ---------- pulo ----------

  /** Espaço, W ou ↑: pula para a frente (para o lado em que anda ou olha). Cancela a mira; não pula recarregando. */
  private startJump(dir: -1 | 0 | 1): void {
    if (this.mode === 'reloading' || this.mode === 'jumping' || this.mode === 'crouching' || this.mode === 'melee' || this.mode === 'dead') return;
    if (dir !== 0) this.kael.face(dir);
    // agachado também pula: o impulso do pulo já sai de joelhos dobrados
    this.crouched = false;
    this.postureSwap = false;
    this.pendingShot = false;
    this.mode = 'jumping';
    this.habits.jump += 1;
    this.jump = { t: 0, fromX: this.kael.x, dir: this.kael.facing, dist: this.running ? JUMP_DIST_RUN : JUMP_DIST };
    this.kael.act(this.armed ? 'jump_gun' : 'jump', { restart: true });
  }

  /** Parábola no ar, entre os quadros `air` e `land` do pulo. Os quadros ficam no lugar; a cena move o Kael. */
  private updateJump(delta: number): void {
    const prev = this.jump.t;
    this.jump.t += delta;
    const t0 = jumpMs(0, JUMP_PHASES.air);
    const t1 = jumpMs(0, JUMP_PHASES.land);
    if (prev < t0 && this.jump.t >= t0) playStep(this, 'run', this.kael.x, VOLUME.kaelStep);
    if (prev < t1 && this.jump.t >= t1) playStep(this, 'run', this.kael.x, VOLUME.kaelStep);
    const p = Phaser.Math.Clamp((this.jump.t - t0) / (t1 - t0), 0, 1);
    this.kael.x = Phaser.Math.Clamp(this.jump.fromX + this.jump.dir * this.jump.dist * p, 40, LEVEL_1.width - 40);
    this.kael.y = GROUND_Y - JUMP_HEIGHT * 4 * p * (1 - p);
  }

  private endJump(): void {
    this.kael.y = GROUND_Y;
    this.mode = 'free';
    this.kael.act(this.armed ? 'idle_gun' : 'idle');
    // ainda segurando o botão direito: volta para a mira
    if (this.armed && this.aimHeld) this.raise();
  }

  // ---------- agachar ----------

  /** Segurar S ou ↓ agacha; soltar levanta. Mirando, abaixa a arma antes; atirando ou recarregando, espera. */
  private updatePosture(): void {
    const want = this.crouchKeys.some((k) => k.isDown);
    if (want === this.crouched) return;
    if (this.mode === 'free') this.startCrouch(want);
    else if (this.mode === 'aimed') {
      this.postureSwap = true;
      this.lower();
    }
  }

  /** Abaixa ou levanta: a mesma animação, ao contrário para levantar. */
  private startCrouch(down: boolean): void {
    this.mode = 'crouching';
    this.crouched = down;
    if (down) this.habits.crouch += 1;
    this.pendingShot = false;
    this.kael.act(this.armed ? 'crouch_gun' : 'crouch', { restart: true, reverse: !down });
  }

  /** Pose parada: agachado segura o último quadro do crouch; em pé, idle. */
  private rest(): void {
    if (!this.crouched) return this.kael.act(this.armed ? 'idle_gun' : 'idle');
    const anim = this.armed ? 'crouch_gun' : 'crouch';
    if (this.kael.current !== anim || this.kael.anims.isPlaying) this.kael.hold(anim, this.kael.frameCount(anim) - 1);
  }

  /** Caixa do corpo do Kael para as balas: encolhida no ar e agachado; abaixando, acompanha o quadro. */
  private bodyBox(): BodyBox {
    let h = this.crouched ? BODY_H_CROUCH : BODY_H;
    if (this.kael.y < GROUND_Y) h = BODY_H_AIR;
    else if (this.mode === 'crouching') {
      // o quadro diz o quanto ele já abaixou, nos dois sentidos (levantar toca ao contrário)
      const f = this.kael.anims.currentFrame;
      const k = f ? f.index / Math.max(1, this.kael.frameCount(this.kael.current)) : 1;
      h = Phaser.Math.Linear(BODY_H, BODY_H_CROUCH, k);
    }
    return { x: this.kael.x, halfW: BODY_HALF_W, top: this.kael.y - h, bottom: this.kael.y };
  }

  /** Tiro do inimigo (o som sai do Gunner): a bala sai do cano junto com o clarão e voa até o Kael (Bullets). */
  private onCopFire(cop: Gunner): void {
    const { damage, hitChance } = cop.archetype;
    this.time.delayedCall(60, () => {
      if (!cop.active || this.mode === 'dead') return;
      // ajoelhado atira baixo, na altura do chão (não segue o Kael no ar: o pulo desvia por cima)
      const low = cop.crouched;
      const aimH = low ? COP_LOW_H : COP_AIM_H;
      const h = Math.random() < hitChance ? aimH + Phaser.Math.Between(-COP_AIM_SPREAD, COP_AIM_SPREAD) : Phaser.Math.Between(...COP_WILD_H);
      const m = low ? cop.kit.muzzleCrouch : cop.kit.muzzle;
      const ty = (low ? GROUND_Y : this.kael.y) - h;
      // mira o Kael onde ele está agora (no ar, mira mais alto)
      this.copBullets.fire(cop.x + cop.facing * m.x, cop.y - m.h, this.kael.x, ty, damage);
    });
  }

  private hurtKael(damage: number, at?: HitPoint): void {
    if (this.mode === 'dead') return;
    if (at) {
      this.blood.splash(at);
      this.bleedFrom(this.kael, at, () => this.mode !== 'dead');
    }
    this.life = Math.max(0, this.life - damage);
    bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
    this.hurtFlash = HURT_FLASH_MS;
    this.cameras.main.shake(HURT_SHAKE.ms, HURT_SHAKE.intensity);
    if (this.life === 0) this.killKael();
  }

  /** Pinga do ponto do acerto, acompanhando quem foi atingido, enquanto `standing()` (caído para de pingar). */
  private bleedFrom(who: Phaser.GameObjects.Sprite, at: HitPoint, standing: () => boolean): void {
    const dx = (at.x - who.x) * (who.flipX ? -1 : 1);
    const h = who.y - at.y;
    this.blood.bleed(() => (who.active && standing() ? { x: who.x + dx * (who.flipX ? -1 : 1), y: who.y - h } : null));
  }

  private killKael(showText = true): void {
    if (this.mode === 'dead') return;
    this.reloadTimer?.remove();
    this.reloadSound?.stop();
    this.reloadSound = undefined;
    this.mode = 'dead';
    this.crouched = false;
    this.postureSwap = false;
    this.kael.y = GROUND_Y;
    this.emitAmmo();
    this.life = 0;
    bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
    this.kael.act('death');
    this.kael.anims.timeScale = 1;
    // derrota ainda EM ABERTO (decisions.md, item 14): na cena de teste, a tela de game over (React) reinicia com Enter
    if (showText) bus.emit('game:over');
  }

  // ---------- HUD ----------

  private emitAmmo(): void {
    bus.emit('hud:ammo', {
      ...this.reserve,
      selected: this.bullet,
      mag: this.mag,
      magSize: MAG_SIZE,
      reloading: this.mode === 'reloading',
      reloadMs: RELOAD_MS,
    });
  }

  private emitHud(): void {
    this.emitAmmo();
    bus.emit('hud:life', { current: this.life, max: LIFE_MAX });
    bus.emit('hud:morale', { current: this.morale, max: MORALE_MAX });
    bus.emit('hud:weapon', { armed: this.armed });
  }
}
