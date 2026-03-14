/**
 * Performance Monitor для тестирования FPS и производительности
 * Используется для проверки требования ≥30 FPS на мобильных устройствах
 */

class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frames = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.isMonitoring = false;
    this.fpsCounter = null;
  }

  /**
   * Начать мониторинг FPS
   */
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.createFPSCounter();
    this.measureFPS();
    
    console.log('🎮 Performance Monitor started');
    console.log('📊 Monitoring FPS...');
  }

  /**
   * Остановить мониторинг FPS
   */
  stop() {
    this.isMonitoring = false;
    if (this.fpsCounter) {
      this.fpsCounter.remove();
      this.fpsCounter = null;
    }
    
    const avgFPS = this.getAverageFPS();
    const minFPS = Math.min(...this.fpsHistory);
    const maxFPS = Math.max(...this.fpsHistory);
    
    console.log('🎮 Performance Monitor stopped');
    console.log(`📊 Average FPS: ${avgFPS.toFixed(2)}`);
    console.log(`📊 Min FPS: ${minFPS.toFixed(2)}`);
    console.log(`📊 Max FPS: ${maxFPS.toFixed(2)}`);
    console.log(`✅ Target: ≥30 FPS - ${avgFPS >= 30 ? 'PASSED' : 'FAILED'}`);
    
    return {
      average: avgFPS,
      min: minFPS,
      max: maxFPS,
      passed: avgFPS >= 30
    };
  }

  /**
   * Создать визуальный счетчик FPS
   */
  createFPSCounter() {
    this.fpsCounter = document.createElement('div');
    this.fpsCounter.className = 'fps-counter';
    this.fpsCounter.textContent = 'FPS: --';
    document.body.appendChild(this.fpsCounter);
  }

  /**
   * Измерить FPS
   */
  measureFPS() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frames++;

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
      this.fpsHistory.push(this.fps);
      
      // Обновить визуальный счетчик
      if (this.fpsCounter) {
        this.fpsCounter.textContent = `FPS: ${this.fps}`;
        
        // Изменить цвет в зависимости от FPS
        if (this.fps >= 50) {
          this.fpsCounter.style.background = 'rgba(180, 248, 200, 0.9)'; // Зеленый
        } else if (this.fps >= 30) {
          this.fpsCounter.style.background = 'rgba(255, 170, 213, 0.9)'; // Желтый
        } else {
          this.fpsCounter.style.background = 'rgba(255, 20, 147, 0.9)'; // Красный
        }
      }

      this.frames = 0;
      this.lastTime = currentTime;
    }

    requestAnimationFrame(() => this.measureFPS());
  }

  /**
   * Получить средний FPS
   */
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 0;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }

  /**
   * Получить текущий FPS
   */
  getCurrentFPS() {
    return this.fps;
  }

  /**
   * Проверить, соответствует ли FPS требованиям
   */
  checkRequirements() {
    const avgFPS = this.getAverageFPS();
    return {
      passed: avgFPS >= 30,
      fps: avgFPS,
      message: avgFPS >= 30 
        ? `✅ FPS requirement met: ${avgFPS.toFixed(2)} FPS` 
        : `❌ FPS requirement not met: ${avgFPS.toFixed(2)} FPS (target: ≥30 FPS)`
    };
  }
}

/**
 * Тестирование читаемости контента
 */
class ReadabilityTester {
  constructor() {
    this.testResults = [];
  }

  /**
   * Проверить читаемость при максимальной интенсивности
   */
  testMaxIntensity() {
    console.log('📖 Testing readability at maximum intensity...');
    
    // Добавить класс максимальной интенсивности
    document.body.classList.add('glitch-intense');
    
    // Подождать 5 секунд для визуальной проверки
    setTimeout(() => {
      const result = confirm(
        'Можете ли вы прочитать этот текст?\n\n' +
        'Нажмите OK, если текст читаем.\n' +
        'Нажмите Cancel, если текст нечитаем.'
      );
      
      this.testResults.push({
        test: 'Maximum Intensity',
        passed: result,
        timestamp: new Date().toISOString()
      });
      
      console.log(result ? '✅ Readability test PASSED' : '❌ Readability test FAILED');
      
      // Убрать класс
      document.body.classList.remove('glitch-intense');
    }, 5000);
  }

  /**
   * Проверить читаемость на мобильных устройствах
   */
  testMobileReadability() {
    console.log('📱 Testing mobile readability...');
    
    const isMobile = window.innerWidth < 768;
    
    if (!isMobile) {
      console.log('⚠️ Not on mobile device. Simulating mobile viewport...');
      // Симулировать мобильный viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=375');
      }
    }
    
