let score = 0;
let lives = 3;
let streak = 0;
let timer;
let timeLeft;
let level = 1;
let correctInLevel = 0;
let timePerQuestion = 10; // 第一关 10 秒

// UI elements
const el = {
  word: document.getElementById("word"),
  options: document.getElementById("options"),
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  level: document.getElementById("level"),
  progress: document.getElementById("progress"),
  timerText: document.getElementById("timer"),
  timerBar: document.getElementById("timerBarFill"),
  progressBar: document.getElementById("progressBarFill"),
  startOverlay: document.getElementById("startOverlay"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  runner: document.getElementById("runner"),
  milestones: document.getElementById("milestones"),
  rewardOverlay: document.getElementById("rewardOverlay"),
  continueBtn: document.getElementById("continueBtn")
};

function startGame() {
  if (lives <= 0) {
    alert("💀 游戏结束！最终得分：" + score + " | 通关数：" + (level - 1));
    showStartOverlay();
    resetGame();
    return;
  }

  if (correctInLevel >= 10) {
    showReward();
    return;
  }

  const current = words[Math.floor(Math.random() * words.length)];
  // 显示单词并淡入
  el.word.textContent = current.en;
  el.word.classList.remove('show');
  void el.word.offsetWidth;
  el.word.classList.add('show');
  // 清空并准备选项
  el.options.innerHTML = "";
  el.options.classList.remove('is-visible');

  // 生成三个选项
  const options = [current.cn];
  while (options.length < 3) {
    const random = words[Math.floor(Math.random() * words.length)].cn;
    if (!options.includes(random)) options.push(random);
  }
  options.sort(() => Math.random() - 0.5);

  // 重置计时UI但不启动
  clearInterval(timer);
  timeLeft = timePerQuestion;
  el.timerText.textContent = timeLeft + "秒";
  updateTimerBar();

  // 渲染选项并启动倒计时
  const renderOptions = () => {
    el.options.classList.remove('is-visible');
    el.options.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = opt;
      btn.onclick = () => {
        clearInterval(timer);
        if (opt === current.cn) {
          streak++;
          correctInLevel++;
          let gained = 10;
          if (streak % 3 === 0) {
            gained += 20; // 连续奖励
            alert("🔥 连续答对奖励 +20 分！");
          }
          score += gained;
        } else {
          streak = 0;
          lives--;
          alert("❌ 错误！正确答案：" + current.cn);
        }
        updateStatus();
        startGame();
      };
      el.options.appendChild(btn);
    });

    // 触发一次强制重绘以确保过渡从头开始
    void el.options.offsetWidth;
    el.options.classList.add('is-visible');
  };
  // 立即渲染选项并启动计时
  renderOptions();
  clearInterval(timer);
  timeLeft = timePerQuestion;
  el.timerText.textContent = timeLeft + "秒";
  updateTimerBar();
  timer = setInterval(() => {
    timeLeft--;
    el.timerText.textContent = Math.max(timeLeft, 0) + "秒";
    updateTimerBar();
    if (timeLeft <= 0) {
      clearInterval(timer);
      lives--;
      streak = 0;
      updateStatus();
      alert("⏰ 超时！请重新点击开始下一题。");
      startGame();
    }
  }, 1000);
}

function updateTimerBar() {
  const percent = Math.max(0, Math.min(100, (timeLeft / timePerQuestion) * 100));
  el.timerBar.style.width = percent + "%";
}

function updateStatus() {
  el.score.textContent = String(score);
  el.lives.textContent = String(lives);
  el.level.textContent = String(level);
  el.progress.textContent = correctInLevel + "/10";
  const p = Math.max(0, Math.min(100, (correctInLevel / 10) * 100));
  el.progressBar.style.width = p + "%";
  updateRunner();
}

function resetGame() {
  clearInterval(timer);
  score = 0;
  lives = 3;
  streak = 0;
  level = 1;
  correctInLevel = 0;
  timePerQuestion = 10;
  el.timerText.textContent = timePerQuestion + "秒";
  updateStatus();
  updateTimerBar();
  updateRunner();
  // 单词卡为静态样式，无需复位 3D 状态
  el.options.classList.remove('is-visible');
}

function nextLevel() {
  alert("🎉 恭喜过关！进入第 " + (level + 1) + " 关！");
  level++;
  correctInLevel = 0;
  timePerQuestion = Math.max(4, timePerQuestion - 2); // 每关减少2秒，最低4秒
  score += 50; // 过关奖励
  updateStatus();
  startGame();
}

function showReward() {
  clearInterval(timer);
  if (el.rewardOverlay) el.rewardOverlay.classList.add("visible");
}

function hideReward() {
  if (el.rewardOverlay) el.rewardOverlay.classList.remove("visible");
}

function updateRunner() {
  if (!el.runner || !el.milestones) return;
  const dots = Array.from(el.milestones.querySelectorAll('.dot'));
  if (!dots.length) return;

  const clamped = Math.max(0, Math.min(correctInLevel, dots.length));
  const targetIndex = clamped === 0 ? 0 : clamped - 1;
  const targetDot = dots[targetIndex];

  const track = el.runner.parentElement;
  if (!track) return;
  const trackRect = track.getBoundingClientRect();
  const dotRect = targetDot.getBoundingClientRect();
  const center = dotRect.left - trackRect.left + dotRect.width / 2;
  el.runner.style.left = center + "px";

  dots.forEach((d) => {
    const step = Number(d.getAttribute('data-step'));
    if (step <= correctInLevel) d.classList.add('active'); else d.classList.remove('active');
  });
}

function showStartOverlay() {
  el.startOverlay.classList.add("visible");
}

function hideStartOverlay() {
  el.startOverlay.classList.remove("visible");
}

// Init UI events
el.startBtn.addEventListener("click", () => {
  hideStartOverlay();
  resetGame();
  startGame();
});

el.restartBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

if (el.continueBtn) {
  el.continueBtn.addEventListener("click", () => {
    hideReward();
    nextLevel();
  });
}

// Initial state
resetGame();

// --- Sound: subtle flip using WebAudio beep ---
let audioCtx;
function playFlip() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}
