import { IBasket } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class BasketView extends Component<IBasket> {
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		const basketButton = this.container.closest('.header__basket');
		if (basketButton) {
			basketButton.addEventListener('click', () => {
				this.events.emit('basket:click');
			});
		}
	}
	render(data: IBasket): HTMLElement {
		// Update the counter with number of items
		this.container.textContent = String(data.items.length);
		return this.container;
	}
}
