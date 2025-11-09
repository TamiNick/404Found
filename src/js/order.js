import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const modal = document.querySelector('.order-modal');
const form = document.querySelector('.order-form');
const closeBtn = document.querySelector('.order-close');

let pageTitle = '';
if (modal && !modal.classList.contains('hidden')) {
	pageTitle = document.title;
	document.title = "Замовити зворотний зв’язок.";
	document.body.style.overflow = 'hidden';
}

closeBtn.addEventListener('click', () => closeModal());
modal.addEventListener('click', e => {
	if (e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
	if (e.key === 'Escape') closeModal();
});

function closeModal() {
	modal.classList.add('hidden');
	document.title = pageTitle;
	document.body.style.overflow = '';
}

form.addEventListener('submit', async e => {
	e.preventDefault();

	const nameInput = form.elements.name;
	const phoneInput = form.elements.phone;
	const commentInput = form.elements.comment;

	let valid = true;
	[nameInput, phoneInput, commentInput].forEach(input => {
		input.classList.remove('error');
		if (!input.value.trim()) {
			input.classList.add('error');
			valid = false;
		}
	});

	if (!valid) {
		iziToast.error({
			title: 'Помилка',
			message: 'Заповніть усі обовʼязкові поля!',
			position: 'topRight',
		});
		return;
	}

	const demo_product_id = '682f9bbf8acbdf505592ac36';

	const payload = {
		"name": nameInput.value.trim(),
		"phone": phoneInput.value.trim(),
		"modelId": localStorage.getItem('selectedFurnitureId') || demo_product_id,
		"color": "#1212ca",
		"comment": commentInput.value.trim(),
	};

	try {
		const response = await fetch('https://furniture-store-v2.b.goit.study/api/orders', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Помилка сервера');
		}

		iziToast.success({
			title: 'Успішно!',
			message: 'Вашу заявку відправлено.',
			position: 'center',
			timeout: 3000,
		});

		form.reset();
		closeModal();

	} catch (error) {
		iziToast.error({
			title: 'Помилка',
			message: error.message || 'Не вдалося відправити заявку',
			position: 'topRight',
		});
	}
});
