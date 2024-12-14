import { IBasketItem, ILot, IBid } from '../../types';
import { BasketModel } from '../models/BasketModel';
import { CatalogView } from '../CatalogView';
import { AuctionAPI } from '../AuctionAPI';
import { EventEmitter, IEvents } from '../base/events';
import { LotModalView } from '../LotModalView';

interface BidEventData {
	lotId: string;
	amount: number;
}

export class CatalogPresenter {
	private lotModalView: LotModalView;

	constructor(
		private catalogView: CatalogView,
		private basketModel: BasketModel,
		private api: AuctionAPI,
		private events: IEvents
	) {
		console.log('Initializing CatalogPresenter');

		this.lotModalView = new LotModalView(
			document.querySelector('#modal-container') as HTMLElement,
			events
		);

		// Set up event listeners
		this.setupEventListeners();

		// Load initial data
		this.loadLots();
	}

	private setupEventListeners() {
		console.log('Setting up event listeners');

		this.catalogView.on('lot:buy', (data: IBasketItem) => {
			console.log('lot:buy event received:', data);
			this.basketModel.addItem(data);
		});

		this.catalogView.on('lot:details', async (lot: ILot) => {
			console.log('lot:details event received:', lot);
			try {
				const lotDetails = await this.api.getLotItem(lot.id);
				console.log('Fetched lot details:', lotDetails);
				this.lotModalView.render(lotDetails);
			} catch (error) {
				console.error('Failed to load lot details:', error);
				this.events.emit('lot:error', { error });
			}
		});

		// Add bid event listener
		this.events.on('lot:bid', async (data: BidEventData) => {
			try {
				console.log(
					`Placing bid for lot ${data.lotId} with amount ${data.amount}`
				);
				const bid: IBid = { price: data.amount };
				const updatedLot = await this.api.placeBid(data.lotId, bid);
				console.log('Bid placed successfully:', updatedLot);

				// Fetch updated lot details and refresh the modal
				const lotDetails = await this.api.getLotItem(data.lotId);
				this.lotModalView.render(lotDetails);
			} catch (error) {
				console.error('Failed to place bid:', error);
				this.events.emit('lot:error', { error });
			}
		});
	}

	private loadLots() {
		this.events.emit('catalog:loading');
		this.api
			.getLotList()
			.then((lots) => {
				console.log('Lots loaded:', lots);
				this.catalogView.render({ items: lots });
				this.events.emit('catalog:loaded', { items: lots });
			})
			.catch((error) => {
				console.error('Failed to load lots:', error);
				this.events.emit('catalog:error', { error });
			});
	}
}
