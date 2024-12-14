import { IBasketItem, ILot } from '../types/index';
import { Component } from './base/Component';
import { EventEmitter, IEvents } from './base/events';
import { dayjs } from '../utils/utils';

export class CatalogView extends Component<{ items: ILot[] }> {
	private readonly cardTemplate: HTMLTemplateElement;
	private readonly viewEvents: EventEmitter;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this.cardTemplate = document.querySelector('#card') as HTMLTemplateElement;
		this.viewEvents = new EventEmitter();
	}

	render(data: { items: ILot[] }): HTMLElement {
		this.container.innerHTML = '';

		data.items.forEach((lot) => {
			const card = this.cardTemplate.content.cloneNode(true) as HTMLElement;

			// Set card content
			const image = card.querySelector('.card__image') as HTMLImageElement;
			const title = card.querySelector('.card__title') as HTMLElement;
			const description = card.querySelector(
				'.card__description'
			) as HTMLElement;
			const button = card.querySelector('.card__action') as HTMLButtonElement;
			const status = card.querySelector('.card__status') as HTMLElement;

			if (image) this.setImage(image, lot.image, lot.title);
			if (title) this.setText(title, lot.title);
			if (description) this.setText(description, lot.about);

			// Add bid button handler
			if (button) {
				button.addEventListener('click', () => {
					this.viewEvents.emit('lot:buy', {
						id: lot.id,
						title: lot.title,
						price: lot.price,
					});
					this.viewEvents.emit('lot:details', lot);
				});
			}

			// Show lot status with date
			if (status) {
				const statusText = this.formatLotStatus(lot);
				this.setText(status, statusText);
				this.setStatusStyle(status, lot.status);
			}

			this.container.appendChild(card);
		});
		return this.container;
	}

	private formatLotStatus(lot: ILot): string {
		const date = dayjs(lot.datetime);
		const formattedDate = date.format('D MMMM [в] HH:mm');

		switch (lot.status) {
			case 'active':
				return `Открыто до ${formattedDate}`;
			case 'wait':
				return `Откроется ${formattedDate}`;
			case 'closed':
				return `Закрыто ${formattedDate}`;
			default:
				return '';
		}
	}

	private setStatusStyle(status: HTMLElement, lotStatus: string): void {
		status.classList.add('card__status');
		switch (lotStatus) {
			case 'active':
				status.style.color = '#7CC37F';
				break;
			case 'wait':
				status.style.color = '#DCB11B';
				break;
			case 'closed':
				status.style.color = '#D35D5D';
				break;
		}
	}

	public on(event: string, callback: (data: IBasketItem) => void) {
		this.viewEvents.on(event, callback);
	}
}
