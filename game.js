/**
 * Flappy Portfolio - Game Engine & Sound & Unlock Controller
 * 岸 幸之介さん仕様 (肩に乗っているヒヨコがラボ常駐を目指す！)
 */

// Web Audio API レトロサウンドシステム
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }

  playScore() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  playUnlock() {
    if (this.muted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = this.ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch (e) {}
  }

  playHit() {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch (e) {}
  }
}

// ゲーム本体
class FlappyPortfolioGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.audio = new RetroAudio();

    this.width = 360;
    this.height = 540;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.state = 'READY'; // 'READY' | 'PLAYING' | 'GAMEOVER'

    this.gravity = 0.38;
    this.jumpForce = -7.2;
    this.pipeSpeed = 2.4;
    this.pipeSpawnInterval = 100;
    this.pipeGap = 138;

    // 肩のヒヨコ (プレイヤー)
    this.bird = {
      x: 75,
      y: 220,
      radius: 17,
      velocity: 0,
      rotation: 0
    };

    this.pipes = [];
    this.clouds = [
      { x: 30, y: 50, speed: 0.5, size: 28 },
      { x: 180, y: 90, speed: 0.3, size: 36 },
      { x: 300, y: 40, speed: 0.4, size: 24 }
    ];
    this.groundX = 0;
    this.frameCount = 0;

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('flappy_kishi_high_score') || '0', 10);
    this.maxScoreAchieved = this.highScore;
    this.overrideUnlockAll = false;

    // 岸さんのエッジLLM・AWS・趣味にちなんだ障害物
    this.pipeLabels = [
      "エッジLLMメモリ制限", "推論レイテンシ", "AWS請求額アラート", 
      "量子化ロス", "クラウド障害", "塾講の準備", 
      "インターン締め切り", "犬の誘惑🐶", "JoJoスタンド攻撃", 
      "Vaundyライブ落選", "過学習 (Overfitting)", "環境差異"
    ];

    this.initEventListeners();
    this.syncProfileUnlockState();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initEventListeners() {
    const handleAction = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
        return;
      }
      this.audio.init();
      if (this.state === 'READY') {
        this.startGame();
      } else if (this.state === 'PLAYING') {
        this.jump();
      } else if (this.state === 'GAMEOVER') {
        this.resetGame();
      }
    };

    this.canvas.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handleAction(e);
    });
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleAction(e);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction(e);
      }
    });

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.audio.init();
        this.resetGame();
      });
    }

    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        this.audio.init();
        this.audio.muted = !this.audio.muted;
        muteBtn.innerHTML = this.audio.muted 
          ? '<i class="fas fa-volume-mute text-rose-400"></i>' 
          : '<i class="fas fa-volume-up text-sky-400"></i>';
      });
    }

    const unlockAllToggle = document.getElementById('unlockAllToggle');
    if (unlockAllToggle) {
      unlockAllToggle.addEventListener('change', (e) => {
        this.overrideUnlockAll = e.target.checked;
        this.syncProfileUnlockState();
        if (this.overrideUnlockAll) {
          this.triggerConfetti();
          this.showToast("全セクションを解放しました！ラボ常駐希望の全情報を閲覧できます ✨");
        }
      });
    }
  }

  startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.jump();
    this.updateHUD();
  }

  resetGame() {
    this.state = 'READY';
    this.score = 0;
    this.bird.y = 220;
    this.bird.velocity = 0;
    this.bird.rotation = 0;
    this.pipes = [];
    this.frameCount = 0;
    this.updateHUD();
  }

  jump() {
    this.bird.velocity = this.jumpForce;
    this.audio.playJump();
  }

  spawnPipe() {
    const minHeight = 60;
    const maxHeight = this.height - this.pipeGap - 110;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomY = topHeight + this.pipeGap;
    const bottomHeight = this.height - 70 - bottomY;

    const label = this.pipeLabels[Math.floor(Math.random() * this.pipeLabels.length)];

    this.pipes.push({
      x: this.width,
      topHeight: topHeight,
      bottomY: bottomY,
      bottomHeight: bottomHeight,
      width: 58,
      passed: false,
      label: label
    });
  }

  update() {
    this.frameCount++;

    this.clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.size * 2 < 0) {
        c.x = this.width + 40;
        c.y = 30 + Math.random() * 80;
      }
    });

    if (this.state !== 'GAMEOVER') {
      this.groundX = (this.groundX - this.pipeSpeed) % 24;
    }

    if (this.state === 'READY') {
      this.bird.y = 220 + Math.sin(this.frameCount * 0.08) * 8;
      this.bird.rotation = 0;
      return;
    }

    if (this.state === 'PLAYING') {
      this.bird.velocity += this.gravity;
      this.bird.y += this.bird.velocity;
      this.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (this.bird.velocity * 4) * (Math.PI / 180)));

      const groundLevel = this.height - 70;
      if (this.bird.y - this.bird.radius <= 0) {
        this.bird.y = this.bird.radius;
        this.bird.velocity = 0;
      }
      if (this.bird.y + this.bird.radius >= groundLevel) {
        this.bird.y = groundLevel - this.bird.radius;
        this.gameOver();
        return;
      }

      if (this.frameCount % this.pipeSpawnInterval === 0) {
        this.spawnPipe();
      }

      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const p = this.pipes[i];
        p.x -= this.pipeSpeed;

        if (!p.passed && p.x + p.width < this.bird.x) {
          p.passed = true;
          this.score++;
          this.audio.playScore();
          this.checkUnlocks(this.score);
          this.updateHUD();
        }

        const bx = this.bird.x;
        const by = this.bird.y;
        const br = this.bird.radius - 3;

        if (bx + br > p.x && bx - br < p.x + p.width && by - br < p.topHeight) {
          this.gameOver();
          return;
        }

        if (bx + br > p.x && bx - br < p.x + p.width && by + br > p.bottomY) {
          this.gameOver();
          return;
        }

        if (p.x + p.width < -10) {
          this.pipes.splice(i, 1);
        }
      }
    } else if (this.state === 'GAMEOVER') {
      const groundLevel = this.height - 70;
      if (this.bird.y + this.bird.radius < groundLevel) {
        this.bird.velocity += this.gravity * 1.5;
        this.bird.y += this.bird.velocity;
        this.bird.rotation = Math.min(Math.PI / 2, this.bird.rotation + 0.1);
      }
    }
  }

  gameOver() {
    if (this.state === 'GAMEOVER') return;
    this.state = 'GAMEOVER';
    this.audio.playHit();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('flappy_kishi_high_score', this.highScore.toString());
      this.showToast(`🔥 ハイスコア更新: ${this.highScore}点！`);
    }

    if (this.score > this.maxScoreAchieved) {
      this.maxScoreAchieved = this.score;
    }

    this.syncProfileUnlockState();
    this.updateHUD();
  }

  checkUnlocks(newScore) {
    if (newScore > this.maxScoreAchieved) {
      this.maxScoreAchieved = newScore;
    }

    const reqs = PROFILE_DATA.unlockRequirements;
    let unlockedSection = null;

    if (newScore === reqs.target) unlockedSection = "目標：11月中旬からラボ常駐！";
    else if (newScore === reqs.tech) unlockedSection = "技術：エッジLLM研究 & AWS";
    else if (newScore === reqs.activity) unlockedSection = "活動：業務委託 & 塾講 & インターン";
    else if (newScore === reqs.hobbies) unlockedSection = "趣味：サッカー/JoJo/Vaundy/犬";
    else if (newScore === reqs.labGoal) unlockedSection = "コミット：ラボで実現したいこと";
    else if (newScore === reqs.contact) unlockedSection = "完全制覇！ラボ常駐確定！？🎉";

    if (unlockedSection) {
      this.audio.playUnlock();
      this.triggerConfetti();
      this.showToast(`🎉 UNLOCKED! 【${unlockedSection}】が解放されました！`);
      this.syncProfileUnlockState();
    }
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 }
      });
    }
  }

  showToast(message) {
    const toast = document.getElementById('gameToast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-4');
      toast.classList.remove('opacity-100', 'translate-y-0');
    }, 3200);
  }

  updateHUD() {
    const scoreElem = document.getElementById('currentScoreDisplay');
    const highScoreElem = document.getElementById('highScoreDisplay');
    if (scoreElem) scoreElem.textContent = this.score;
    if (highScoreElem) highScoreElem.textContent = Math.max(this.highScore, this.score);
  }

  syncProfileUnlockState() {
    const reqs = PROFILE_DATA.unlockRequirements;
    const currentMax = this.overrideUnlockAll ? 999 : Math.max(this.maxScoreAchieved, this.score);

    this.toggleCardState('section-target', currentMax >= reqs.target, reqs.target);
    this.toggleCardState('section-tech', currentMax >= reqs.tech, reqs.tech);
    this.toggleCardState('section-activity', currentMax >= reqs.activity, reqs.activity);
    this.toggleCardState('section-hobbies', currentMax >= reqs.hobbies, reqs.hobbies);
    this.toggleCardState('section-labGoal', currentMax >= reqs.labGoal, reqs.labGoal);
    this.toggleCardState('section-contact', currentMax >= reqs.contact, reqs.contact);

    const progressBar = document.getElementById('unlockProgressBar');
    const progressText = document.getElementById('unlockProgressText');
    if (progressBar && progressText) {
      const maxTarget = reqs.contact;
      const percent = Math.min(100, Math.round((currentMax / maxTarget) * 100));
      progressBar.style.width = `${percent}%`;
      progressText.textContent = `${percent}% アンロック (${Math.min(currentMax, maxTarget)} / ${maxTarget} pt)`;
    }
  }

  toggleCardState(elementId, isUnlocked, reqScore) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const lockBadge = el.querySelector('.lock-badge');
    const contentArea = el.querySelector('.card-content');

    if (isUnlocked) {
      if (el.classList.contains('locked-card')) {
        el.classList.remove('locked-card');
        el.classList.add('unlocked-card', 'unlock-animation');
        setTimeout(() => el.classList.remove('unlock-animation'), 1000);
      }
      if (lockBadge) lockBadge.classList.add('hidden');
      if (contentArea) contentArea.classList.remove('opacity-20', 'blur-[2px]');
    } else {
      el.classList.add('locked-card');
      el.classList.remove('unlocked-card');
      if (lockBadge) {
        lockBadge.classList.remove('hidden');
        lockBadge.innerHTML = `<i class="fas fa-lock mr-1.5 text-amber-400"></i> スコア <span class="text-amber-300 font-bold font-mono">${reqScore}</span> でアンロック`;
      }
      if (contentArea) contentArea.classList.add('opacity-20', 'blur-[2px]');
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. 空のグラデーション背景
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    skyGradient.addColorStop(0, '#0369a1');
    skyGradient.addColorStop(0.65, '#bae6fd');
    skyGradient.addColorStop(0.65, '#34d399');
    skyGradient.addColorStop(0.75, '#059669');
    skyGradient.addColorStop(0.75, '#b45309');
    skyGradient.addColorStop(1, '#78350f');
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 2. 雲
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this.clouds.forEach(c => {
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 0.7, c.y - c.size * 0.3, c.size * 0.8, 0, Math.PI * 2);
      this.ctx.arc(c.x + c.size * 1.4, c.y, c.size * 0.9, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 3. 遠景の街・研究棟のシルエット
    this.ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
    for (let i = 0; i < 10; i++) {
      const bx = i * 40 - (this.frameCount * 0.3 % 40);
      const bh = 45 + (i * 19) % 55;
      this.ctx.fillRect(bx, this.height - 70 - bh, 32, bh);
    }

    // 4. パイプ (障害物)
    this.pipes.forEach(p => {
      // 上パイプ
      this.ctx.fillStyle = '#047857';
      this.ctx.fillRect(p.x, 0, p.width, p.topHeight);
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillRect(p.x + 4, 0, 8, p.topHeight);
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(p.x - 3, p.topHeight - 20, p.width + 6, 20);

      // 下パイプ
      this.ctx.fillStyle = '#047857';
      this.ctx.fillRect(p.x, p.bottomY, p.width, p.bottomHeight);
      this.ctx.fillStyle = '#10b981';
      this.ctx.fillRect(p.x + 4, p.bottomY, 8, p.bottomHeight);
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(p.x - 3, p.bottomY, p.width + 6, 20);

      // パイプラベル
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      this.ctx.font = '10px "Noto Sans JP", sans-serif';
      this.ctx.textAlign = 'center';
      const labelText = p.label;
      const textWidth = this.ctx.measureText(labelText).width + 10;
      
      this.ctx.fillRect(p.x + p.width / 2 - textWidth / 2, p.topHeight - 44, textWidth, 20);
      this.ctx.fillStyle = '#f87171';
      this.ctx.fillText(labelText, p.x + p.width / 2, p.topHeight - 30);
      this.ctx.restore();
    });

    // 5. 地面
    const groundLevel = this.height - 70;
    this.ctx.fillStyle = '#047857';
    this.ctx.fillRect(0, groundLevel, this.width, 14);
    this.ctx.fillStyle = '#ca8a04';
    this.ctx.fillRect(0, groundLevel + 14, this.width, 56);

    this.ctx.fillStyle = '#a16207';
    for (let x = this.groundX - 30; x < this.width + 30; x += 24) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, groundLevel + 14);
      this.ctx.lineTo(x + 12, groundLevel + 14);
      this.ctx.lineTo(x, groundLevel + 70);
      this.ctx.lineTo(x - 12, groundLevel + 70);
      this.ctx.fill();
    }

    // 6. 鳥（肩に乗っていたヒヨコ）の描画
    this.drawBird();

    // 7. 状態オーバーレイ
    if (this.state === 'READY') {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#facc15';
      this.ctx.font = 'bold 15px "Press Start 2P", monospace';
      this.ctx.fillText("FLAPPY KISHI", this.width / 2, 160);

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.font = 'bold 14px "Noto Sans JP", sans-serif';
      this.ctx.fillText("〜 11月ラボ常駐への道 〜", this.width / 2, 200);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px "Noto Sans JP", sans-serif';
      this.ctx.fillText("岸さんの肩のヒヨコがラボを目指して羽ばたく！", this.width / 2, 275);
      this.ctx.fillText("タップ または [Space] でスタート", this.width / 2, 305);

      this.ctx.fillStyle = '#facc15';
      this.ctx.font = '12px "Noto Sans JP", sans-serif';
      this.ctx.fillText("障害物を避けて自己紹介を解放しよう 🚀", this.width / 2, 345);
    } else if (this.state === 'PLAYING') {
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.font = 'bold 36px "Press Start 2P", monospace';
      this.ctx.strokeText(this.score, this.width / 2, 70);
      this.ctx.fillText(this.score, this.width / 2, 70);
    } else if (this.state === 'GAMEOVER') {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#f43f5e';
      this.ctx.font = 'bold 20px "Press Start 2P", monospace';
      this.ctx.fillText("GAME OVER", this.width / 2, 170);

      // スコアカード
      this.ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(this.width / 2 - 120, 200, 240, 140, 12);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '11px "Press Start 2P", monospace';
      this.ctx.fillText("SCORE", this.width / 2, 235);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 22px "Press Start 2P", monospace';
      this.ctx.fillText(this.score, this.width / 2, 265);

      this.ctx.fillStyle = '#facc15';
      this.ctx.font = '10px "Press Start 2P", monospace';
      this.ctx.fillText(`BEST: ${this.highScore}`, this.width / 2, 305);

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.font = '12px "Noto Sans JP", sans-serif';
      this.ctx.fillText("クリック / [Space] で再挑戦！", this.width / 2, 380);
    }
  }

  drawBird() {
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    this.ctx.rotate(this.bird.rotation);

    // ヒヨコの体 (黄色)
    this.ctx.fillStyle = '#fde047';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#ca8a04';
    this.ctx.stroke();

    // 大きな目
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(8, -5, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(10, -5, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // くちばし
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.moveTo(12, 0);
    this.ctx.lineTo(24, 5);
    this.ctx.lineTo(12, 9);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // 翼 (パタパタ)
    const wingFlap = Math.sin(this.frameCount * 0.25) * 5;
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.ellipse(-6, 2, 8, 5 + wingFlap * 0.4, -0.2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // 頭の小さなちょんまげ/羽毛
    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    this.ctx.arc(-2, -18, 3.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// ページ初期化
window.addEventListener('DOMContentLoaded', () => {
  renderProfileSections();
  window.gameInstance = new FlappyPortfolioGame('gameCanvas');

  const shareBtn = document.getElementById('shareOnXBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const score = window.gameInstance ? window.gameInstance.score : 0;
      const text = encodeURIComponent(`【岸 幸之介の自己紹介ゲーム】スコア${score}点！エッジLLMとAWSの障害物をくぐり抜け、11月のラボ常駐切符をアンロックしました！🎮🔥`);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    });
  }
});

/**
 * プロフィール各セクションのDOM生成
 */
function renderProfileSections() {
  // ヘッダー
  const nameEl = document.getElementById('profileHeaderName');
  const kanaEl = document.getElementById('profileHeaderKana');
  const titleEl = document.getElementById('profileHeaderTitle');
  const taglineEl = document.getElementById('profileHeaderTagline');
  const statusEl = document.getElementById('profileHeaderStatus');

  if (nameEl) nameEl.textContent = PROFILE_DATA.name;
  if (kanaEl) kanaEl.textContent = PROFILE_DATA.nameKana;
  if (titleEl) titleEl.textContent = PROFILE_DATA.title;
  if (taglineEl) taglineEl.textContent = PROFILE_DATA.tagline;
  if (statusEl) statusEl.textContent = PROFILE_DATA.statusBadge;

  // 1. Mission / 目標 (スコア1)
  const targetContainer = document.getElementById('content-target');
  if (targetContainer) {
    targetContainer.innerHTML = `
      <div class="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-sky-500/10 p-4 rounded-2xl border border-rose-500/30">
        <div class="flex items-center space-x-2 text-rose-400 font-bold text-base sm:text-lg mb-2">
          <span>🔥</span>
          <span>${PROFILE_DATA.target.headline}</span>
        </div>
        <p class="text-slate-300 text-sm leading-relaxed">${PROFILE_DATA.target.desc}</p>
      </div>
    `;
  }

  // 2. Tech & Research (スコア3)
  const techContainer = document.getElementById('content-tech');
  if (techContainer) {
    techContainer.innerHTML = `
      <!-- 研究ハイライト -->
      <div class="mb-4 bg-sky-950/40 p-4 rounded-2xl border border-sky-800/60">
        <h4 class="text-sm font-bold text-sky-300 mb-1 flex items-center">
          ${PROFILE_DATA.tech.research.title}
        </h4>
        <p class="text-xs text-slate-300 leading-relaxed">${PROFILE_DATA.tech.research.desc}</p>
      </div>

      <!-- スキルカード一覧 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${PROFILE_DATA.tech.skills.map(skill => `
          <div class="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <h5 class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2"></span>
              ${skill.name}
            </h5>
            <div class="flex flex-wrap gap-1.5">
              ${skill.tags.map(t => `
                <span class="text-xs bg-slate-800 text-slate-200 px-2 py-1 rounded-md border border-slate-700/60">
                  ${t}
                </span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Activity (スコア6)
  const actContainer = document.getElementById('content-activity');
  if (actContainer) {
    actContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${PROFILE_DATA.activity.items.map(item => `
          <div class="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${item.tag}</span>
              <h4 class="font-bold text-white text-sm mt-2 mb-1.5">${item.title}</h4>
              <p class="text-xs text-slate-400 leading-relaxed">${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 4. Hobbies (スコア9)
  const hobbiesContainer = document.getElementById('content-hobbies');
  if (hobbiesContainer) {
    hobbiesContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${PROFILE_DATA.hobbies.items.map(h => `
          <div class="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex items-start space-x-3">
            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400 shrink-0">
              <i class="fas ${h.icon}"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-mono text-slate-500">${h.category}</span>
                <h5 class="text-sm font-bold text-slate-200">${h.name}</h5>
              </div>
              <p class="text-xs text-slate-400 mt-1">${h.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 5. Why Lab? (スコア12)
  const labGoalContainer = document.getElementById('content-labGoal');
  if (labGoalContainer) {
    labGoalContainer.innerHTML = `
      <div class="bg-indigo-950/30 p-4 rounded-2xl border border-indigo-800/50 space-y-2.5">
        ${PROFILE_DATA.labGoal.points.map((pt, idx) => `
          <div class="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300">
            <span class="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">${idx + 1}</span>
            <span>${pt}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 6. Contact (スコア15)
  const contactContainer = document.getElementById('content-contact');
  if (contactContainer) {
    contactContainer.innerHTML = `
      <div class="bg-gradient-to-r from-sky-950/50 via-indigo-950/40 to-emerald-950/40 p-5 rounded-2xl border border-sky-800/60">
        <p class="text-slate-200 text-sm leading-relaxed mb-4">${PROFILE_DATA.contact.message}</p>
        <div class="flex flex-wrap items-center gap-3">
          <a href="mailto:${PROFILE_DATA.contact.email}" class="inline-flex items-center text-xs sm:text-sm font-semibold px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 rounded-xl transition shadow-lg shadow-sky-500/25">
            <i class="fas fa-paper-plane mr-2"></i> ${PROFILE_DATA.contact.email}
          </a>
          <a href="profile-original.jpg" target="_blank" class="inline-flex items-center text-xs font-semibold px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition">
            <i class="fas fa-image mr-1.5 text-sky-400"></i> 元のスライド画像を見る
          </a>
        </div>
      </div>
    `;
  }
}
