import { IBasket, IOrder } from '../../types/index';
import { BasketModalView } from '../BasketModalView';
import { BasketView } from '../BasketView';
import { BasketModel } from '../models/BasketModel';
import { AuctionAPI } from '../AuctionAPI';

interface TabEventData {
	tab: 'active' | 'closed';
}

export class BasketPresenter {
	constructor(
		private model: BasketModel,
		private view: BasketView,
		private modalView: BasketModalView,
		private api: AuctionAPI
	) {
		// Listen to model changes
		model.getEvents().on<IBasket>('basket:changed', (data) => {
			console.log('Basket changed:', data);
			this.view.render(data);
		});

		// Listen for basket click
		model.getEvents().on('basket:click', () => {
			this.modalView.render({
				items: this.model.getItems(),
				total: this.model.getTotal(),
				currentTab: 'active'
			});
		});

		// Listen for basket checkout
		model.getEvents().on('basket:checkout', () => {
			console.log('Checkout event received');
			const orderTemplate = document.querySelector(
				'#order'
			) as HTMLTemplateElement;
			if (orderTemplate) {
				const modalContent = document.querySelector('.modal__content');
				if (modalContent) {
					modalContent.innerHTML = '';
					modalContent.appendChild(orderTemplate.content.cloneNode(true));

					const form = modalContent.querySelector('form');
					if (form) {
						this.setupFormValidation(form);
						form.addEventListener('submit', this.handleOrderSubmit.bind(this));
					}
				}
			}
		});

		// Close modal when close button is clicked
		model.getEvents().on('basket:close', () => {
			this.modalView.close();
		});

		// Listen for tab switching
		model.getEvents().on('basket:switch-tab', (data: TabEventData) => {
			this.model.setCurrentTab(data.tab);
			this.modalView.render({
				items: this.model.getItems(),
				total: this.model.getTotal(),
				currentTab: data.tab
			});
		});
	}

	private setupFormValidation(form: HTMLFormElement) {
		const emailInput = form.querySelector(
			'input[name="email"]'
		) as HTMLInputElement;
		const phoneInput = form.querySelector(
			'input[name="phone"]'
		) as HTMLInputElement;
		const errorContainer = form.querySelector('.form__errors') as HTMLElement;
		const submitButton = form.querySelector(
			'button[type="submit"]'
		) as HTMLButtonElement;

		const validateEmail = (email: string) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(email);
		};

		const validatePhone = (phone: string) => {
			const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
			return phoneRegex.test(phone);
		};

		const validateForm = () => {
			const email = emailInput.value;
			const phone = phoneInput.value;

			if (!email || !phone) {
				errorContainer.textContent = 'Заполните все поля';
				submitButton.disabled = true;
				return;
			}

			if (!validateEmail(email)) {
				errorContainer.textContent = 'Некорректный email';
				submitButton.disabled = true;
				return;
			}

			if (!validatePhone(phone)) {
				errorContainer.textContent = 'Некорректный телефон';
				submitButton.disabled = true;
				return;
			}

			errorContainer.textContent = '';
			submitButton.disabled = false;
		};

		// Format phone number as user types
		phoneInput.addEventListener('input', (e) => {
			const input = e.target as HTMLInputElement;
			let value = input.value.replace(/\D/g, '');

			if (value.startsWith('7')) {
				value = value.slice(1);
			}

			if (value.length === 0) {
				input.value = '+7(';
				return;
			}

			if (value.length > 10) {
				value = value.slice(0, 10);
			}

			let formattedValue = '+7(';
			if (value.length > 0) {
				formattedValue += value.slice(0, 3);
			}
			if (value.length > 3) {
				formattedValue += ')' + value.slice(3, 6);
			}
			if (value.length > 6) {
				formattedValue += '-' + value.slice(6, 8);
			}
			if (value.length > 8) {
				formattedValue += '-' + value.slice(8, 10);
			}

			input.value = formattedValue;
			validateForm();
		});

		emailInput.addEventListener('input', validateForm);
		phoneInput.addEventListener('input', validateForm);

		// Set initial state
		submitButton.disabled = true;
		phoneInput.value = '+7(';
	}

	private handleOrderSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const errorContainer = form.querySelector('.form__errors') as HTMLElement;

		// Basic validation
		const email = formData.get('email') as string;
		const phone = formData.get('phone') as string;

		if (!email || !phone) {
			if (errorContainer) {
				errorContainer.textContent = 'Заполните все поля';
			}
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			if (errorContainer) {
				errorContainer.textContent = 'Некорректный email';
			}
			return;
		}

		// Phone validation
		const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
		if (!phoneRegex.test(phone)) {
			if (errorContainer) {
				errorContainer.textContent = 'Некорректный телефон';
			}
			return;
		}

		const orderData: IOrder = {
			email: formData.get('email') as string,
			phone: formData.get('phone') as string,
			items: this.model.getItems().map((item) => item.id),
		};

		// Submit order to API
		this.api
			.orderLots(orderData)
			.then(() => {
				// Show success template
				const successTemplate = document.querySelector(
					'#success'
				) as HTMLTemplateElement;
				if (successTemplate) {
					const modalContent = document.querySelector('.modal__content');
					if (modalContent) {
						modalContent.innerHTML = '';
						modalContent.appendChild(successTemplate.content.cloneNode(true));
						this.model.clearBasket();
						this.view.render({ 
							items: [], 
							total: 0,
							currentTab: 'active'
						});
					}
				}
			})
			.catch((error) => {
				if (errorContainer) {
					errorContainer.textContent = 'Ошибка при оформлении заказа';
					console.error('Error submitting order:', error);
				}
			});
	}
}
