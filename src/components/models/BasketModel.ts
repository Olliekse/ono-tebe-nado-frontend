import { IBasketItem } from '../../types';
import { IEvents } from '../base/events';
import { Model } from '../base/Model';

import { IBasket } from '../../types';

export class BasketModel extends Model<IBasket> {
	private items: IBasketItem[] = [];
	private total: number = 0;
	private currentTab: 'active' | 'closed' = 'active';

	constructor(events: IEvents) {
		super({ items: [], total: 0 }, events);
	}

	setCurrentTab(tab: 'active' | 'closed') {
		this.currentTab = tab;
	}

	getCurrentTab() {
		return this.currentTab;
	}

	getTotal() {
		return this.total;
	}

	getItems() {
		return this.items;
	}

	addItem(item: IBasketItem) {
		this.items.push(item);
		this.recalculateTotal();
		this.emitChanges('basket:changed', {
			items: this.items,
			total: this.total,
		} as IBasket);
	}

	private recalculateTotal() {
		this.total = this.items.reduce((sum, item) => sum + item.price, 0);
	}

	clearBasket() {
		this.items = [];
		this.total = 0;
		this.emitChanges('basket:changed', {
			items: this.items,
			total: this.total,
		} as IBasket);
	}
}
