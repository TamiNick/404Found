import axios from 'axios';
import Raty from 'raty-js';
import 'raty-js/src/raty.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

async function fetchFeedbackList() {
  try {
    const response = await axios.get(
      'https://furniture-store-v2.b.goit.study/api/feedbacks',
      {
        params: {
          page: 1,
          limit: 10,
        },
      }
    );

    return response.data.feedbacks;
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося завантажити відгуки. Спробуйте пізніше.',
      position: 'topRight',
    });

    console.error('Error fetching feedbacks:', error);
  }
}

async function renderFeedbackList(data) {
  const reviewContainer = document.querySelector('.review-carousel');
  const markup = data
    .map(
      feedback =>
        `<li class="review-item swiper-slide">
  <div class="stars-rating" data-score="${feedback.rate}"></div>
  <p class="review-item-text">"${feedback.descr}"</p>
  <p class="review-item-name">${feedback.name}</p>
</li>`
    )
    .join('');
  reviewContainer
    .querySelector('.review .swiper-wrapper')
    .insertAdjacentHTML('beforeend', markup);
  document.querySelectorAll('.stars-rating').forEach(item => {
    const score = parseFloat(item.dataset.score);

    const raty = new Raty(item, {
      round: {
        down: 0.25,
        full: 0.75,
        up: 0.76,
      },

      readOnly: true,
      score: score,
      starType: 'i',
    });

    raty.init();
  });
}

function equalizeSlideHeights() {
  const slides = document.querySelectorAll('.review-item');
  let maxHeight = 0;

  slides.forEach(slide => {
    slide.style.height = 'auto';
  });

  slides.forEach(slide => {
    const slideHeight = slide.offsetHeight;
    if (slideHeight > maxHeight) {
      maxHeight = slideHeight;
    }
  });

  slides.forEach(slide => {
    slide.style.height = `${maxHeight}px`;
  });
}

const reviewContainer = document.querySelector('.review-carousel');
const reviewSwiper = new Swiper(reviewContainer, {
  slidesPerView: 1,
  spaceBetween: 16,
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    1440: {
      slidesPerView: 3,
    },
  },

  pagination: {
    el: '.review .swiper-pagination',
    clickable: true,
    dynamicBullets: true,
  },

  navigation: {
    prevEl: '.review .nav-btn-prev',
    nextEl: '.review .nav-btn-next',
  },

  on: {
    init: function () {
      setTimeout(equalizeSlideHeights, 100);
    },
    resize: function () {
      equalizeSlideHeights();
    },
  },
});

async function initializeFeedback() {
  try {
    const data = await fetchFeedbackList();
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(
        'Дані відгуків не завантажені або порожні. Рендеринг відмінено.'
      );

      return;
    }
    await renderFeedbackList(data);
    reviewSwiper.update();
    setTimeout(equalizeSlideHeights, 200);
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: 'Не вдалося завантажити галерею відгуків. Спробуйте пізніше.',
      position: 'topRight',
    });
    console.error('Error fetching feedback:', error);
  }
}

initializeFeedback();

window.addEventListener('resize', equalizeSlideHeights);
