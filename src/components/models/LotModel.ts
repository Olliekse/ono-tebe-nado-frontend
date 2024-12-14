import { Model } from '../base/Model';
import { ILot, LotStatus } from '../../types';
import { IEvents } from '../base/events';

export class LotModel extends Model<ILot> {
	// Properties from ILot interface
	id: string;
	title: string;
	about: string;
	description?: string;
	image: string;
	status: LotStatus;
	datetime: string;
	price: number;
	minPrice: number;
	history?: number[];

	constructor(data: Partial<ILot>, events: IEvents) {
		super(data, events);
	}

	// Business Logic Methods
	placeBid(amount: number) {
		if (amount <= this.price) {
			throw new Error('Bid must be higher than current price');
		}

		this.price = amount;
		if (this.history) {
			this.history.push(amount);
		} else {
			this.history = [amount];
		}

		// Notify subscribers that data changed
		this.emitChanges('lot:bid', {
			id: this.id,
			price: this.price,
		});
	}

	updateStatus(newStatus: LotStatus) {
		this.status = newStatus;
		this.emitChanges('lot:status', {
			id: this.id,
			status: this.status,
		});
	}
}
