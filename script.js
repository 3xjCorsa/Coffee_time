// Очікуємо, поки браузер повністю завантажить усю HTML-сторінку, і тільки тоді запускаємо наш JS.
// Це потрібно, щоб скрипт випадково не спробував знайти кнопку або блок, якого ще немає на екрані.
document.addEventListener('DOMContentLoaded', function() {

  // ---------- 1. ШАПКА САЙТУ: Зміна фону при прокручуванні ----------
  // Знаходимо елемент нашої навігації (шапку) за його ID
  const nav = document.getElementById('nav');
  
  // Якщо такий елемент є на цій сторінці (наприклад, ми не на іншій сторінці без шапки)
  if (nav) {
    // Кажемо браузеру "слухати" прокручування (скрол) сторінки
    window.addEventListener('scroll', function() {
      // Якщо сторінку прокрутили вниз більше ніж на 40 пікселів (window.scrollY > 40)
      if (window.scrollY > 40) {
        nav.classList.add('scrolled'); // Додаємо клас 'scrolled' (в CSS він змінює фон шапки)
      } else {
        nav.classList.remove('scrolled'); // Якщо повернулися на самий верх  видаляємо цей клас
      }
    });
  }

  // ---------- 2. ДАНІ: Наше меню з цінами ----------
  // Створюємо об'єкт (словник), де зберігаємо інформацію про напої. 
  // Ключі (espresso, latte...) допоможуть нам швидко знаходити потрібний товар.
  const MENU = {
    espresso:   { name: 'Espresso',   price: 3.5 },
    latte:      { name: 'Latte',      price: 4.5 },
    cappuccino: { name: 'Cappuccino', price: 4.2 },
    flatwhite:  { name: 'Flat White', price: 4.8 }
  };

  // Тут ми будемо зберігати поточний стан нашої програми:
  // qty  скільки порцій напою користувач вибрав на лічильнику (наприклад: espresso: 1)
  // cart  скільки порцій вже реально додано в кошик покупок (наприклад: espresso: 3)
  const state = { 
    qty: {}, 
    cart: {} 
  };

  // Робимо початкове налаштування: для кожного напою з нашого MENU ставимо початкову кількість 1
  for (const id in MENU) {
    state.qty[id] = 1;
  }

  // ---------- 3. КНОПКА: Перехід до секції замовлення ----------
  // Знаходимо кнопку замовлення (посилання) за допомогою CSS-селектора
  const orderBtn = document.querySelector('.section-group-book .link-btn');
  // Знаходимо саму секцію замовлення, куди треба прокрутити екран
  const orderSection = document.getElementById('sectionOrder');

  // Перевіряємо, чи є кнопка і секція на сторінці
  if (orderBtn && orderSection) {
    // Обробляємо клік по кнопці
    orderBtn.addEventListener('click', function(event) {
      event.preventDefault(); // Скасовуємо стандартний стрибок посилання, щоб сторінка не смикалася
      orderSection.classList.add('active'); // Додаємо клас 'active', щоб зробити секцію замовлення видимою
      
      // Плавно прокручуємо екран користувача до початку секції замовлення
      orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ---------- 4. КНОПКИ КІЛЬКОСТІ ТА ДОДАВАННЯ В КОШИК ----------
  if (orderSection) {
    // Вішаємо один обробник кліків на всю велику секцію замовлення (це називається "делегування подій")
    orderSection.addEventListener('click', function(event) {
      
      // Перевіряємо, чи клікнули ми по кнопці зменшення кількості "-", або по елементу всередині неї
      const decBtn = event.target.closest('[data-act="dec"]');
      // Перевіряємо, чи клікнули по кнопці збільшення кількості "+"
      const incBtn = event.target.closest('[data-act="inc"]');
      // Перевіряємо, чи клікнули по кнопці додавання в кошик "Add"
      const addBtn = event.target.closest('[data-add]');

      // ЯКЩО КЛІКНУЛИ НА КНОПКУ СТРУКТУРИ "-"
      if (decBtn) {
        const id = decBtn.dataset.id; // Отримуємо ID напою з атрибута data-id="..."
        // Зменшуємо кількість у нашому стані на 1 порцію
        state.qty[id] = state.qty[id] - 1;
        // Але якщо кількість стала меншою за 1, примусово повертаємо 1 (бо не можна замовити 0 або мінус 2 кави)
        if (state.qty[id] < 1) {
          state.qty[id] = 1;
        }
        // Знаходимо на сторінці циферку цього лічильника і міняємо її текст на новий
        document.getElementById('qty-' + id).textContent = state.qty[id];
      }

      // ЯКЩО КЛІКНУЛИ НА КНОПКУ СТРУКТУРИ "+"
      if (incBtn) {
        const id = incBtn.dataset.id; // Отримуємо ID напою
        // Збільшуємо кількість у нашому стані на 1 порцію
        state.qty[id] = state.qty[id] + 1;
        // Обмежуємо максимальну кількість: не більше 9 порцій за один раз
        if (state.qty[id] > 9) {
          state.qty[id] = 9;
        }
        // Оновлюємо циферку на екрані
        document.getElementById('qty-' + id).textContent = state.qty[id];
      }

      // ЯКЩО КЛІКНУЛИ НА КНОПКУ "ADD" (ДОДАТИ В КОШИК)
      if (addBtn) {
        const id = addBtn.dataset.add; // Дізнаємося, який саме напій додають (з атрибута data-add)
        const itemData = MENU[id]; // Беремо інформацію про цей напій з нашого меню (назва, ціна)
        const currentQty = state.qty[id]; // Дивимося, скільки порцій зараз виставлено на лічильнику

        // Якщо цього напою в кошику ще взагалі не було, JS поверне undefined. 
        // Тому ми пишемо: якщо там порожньо (або 0), ставимо 0, і додаємо нову кількість.
        if (!state.cart[id]) {
          state.cart[id] = 0;
        }
        state.cart[id] = state.cart[id] + currentQty;

        renderCart(); // Запускаємо функцію, яка перемалює кошик на екрані з новими даними
        
        // Показуємо красиве сповіщення знизу (наприклад: "2 × Latte added to your order")
        showToast(currentQty + ' × ' + itemData.name + ' added to your order');

        // Робимо візуальний ефект для кнопки, щоб користувач бачив, що товар зберігся
        addBtn.classList.add('added'); // Додаємо клас зеленої кнопки або галочки
        addBtn.textContent = 'Added'; // Міняємо текст на "Додано"
        
        // Рівно через 900 мілісекунд (менше секунди) повертаємо кнопці початковий вигляд
        setTimeout(function() {
          addBtn.classList.remove('added');
          addBtn.textContent = 'Add';
        }, 900);
      }
      
    });
  }

  // ---------- 5. ФУНКЦІЯ: Відображення кошика на екрані ----------
  function renderCart() {
    const container = document.getElementById('cartItems'); // Блок, куди ми вставимо список покупок
    const totalWrap = document.getElementById('cartTotal'); // Блок, де показується підсумкова ціна
    
    // Якщо цих блоків немає на поточній сторінці, просто виходимо з функції
    if (!container || !totalWrap) {
      return;
    }

    // Перевіримо, чи є хоча б щось у нашому кошику
    let hasItems = false;
    for (const id in state.cart) {
      if (state.cart[id] > 0) {
        hasItems = true; // Знайшли товар, у якого кількість більша за нуль!
      }
    }

    // Якщо кошик абсолютно порожній
    if (hasItems === false) {
      // Показуємо повідомлення, що нічого не додано (замінено '—' на два пробіли)[cite: 1]
      container.innerHTML = '<p class="cart-empty">No drinks added yet  pick something from the menu above.</p>';
      totalWrap.style.display = 'none'; // Ховаємо блок з підсумковою ціною
      return; // Виходимо з функції
    }

    let totalSum = 0; // Змінна, куди ми будемо плюсувати гроші за кожну каву
    let cartHTML = ''; // Рядок, куди ми будемо склеювати HTML-код для кожного рядка товарів

    // Проходимо циклом по кошику і створюємо HTML-рядки для кожного напою
    for (const id in state.cart) {
      const qtyInCart = state.cart[id]; // Скільки порцій цієї кави в кошику

      // Якщо кількість більша за 0, показуємо цей товар
      if (qtyInCart > 0) {
        const itemData = MENU[id]; // Беремо назву та ціну з меню
        const linePrice = itemData.price * qtyInCart; // Рахуємо вартість: ціна помножена на кількість
        totalSum = totalSum + linePrice; // Додаємо цю суму до загального підсумку замовлення

        // Дописуємо шматочок HTML-коду для цієї позиції у загальну змінну cartHTML
        cartHTML = cartHTML + `
          <div class="cart-row">
            <div class="cart-row-left">
              <span class="qty">${qtyInCart}</span>
              <span class="cart-row-name">${itemData.name}</span>
            </div>
            <div style="display:flex; align-items:center; gap:16px;">
              <span class="cart-row-price">$${linePrice.toFixed(2)}</span>
              <button type="button" class="cart-remove" data-remove="${id}">remove</button>
            </div>
          </div>
        `;
      }
    }

    container.innerHTML = cartHTML; // Вставляємо весь згенерований HTML-код списку товарів всередину кошика
    totalWrap.style.display = 'flex'; // Робимо блок підсумкової ціни видимим
    
    // Записуємо підсумкову вартість у потрібне поле. .toFixed(2) округлює число до 2 знаків після коми (наприклад, 12.50)
    document.getElementById('cartTotalValue').textContent = '$' + totalSum.toFixed(2);
  }

  // ---------- 6. КНОПКА: Видалення товару з кошика ----------
  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    // Слухаємо кліки всередині кошика
    cartItemsEl.addEventListener('click', function(event) {
      // Шукаємо, чи клікнув користувач на слово "remove" (кнопку з атрибутом data-remove)
      const removeBtn = event.target.closest('[data-remove]');
      if (removeBtn) {
        const id = removeBtn.dataset.remove; // Отримуємо ID напою, який треба видалити
        delete state.cart[id]; // Повністю видаляємо цей напій з нашого об'єкта кошика
        renderCart(); // Заново перемальовуємо кошик, щоб рядок зник з екрана, а сума перерахувалася
      }
    });
  }

  // ---------- 7. СПОВІЩЕННЯ: Випливаючі вікна (Toast) ----------
  let toastTimer; // Змінна-таймер, щоб контролювати час зникнення плашки
  
  function showToast(message) {
    const toast = document.getElementById('toast'); // Знаходимо елемент сповіщення
    if (!toast) return; // Якщо його немає на сторінці  нічого не робимо

    toast.textContent = message; // Записуємо текст повідомлення всередину плашки
    toast.classList.add('show'); // Додаємо CSS-клас 'show', який плавно виводить плашку на екран

    clearTimeout(toastTimer); // Якщо попереднє сповіщення ще не встигло зникнути, скасовуємо старий таймер
    
    // Створюємо новий таймер: рівно через 2600 мілісекунд (2.6 секунди) плашка сховається
    toastTimer = setTimeout(function() {
      toast.classList.remove('show'); // Видаляємо клас, і плашка плавно зникає
    }, 3000);
  }

  // ---------- 8. ФОРМА: Бронювання столика ----------
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    // Слухаємо подію "submit" (коли користувач натискає кнопку "Забронювати" або Enter)
    bookForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки формою

      // Зчитуємо тексти та значення з усіх інпутів (полів введення) форми
      const name = document.getElementById('bName').value.trim(); // .trim() прибирає випадкові пробіли на початку й у кінці
      const date = document.getElementById('bDate').value;
      const time = document.getElementById('bTime').value;
      const guests = document.getElementById('bGuests').value;
      const phone = document.getElementById('bPhone').value.trim();

      const msgBlock = document.getElementById('confirmMsg'); // Блок, куди ми виведемо текст успіху або помилки

      // Перевіряємо, чи заповнені обов'язкові поля. Знак || означає "АБО"
      if (name === '' || date === '' || time === '' || phone === '') {
        msgBlock.textContent = 'Please fill in all fields to confirm your table.'; // Пишемо текст помилки
        msgBlock.classList.add('show'); // Показуємо цей блок на екрані
        return; // Зупиняємо функцію, далі код не піде, поки користувач не заповнить усе
      }

      // Збираємо список замовлених напоїв, щоб додати їх до тексту підтвердження столу
      let summaryText = '';
      for (const id in state.cart) {
        if (state.cart[id] > 0) {
          // Якщо в нашому тексті вже щось є, додаємо кому для краси
          if (summaryText !== '') {
            summaryText = summaryText + ', ';
          }
          // Склеюємо рядок виду "2× Espresso"
          summaryText = summaryText + state.cart[id] + '× ' + MENU[id].name;
        }
      }

      // Якщо користувач хоч щось вибрав у кошику, створюємо додатковий рядок тексту
      let orderLine = '';
      if (summaryText !== '') {
        orderLine = ' Your order (' + summaryText + ') will be ready at your table.';
      }

      // Визначаємо, як написати англійською: "guest" (1 гість) чи "guests" (багато гостей)
      let guestWord = 'guests';
      if (guests === '1') {
        guestWord = 'guest';
      }

      // Складаємо фінальний гарний HTML-текст про успішне бронювання столу
      msgBlock.innerHTML = '<strong>Table booked for ' + name + '</strong><br>' + date + ' at ' + time + ' · ' + guests + ' ' + guestWord + '.' + orderLine;
      msgBlock.classList.add('show'); // Показуємо фінальний текст на екрані

      showToast('Table booked  see you soon!'); // Викликаємо спливаюче віконце успіху (замінено '—' на два пробіли)[cite: 1]
      
      // Наприкінці прибираємо фокус (миготячий курсор) з усіх полів введення, щоб вони стали неактивними
      const allInputs = bookForm.querySelectorAll('input');
      for (let i = 0; i < allInputs.length; i++) {
        allInputs[i].blur();
      }
    });
  }
});