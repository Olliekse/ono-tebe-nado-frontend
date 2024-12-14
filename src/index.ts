import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { BasketModel } from './components/models/BasketModel';
import { BasketView } from './components/BasketView';
import { BasketPresenter } from './components/presenters/BasketPresenter';
import { BasketModalView } from './components/BasketModalView';
import { AuctionAPI } from './components/AuctionAPI';
import { CatalogView } from './components/CatalogView';
import { CatalogPresenter } from './components/presenters/CatalogPresenter';
import { CDN_URL } from './utils/constants';
import { API_URL } from './utils/constants';

function initializeApp() {
	const events = new EventEmitter();
	const basketModel = new BasketModel(events);
	const api = new AuctionAPI(CDN_URL, API_URL);

	const basketView = new BasketView(
		document.querySelector('[data-component="basket"]') as HTMLElement,
		events
	);

	const basketModalView = new BasketModalView(
		document.querySelector('#modal-container') as HTMLElement,
		events
	);

	const catalogView = new CatalogView(
		document.querySelector('[data-component="catalog"]') as HTMLElement,
		events
	);

	new BasketPresenter(basketModel, basketView, basketModalView, api);
	new CatalogPresenter(catalogView, basketModel, api, events);

	events.onAll(({ eventName, data }) => {
		console.log(eventName, data);
	});

	api
		.getLotList()
		.then((lots) => {
			console.log('Lots received:', lots);
		})
		.catch((err) => {
			console.error('Failed to fetch lots:', err);
		});

	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;
		if (
			target.classList.contains('state__action') &&
			target.textContent === 'На главную'
		) {
			const modal = target.closest('.modal') as HTMLElement;
			if (modal) {
				modal.classList.remove('modal_active');
			}
			events.emit('app:reset');
		}
	});
}

document.addEventListener('DOMContentLoaded', initializeApp);