    // Проверить размер шрифта
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const fontSizeTest = fontSize >= 12;
    
    console.log(`Font size: ${fontSize}px - ${fontSizeTest ? '✅ PASSED' : '❌ FAILED'} (target: ≥12px)`);
    
    this.testResults.push({
      test: 'Mobile Font Size',
      passed: fontSizeTest,
      value: fontSize,
      timestamp: new Date().toISOString()
    });
    
    return fontSizeTest;
  }

  /**
   * Получить результаты тестов
   */
  getResults() {
    return this.testResults;
  }

  /**
   * Вывести отчет
   */
  printReport() {
    console.log('\n📊 READABILITY TEST REPORT');
    console.log('═'.repeat(50));
    
    this.testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.test}`);
      console.log(`   Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (result.value !== undefined) {
        console.log(`   Value: ${result.value}`);
      }
      console.log(`   Time: ${result.timestamp}`);
    });
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    
    console.log('\n' + '═'.repeat(50));
    console.log(`Total: ${passedTests}/${totalTests} tests passed`);
    console.log('═'.repeat(50) + '\n');
  }
}

/**
 * Тестирование кроссбраузерности
 */
class BrowserTester {
  constructor() {
    this.browser = this.detectBrowser();
  }

  /**
   * Определить браузер
   */
  detectBrowser() {
    const ua = navigator.userAgent;
    
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Edge')) return 'Edge';
    
    return 'Unknown';
  }

  /**
   * Проверить поддержку CSS свойств
   */
  testCSSSupport() {
    console.log(`🌐 Testing CSS support in ${this.browser}...`);
    
    const tests = {
      'backdrop-filter': CSS.supports('backdrop-filter', 'blur(1px)'),
      'mix-blend-mode': CSS.supports('mix-blend-mode', 'screen'),
      'clip-path': CSS.supports('clip-path', 'inset(0)'),
      'filter': CSS.supports('filter', 'hue-rotate(0deg)'),
      'animation': CSS.supports('animation', 'test 1s'),
      'transform': CSS.supports('transform', 'translateZ(0)'),
      'will-change': CSS.supports('will-change', 'transform')
    };
    
    console.log('\nCSS Support:');
    Object.entries(tests).forEach(([property, supported]) => {
      console.log(`  ${property}: ${supported ? '✅' : '❌'}`);
    });
    
    return tests;
  }

  /**
   * Получить информацию о браузере
   */
  getBrowserInfo() {
    return {
      name: this.browser,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      isMobile: window.innerWidth < 768
    };
  }

  /**
   * Вывести информацию о браузере
   */
  printInfo() {
    const info = this.getBrowserInfo();
    
    console.log('\n🌐 BROWSER INFORMATION');
    console.log('═'.repeat(50));
    console.log(`Browser: ${info.name}`);
    console.log(`Viewport: ${info.viewport.width}x${info.viewport.height}`);
    console.log(`Device Pixel Ratio: ${info.devicePixelRatio}`);
    console.log(`Mobile: ${info.isMobile ? 'Yes' : 'No'}`);
    console.log('═'.repeat(50) + '\n');
  }
}

// Экспортировать для использования в консоли
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.ReadabilityTester = ReadabilityTester;
  window.BrowserTester = BrowserTester;
  
  // Создать глобальные экземпляры для удобства
  window.perfMonitor = new PerformanceMonitor();
  window.readabilityTester = new ReadabilityTester();
  window.browserTester = new BrowserTester();
  
  // Вывести инструкции в консоль
  console.log('\n🎮 PERFORMANCE TESTING TOOLS LOADED');
  console.log('═'.repeat(50));
  console.log('\nAvailable commands:');
  console.log('  perfMonitor.start()           - Start FPS monitoring');
  console.log('  perfMonitor.stop()            - Stop FPS monitoring');
  console.log('  perfMonitor.checkRequirements() - Check if FPS meets requirements');
  console.log('\n  readabilityTester.testMaxIntensity() - Test readability at max intensity');
  console.log('  readabilityTester.testMobileReadability() - Test mobile readability');
  console.log('  readabilityTester.printReport() - Print test report');
  console.log('\n  browserTester.testCSSSupport() - Test CSS feature support');
  console.log('  browserTester.printInfo()      - Print browser information');
  console.log('\n═'.repeat(50) + '\n');
}
