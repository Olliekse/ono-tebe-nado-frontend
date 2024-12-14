import { ILot } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class LotModalView extends Component<ILot> {
	private readonly template: HTMLTemplateElement;
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this.template = document.querySelector('#preview') as HTMLTemplateElement;
	}

	render(data: ILot): HTMLElement {
		const modalContent = this.container.querySelector('.modal__content');
		if (!modalContent) return this.container;
		modalContent.innerHTML = '';

		if (this.template) {
			const element = this.template.content.cloneNode(true) as HTMLElement;

			// Set lot content
			const image = element.querySelector('.lot__image') as HTMLImageElement;
			const title = element.querySelector('.lot__title') as HTMLElement;
			const description = element.querySelector(
				'.lot__description'
			) as HTMLElement;

			if (image) this.setImage(image, data.image, data.title);
			if (title) this.setText(title, data.title);
			if (description)
				this.setText(description, data.description || data.about);

			// Handle auction status and timer
			const statusContainer = element.querySelector('.lot__status');
			if (statusContainer) {
				if (data.status === 'closed') {
					// Auction is closed
					const statusElement = document.createElement('div');
					statusElement.classList.add('lot__auction');
					statusElement.innerHTML = `
                        <span class="lot__auction-text">Аукцион завершён</span>
                        <span class="lot__auction-price">Продано за ${data.price} ₽</span>
                    `;
					statusContainer.appendChild(statusElement);
				} else {
					// Auction is active - show timer
					const timerElement = document.createElement('div');
					timerElement.classList.add('lot__auction');
					timerElement.innerHTML = `
                        <span class="lot__auction-timer">${this.formatTimeLeft(
													data.datetime
												)}</span>
                        <span class="lot__auction-text">До закрытия лота</span>
                    `;
					statusContainer.appendChild(timerElement);

					// Update timer every second
					const timerDisplay = timerElement.querySelector(
						'.lot__auction-timer'
					);
					if (timerDisplay) {
						const timer = setInterval(() => {
							timerDisplay.textContent = this.formatTimeLeft(data.datetime);
						}, 1000);

						// Clear interval when modal is closed
						const closeButton = this.container.querySelector('.modal__close');
						if (closeButton) {
							closeButton.addEventListener('click', () => {
								clearInterval(timer);
								this.close();
							});
						}
					}
				}
			}

			modalContent.appendChild(element);

			// Show modal
			this.container.classList.add('modal_active');
		}
		return this.container;
	}

	private formatTimeLeft(datetime: string): string {
		const end = new Date(datetime).getTime();
		const now = new Date().getTime();
		const diff = Math.abs(end - now);

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
	}

	close(): void {
		this.container.classList.remove('modal_active');
	}
}
