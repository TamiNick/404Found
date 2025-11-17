import Raty from 'raty-js';
import 'raty-js/src/raty.css';

const modalArea = document.querySelector('.modal-wrapper');

async function getFurnitureById(id) {
  const url = `https://furniture-store-v2.b.goit.study/api/furnitures/${id}`;
  try {
    let response = await axios.get(url);
    return response.data;
  } catch (error) {
    iziToast.error({
      position: 'topRight',
      message: `Помилка завантаження деталей товару: ${error.message}`,
    });
    return null;
  }
}

// --- ФУНКЦІЇ МОДАЛЬНОГО ВІКНА ---

export function addEventDetailButtons() {
  const detailButtons = document.querySelectorAll('.details-button');

  detailButtons.forEach(button => {
    button.addEventListener('click', async event => {
      const itemId = event.target.dataset.id;
      const furnitureDetails = await getFurnitureById(itemId);

      if (furnitureDetails) {
        renderModal(furnitureDetails);
      }
    });
  });
}

function renderModal(item) {
  const modalMarkup = `
        <div class="modal-backdrop" id="productModal">
            <div class="modal-content" data-product-id="${item._id}">
                <button class="close-button" id="closeModalButton">&times;</button>
                <div class="product-details">
                    <div class="image-column">
                        <div class="main-image-container">
                            <img src="${item.images[0]}" alt="${
    item.name
  }" class="main-image" id="modalMainImage">
                        </div>
                        <div class="additional-images">
                            ${
                              item.images[1]
                                ? `<div class="image-thumb"><img src="${item.images[1]}" alt="Додаткове зображення 1" class="thumb-image"></div>`
                                : ''
                            }
                            ${
                              item.images[2]
                                ? `<div class="image-thumb"><img src="${item.images[2]}" alt="Додаткове зображення 2" class="thumb-image"></div>`
                                : ''
                            }
                        </div>
                    </div>
                    <div class="product-info-column">
                        <h1 class="product-title">${item.name}</h1>
                        <p class="product-category">${item.type}</p>
                        <p class="product-price">${item.price} грн</p>
                        <div class="product-rating" id="productRating" data-score="${
                          item.rate
                        }"></div>
                        <div class="color-options">
                            <p class="color-label">Колір</p>
                            <div class="color-swatches" id="modalColorOptions">
                                ${item.color
                                  .slice(0, 3)
                                  .map((colorValue, index) => {
                                    return `<div 
                                        class="color-swatch ${
                                          index === 0 ? 'selected' : ''
                                        }" 
                                        data-color-id="${item._id}-${index}" 
                                        data-img-index="${index}"
                                        style="background-color: ${colorValue};"
                                    ></div>`;
                                  })
                                  .join('')}
                            </div>
                        </div>
                        <p class="product-description">${
                          item.description ||
                          "Класичний диван з м'якими подушками та високою спинкою, ідеальний для сімейного відпочинку. Оббивка з якісної зносостійкої тканини."
                        }</p>
                        <p class="product-size"><span class="size-label">Розміри:</span> ${
                          item.dimensions || '280х80х85'
                        }</p>
                        <button class="order-button" id="submitOrderButton">Перейти до замовлення</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Додаємо розмітку до DOM та показуємо модальне вікно
  modalArea.innerHTML = modalMarkup;
  const modal = document.getElementById('productModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Додаємо обробники подій для новоствореного контенту
  attachModalHandlers(item);

  const ratingContainer = document.getElementById('productRating');

  const score = parseFloat(ratingContainer.dataset.score);

  const ratyModal = new Raty(ratingContainer, {
    readOnly: true,
    score: score,
    starType: 'i',
    round: { down: 0.25, full: 0.75, up: 0.76 },
  });

  ratyModal.init();
}

function attachModalHandlers(item) {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  // Шукаємо елементи всередині модального вікна
  const closeBtn = modal.querySelector('#closeModalButton');
  const colorSwatches = modal.querySelectorAll('.color-swatch');
  const mainImage = modal.querySelector('#modalMainImage');
  const submitBtn = modal.querySelector('#submitOrderButton');

  //  Закриття модального вікна

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    modalArea.innerHTML = '';
  };

  // Закриття при кліку на ✖ або поза вікном

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  // Початкові значення кольору
  let selectedColorElement = modal.querySelector('.color-swatch.selected');
  let selectedColorValue = selectedColorElement
    ? selectedColorElement.style.backgroundColor
    : null;

  // Вставляємо допоміжну функцію конвертації в область видимості, де вона використовується
  const rgbToHex = colorStr => {
    if (!colorStr || typeof colorStr !== 'string') return colorStr;
    const s = colorStr.trim();
    if (s.startsWith('#')) return s.toLowerCase();
    const nums = s.match(/(\d+(\.\d+)?%?)/g);
    if (!nums || nums.length < 3) return s;

    const toByte = val =>
      val.endsWith('%')
        ? Math.round((parseFloat(val) / 100) * 255)
        : Math.round(parseFloat(val));
    const r = toByte(nums[0]);
    const g = toByte(nums[1]);
    const b = toByte(nums[2]);

    const toHex = n => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
  };

  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      modal
        .querySelector('.color-swatch.selected')
        .classList.remove('selected');
      swatch.classList.add('selected');

      const imgIndex = parseInt(swatch.dataset.imgIndex);
      if (item.images[imgIndex]) {
        mainImage.src = item.images[imgIndex];
      }

      // Оновлення вибраного кольору
      selectedColorValue = swatch.style.backgroundColor;
    });
  });

  submitBtn.addEventListener('click', () => {
    try {
      // Перевіряємо, чи був встановлений колір (отримуємо обчислений стиль, якщо style.backgroundColor порожній)
      if (!selectedColorValue && selectedColorElement) {
        selectedColorValue =
          getComputedStyle(selectedColorElement).backgroundColor;
      }

      if (!selectedColorValue) {
        iziToast.warning({
          position: 'topRight',
          message: 'Будь ласка, оберіть колір перед продовженням!',
        });
        return;
      }

      // Конвертація кольору в HEX
      let colorToSave = selectedColorValue.startsWith('#')
        ? selectedColorValue.toLowerCase()
        : rgbToHex(selectedColorValue);

      // Зберігання даних у localStorage
      localStorage.setItem('selectedFurnitureId', item._id);
      localStorage.setItem('selectedFurnitureColor', colorToSave);

      // Закриваємо модальне вікно деталей
      closeModal();

      // Відкриваємо модальне вікно замовлення
      const orderModal = document.querySelector('.order-modal');
      if (orderModal) {
        orderModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      } else {
        console.error("Елемент '.order-modal' не знайдено.");
        iziToast.warning({
          position: 'topRight',
          message: 'Форма замовлення недоступна. Дані збережено.',
        });
      }
    } catch (err) {
      console.error('Несподівана помилка в обробнику submit:', err);
      iziToast.error({
        position: 'topRight',
        message: 'Виникла помилка при оформленні замовлення.',
      });
    }
  });
}
