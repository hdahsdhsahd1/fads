/* =========================================================
   РеалБетон — интерактив
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Sticky header: смена фона при скролле ---------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  /* ---------- Hero слайдер ---------- */
  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;
    var captions = document.querySelectorAll('.hero-caption');
    var dotsWrap = document.querySelector('.hero-dots');
    var dots = [];
    var current = 0;
    var timer = null;
    var interval = 4000;

    // создаём точки
    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); restart(); });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function show(index) {
      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === index);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === index);
      });
      captions.forEach(function (c, i) {
        c.classList.toggle('active', i === index);
      });
      current = index;
    }

    function goTo(index) {
      var n = (index + slides.length) % slides.length;
      show(n);
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(next, interval);
    }

    var nextBtn = document.querySelector('.hero-arrow.next');
    var prevBtn = document.querySelector('.hero-arrow.prev');
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restart(); });

    show(0);
    restart();
  }

  /* ---------- Калькулятор объёма бетона ---------- */
  function initCalculator() {
    var calc = document.getElementById('concrete-calculator');
    if (!calc) return;

    var tabs = calc.querySelectorAll('.calc-tab');
    var gradeSelect = document.getElementById('calc-grade');
    var resultBox = calc.querySelector('.calc-result');
    var volumeEl = document.getElementById('calc-volume');
    var priceEl = document.getElementById('calc-price');

    var prices = {
      'm100': 5000,
      'm150': 5300,
      'm200': 5500,
      'm250': 5900,
      'm300': 6400,
      'm350': 7200
    };

    // переключение табов
    var labelHeight = document.getElementById('label-calc-height');
    var panelStrip = document.getElementById('panel-strip');
    var panelPile = document.getElementById('panel-pile');
    var defaultLabel = labelHeight ? labelHeight.textContent : 'Высота (м)';

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.getAttribute('data-target');

        if (target === 'panel-pile') {
          if (panelStrip) panelStrip.style.display = 'none';
          if (panelPile) panelPile.style.display = 'block';
        } else {
          if (panelStrip) panelStrip.style.display = 'block';
          if (panelPile) panelPile.style.display = 'none';
          if (labelHeight) {
            labelHeight.textContent = target === 'panel-slab' ? 'Толщина (м)' : 'Высота (м)';
          }
        }
        if (resultBox) resultBox.classList.remove('show');
      });
    });

    function readVal(id) {
      var el = document.getElementById(id);
      if (!el) return 0;
      var v = parseFloat(el.value);
      return isNaN(v) ? 0 : v;
    }

    function calcVolume() {
    var type = calc.querySelector('.calc-tab.active').getAttribute('data-target');
    var volume = 0;
    
    // Исправили условие: теперь оно точно совпадает с именем таба 'panel-pile'
    if (type === 'panel-pile' || type === 'pile') { 
        var d = readVal('pile-diameter');
        var n = readVal('pile-count');
        var depth = readVal('pile-depth');
        
        // Считаем объем цилиндрических свай: Пи * Радиус в квадрате * Глубина * Количество
        if (d && n && depth) {
            volume = Math.PI * Math.pow((d / 2), 2) * depth * n;
        }
    } else {
        var len = readVal('calc-length');
        var wid = readVal('calc-width');
        var hei = readVal('calc-height');
        
        if (len && wid && hei) {
            volume = len * wid * hei;
        }
    }
    return volume;
    }

    calc.querySelector('.calc-submit').addEventListener('click', function () {
      var volume = calcVolume();
      var grade = gradeSelect.value;
      var unitPrice = prices[grade] || 0;
      var total = Math.round(volume * unitPrice);

      if (volume <= 0) {
        if (resultBox) resultBox.classList.remove('show');
        alert('Пожалуйста, заполните размеры конструкции.');
        return;
      }

      volumeEl.textContent = volume.toFixed(2).replace('.', ',') + ' м³';
      priceEl.textContent = total.toLocaleString('ru-RU') + ' руб.';
      if (resultBox) resultBox.classList.add('show');
    });
  }

  /* ---------- Аккордеоны ---------- */
  function initAccordions() {
    document.querySelectorAll('.accordion-item').forEach(function (item) {
      var btn = item.querySelector('.accordion-btn');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        // закрываем остальные в этом блоке
        var parent = item.parentElement;
        parent.querySelectorAll('.accordion-item.open').forEach(function (o) {
          if (o !== item) o.classList.remove('open');
        });
        if (isOpen) {
          item.classList.remove('open');
        } else {
          item.classList.add('open');
        }
      });
    });
  }

  /* ---------- Chips «Показать все» ---------- */
  function initChips() {
    document.querySelectorAll('.chip-more').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.chips-wrap');
        if (!wrap) return;
        var hidden = wrap.querySelectorAll('.chip-hidden');
        var isOpen = btn.getAttribute('data-open') === '1';
        if (isOpen) {
          hidden.forEach(function (c) { c.classList.add('chip-hidden'); });
          btn.textContent = 'Показать все';
          btn.setAttribute('data-open', '0');
        } else {
          hidden.forEach(function (c) { c.classList.remove('chip-hidden'); });
          btn.textContent = 'Скрыть';
          btn.setAttribute('data-open', '1');
        }
      });
    });
  }

  /* ---------- Мобильное меню ---------- */
  function initMobileMenu() {
    var burger = document.querySelector('.burger-btn');
    var menu = document.querySelector('.mobile-menu');
    var overlay = document.querySelector('.mobile-overlay');
    var closeBtn = document.querySelector('.mobile-menu .close-btn');
    if (!burger || !menu) return;

    function open() {
      menu.classList.add('open');
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  /* ---------- Формы + toast ---------- */
  function showToast(message) {
    var wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    var msg = document.createElement('div');
    msg.className = 'toast-msg';
    msg.textContent = message;
    wrap.appendChild(msg);
    requestAnimationFrame(function () { msg.classList.add('show'); });
    setTimeout(function () {
      msg.classList.remove('show');
      setTimeout(function () { msg.remove(); }, 400);
    }, 3500);
  }

  function initForms() {
    document.querySelectorAll('form[data-form-name]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            
            var name = form.getAttribute('data-form-name');
            var formData = new FormData(form);

            // Реальная отправка данных на Web3Forms
            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    // Покажет красивое всплывающее окно самого шаблона
                    showToast('Спасибо! Ваша заявка («' + name + '») отправлена. Мы свяжемся с вами.');
                    form.reset();
                } else {
                    showToast('Ошибка отправки. Попробуйте еще раз через контакты.');
                }
            })
            .catch(function(error) {
                showToast('Ошибка соединения. Проверьте интернет.');
                console.error(error);
            });
        });
    });
}


  /* ---------- Плавный скролл по якорям (fallback) ---------- */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- Lazy load для фото ниже первого экрана ---------- */
  function initLazyLoad() {
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
    });
  }

  /* ---------- Инициализация ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initHeroSlider();
    initCalculator();
    initAccordions();
    initChips();
    initMobileMenu();
    initForms();
    initSmoothAnchors();
    initLazyLoad();
  });
})();