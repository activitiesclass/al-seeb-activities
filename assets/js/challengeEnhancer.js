/**
 * 💡 ChallengeEnhancer Pro
 * النسخة الاحترافية من نظام تعزيز تجربة التحديات الصفية
 * تشمل: إشعارات فورية، أصوات ذكية، مؤثرات احتفالية، وتعليقات صوتية تفاعلية
 */

class ChallengeEnhancer {
  constructor(activityName = 'نشاط التحديات') {
    this.name = activityName;
    this.soundEnabled = true;
    this.voiceHintsEnabled = true;
    this.soundsPath = '../assets/media/sounds/';
    this.kingdomSoundsPath = '../assets/media/sounds/kingdom-sounds/';
    this.voicePhrases = [
      'أداء رائع!',
      'أنت على الطريق الصحيح!',
      'المنافسة تشتعل!',
      'لا تتوقف الآن!',
      'حافظ على هذا المستوى!',
      'أعطي كل ما لديك!',
      'تحدي نفسك أكثر!',
      'الفوز في متناول يدك!'
    ];
    this.motivationalCycleId = null;
    this.toastQueue = [];
    this.isProcessingToasts = false;
    
    // إضافة CSS للتوست
    this.injectCSS();
    
    console.log(`🎮 تم تهيئة ChallengeEnhancer للنشاط: ${this.name}`);
  }

  // حقن CSS للتوست والتأثيرات
  injectCSS() {
    if (document.getElementById('challenge-enhancer-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'challenge-enhancer-styles';
    style.textContent = `
      .toast {
        min-width: 300px;
        max-width: 400px;
        margin-bottom: 10px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .toast.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .toast-success {
        background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(25, 135, 84, 0.9));
        color: white;
      }
      
      .toast-info {
        background: linear-gradient(135deg, rgba(13, 202, 240, 0.9), rgba(13, 110, 253, 0.9));
        color: white;
      }
      
      .toast-warning {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 143, 0, 0.9));
        color: #212529;
      }
      
      .toast-error {
        background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(157, 35, 49, 0.9));
        color: white;
      }
      
      .toast-header {
        padding: 12px 16px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
      }
      
      .toast-body {
        padding: 0 16px 12px;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .toast button {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .toast button:hover {
        opacity: 1;
      }
      
      .celebration-burst {
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        animation: celebrationBurst 2s ease-out forwards;
      }
      
      @keyframes celebrationBurst {
        0% {
          transform: scale(0) rotate(0deg);
          opacity: 1;
        }
        50% {
          transform: scale(1.5) rotate(180deg);
          opacity: 0.8;
        }
        100% {
          transform: scale(3) rotate(360deg);
          opacity: 0;
        }
      }
      
      .motivational-pulse {
        animation: motivationalPulse 2s ease-in-out infinite;
      }
      
      @keyframes motivationalPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.9; }
      }
      
      .hover-sound-enabled {
        transition: all 0.2s ease;
      }
      
      .hover-sound-enabled:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  // تشغيل ملف صوتي من المسار المخصص مع نظام احتياطي
  playSound(filename, volume = 0.7, useKingdomSounds = false) {
    if (!this.soundEnabled) return;
    
    const basePath = useKingdomSounds ? this.kingdomSoundsPath : this.soundsPath;
    const fullPath = basePath + filename;
    
    try {
      const audio = new Audio(fullPath);
      audio.volume = Math.min(Math.max(volume, 0), 1); // تحديد النطاق بين 0 و 1
      
      // نظام احتياطي في حالة فشل التحميل
      audio.addEventListener('error', () => {
        console.warn(`فشل في تحميل الصوت: ${fullPath}`);
        // جرب الصوت الاحتياطي
        const fallbackAudio = new Audio(this.soundsPath + 'Click.mp3');
        fallbackAudio.volume = volume * 0.5;
        fallbackAudio.play().catch(() => {});
      });
      
      audio.play().catch(e => {
        console.warn('فشل في تشغيل الصوت:', e);
      });
    } catch (e) {
      console.warn('خطأ في إنشاء كائن الصوت:', e);
    }
  }

  // قراءة صوتية عشوائية مع دعم العربية
  speakRandomHint() {
    if (!this.voiceHintsEnabled || !window.speechSynthesis) return;
    
    // إيقاف أي كلام سابق
    speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance();
    msg.lang = 'ar-SA';
    msg.rate = 0.9;
    msg.pitch = 1.1;
    msg.volume = 0.8;
    msg.text = this.voicePhrases[Math.floor(Math.random() * this.voicePhrases.length)];
    
    // التعامل مع الأخطاء
    msg.onerror = (e) => {
      console.warn('خطأ في التحدث:', e);
    };
    
    speechSynthesis.speak(msg);
  }

  // إشعار تفاعلي محسن مع نظام طابور
  showToast(title, body, type = 'info', duration = 4000) {
    const toast = {
      title,
      body,
      type,
      duration,
      id: Date.now() + Math.random()
    };
    
    this.toastQueue.push(toast);
    
    if (!this.isProcessingToasts) {
      this.processToastQueue();
    }
  }

  // معالج طابور التوست لتجنب التراكم
  processToastQueue() {
    if (this.toastQueue.length === 0) {
      this.isProcessingToasts = false;
      return;
    }
    
    this.isProcessingToasts = true;
    const toast = this.toastQueue.shift();
    this.displayToast(toast);
    
    // معالجة التوست التالي بعد فترة قصيرة
    setTimeout(() => {
      this.processToastQueue();
    }, 500);
  }

  // عرض التوست الفعلي
  displayToast(toastData) {
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${toastData.type}`;
    toastEl.innerHTML = `
      <div class="toast-header">
        <strong>${toastData.title}</strong>
        <button onclick="this.closest('.toast').remove()">&times;</button>
      </div>
      <div class="toast-body">${toastData.body}</div>
    `;
    
    // تحديد موقع التوست
    Object.assign(toastEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999
    });
    
    // حساب الموضع بناءً على التوستات الموجودة
    const existingToasts = document.querySelectorAll('.toast');
    let topOffset = 20;
    existingToasts.forEach(existing => {
      topOffset += existing.offsetHeight + 10;
    });
    toastEl.style.top = topOffset + 'px';
    
    document.body.appendChild(toastEl);
    
    // تأثير الظهور
    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });
    
    // إزالة تلقائية
    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.remove();
        }
      }, 300);
    }, toastData.duration);
  }

  // مؤثر احتفالي متكامل مع تأثيرات بصرية
  celebrateWin(playerName) {
    // تشغيل الأصوات
    this.playSound('win.mp3');
    setTimeout(() => {
      this.playSound('fireworks-burst.mp3', 0.6, true);
    }, 500);
    
    // تعليق صوتي
    setTimeout(() => {
      this.speakRandomHint();
    }, 1000);
    
    // إشعار التهنئة
    this.showToast('🏆 تهانينا!', `${playerName} فاز بالتحدي!`, 'success', 6000);
    
    // تأثير الانفجار البصري
    this.createCelebrationBurst();
    
    // مؤثر الكونفيتي إذا كان متاحاً
    if (window.confetti) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
      });
      
      // انفجار ثاني بعد ثانية
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#FFA726', '#EF5350', '#42A5F5', '#66BB6A']
        });
      }, 1000);
    }
  }

  // إنشاء انفجار احتفالي مخصص
  createCelebrationBurst() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const burst = document.createElement('div');
        burst.className = 'celebration-burst';
        burst.innerHTML = ['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)];
        burst.style.left = Math.random() * window.innerWidth + 'px';
        burst.style.top = Math.random() * window.innerHeight + 'px';
        burst.style.fontSize = (Math.random() * 30 + 20) + 'px';
        
        document.body.appendChild(burst);
        
        setTimeout(() => {
          if (burst.parentNode) {
            burst.remove();
          }
        }, 2000);
      }, i * 200);
    }
  }

  // تحفيز بناءً على النقاط مع منطق محسن
  checkMilestones(score, playerName) {
    if (score === 0) {
      this.showToast('🚀 تشجيع!', `${playerName}، البداية صعبة لكن النهاية جميلة!`, 'warning', 3000);
      this.playSound('notification-pop.mp3', 0.4, true);
    } else if (score === 1) {
      this.showToast('🌟 البداية!', `${playerName} حصل على أول نقطة!`, 'info', 3000);
      this.playSound('crystal-ping.mp3', 0.5, true);
    } else if (score === 3) {
      this.showToast('🔥 تقدم رائع!', `${playerName} يشق طريقه للنجاح!`, 'info', 3500);
      this.playSound('level-up.mp3', 0.6, true);
    } else if (score === 5) {
      this.showToast('⚡ نصف الطريق!', `${playerName} وصل إلى ${score} نقاط!`, 'info', 4000);
      this.playSound('achievement-unlock.mp3', 0.7, true);
      this.speakRandomHint();
    } else if (score === 8) {
      this.showToast('🎯 قريب جداً!', `${playerName} على وشك تحقيق إنجاز عظيم!`, 'warning', 4500);
      this.playSound('epic-charge.mp3', 0.8, true);
    } else if (score >= 10) {
      this.celebrateWin(playerName);
    }
  }

  // اهتزاز الأزرار عند المرور عليها مع أصوات
  attachHoverSound(buttonSelector = '.btn, button, .clickable') {
    document.querySelectorAll(buttonSelector).forEach(btn => {
      btn.classList.add('hover-sound-enabled');
      
      btn.addEventListener('mouseenter', () => {
        this.playSound('button-hover.mp3', 0.2, true);
      });
      
      btn.addEventListener('click', () => {
        this.playSound('cosmic-click.mp3', 0.4, true);
      });
    });
  }

  // إظهار إشعار متسلسل للتحفيز مع ذكاء
  startMotivationalCycle(interval = 25000) {
    if (this.motivationalCycleId) {
      clearInterval(this.motivationalCycleId);
    }
    
    const phrases = [
      '💡 تذكر: النقطة القادمة قد تغير النتيجة!',
      '📊 تابع تقدمك على لوحة النتائج!',
      '🧠 ركز، فأنت قريب من الفوز!',
      '⚡ التحدي لا ينتهي إلا مع آخر ثانية!',
      '🎯 كل محاولة تقربك أكثر من الهدف!',
      '🔥 الإصرار هو مفتاح النجاح!',
      '⭐ أنت أقوى مما تعتقد!',
      '🌟 التحدي الحقيقي مع نفسك!'
    ];
    
    let phraseIndex = 0;
    
    this.motivationalCycleId = setInterval(() => {
      // تجنب الإشعارات أثناء النشاط المكثف
      const isUserActive = document.hasFocus() && 
                          (Date.now() - this.lastInteractionTime < 5000);
      
      if (!isUserActive) return;
      
      const text = phrases[phraseIndex % phrases.length];
      this.showToast('💡 تحفيز ذكي', text, 'info', 5000);
      this.playSound('mystic-wind.mp3', 0.3, true);
      
      phraseIndex++;
    }, interval);
  }

  // إيقاف دورة التحفيز
  stopMotivationalCycle() {
    if (this.motivationalCycleId) {
      clearInterval(this.motivationalCycleId);
      this.motivationalCycleId = null;
    }
  }

  // تتبع التفاعل الأخير
  trackUserInteraction() {
    this.lastInteractionTime = Date.now();
  }

  // تفعيل/إيقاف الأصوات
  toggleSounds() {
    this.soundEnabled = !this.soundEnabled;
    const status = this.soundEnabled ? 'تم تفعيل' : 'تم إيقاف';
    this.showToast('🔊 إعدادات الصوت', `${status} الأصوات`, 'info', 2000);
    return this.soundEnabled;
  }

  // تفعيل/إيقاف التعليقات الصوتية
  toggleVoiceHints() {
    this.voiceHintsEnabled = !this.voiceHintsEnabled;
    const status = this.voiceHintsEnabled ? 'تم تفعيل' : 'تم إيقاف';
    this.showToast('🗣️ التعليقات الصوتية', `${status} التعليقات الصوتية`, 'info', 2000);
    return this.voiceHintsEnabled;
  }

  // إضافة تأثير النبض التحفيزي لعنصر
  addMotivationalPulse(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.classList.add('motivational-pulse');
      setTimeout(() => {
        element.classList.remove('motivational-pulse');
      }, 4000);
    }
  }

  // رسالة ترحيب مخصصة
  showWelcomeMessage(playerName) {
    this.showToast(
      `🎮 مرحباً ${playerName}!`,
      'استعد لتحدي مثير ومليء بالمفاجآت!',
      'info',
      5000
    );
    this.playSound('welcome.mp3', 0.6);
    setTimeout(() => {
      this.speakRandomHint();
    }, 2000);
  }

  // تنظيف الموارد
  destroy() {
    this.stopMotivationalCycle();
    
    // إزالة جميع التوستات
    document.querySelectorAll('.toast').forEach(toast => {
      toast.remove();
    });
    
    // إيقاف التحدث
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
    
    console.log(`🎮 تم تنظيف موارد ChallengeEnhancer للنشاط: ${this.name}`);
  }
}

// تصدير الكلاس للاستخدام العام
window.ChallengeEnhancer = ChallengeEnhancer;

// مثال سريع للاستخدام
/*
const enhancer = new ChallengeEnhancer('تحدي الرياضيات');
enhancer.showWelcomeMessage('أحمد');
enhancer.playSound('start-timer.mp3');
enhancer.speakRandomHint();
enhancer.celebrateWin('نورة');
enhancer.checkMilestones(10, 'خالد');
enhancer.attachHoverSound();
enhancer.startMotivationalCycle();
*/
