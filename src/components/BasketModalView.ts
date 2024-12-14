import { IBasket } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class BasketModalView extends Component<IBasket> {
	private readonly basketTemplate: HTMLTemplateElement;
	private readonly tabsTemplate: HTMLTemplateElement;
	private currentTab: 'active' | 'closed' = 'active';

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this.basketTemplate = document.querySelector(
			'#basket'
		) as HTMLTemplateElement;
		this.tabsTemplate = document.querySelector('#tabs') as HTMLTemplateElement;
	}

	render(data: IBasket): HTMLElement {
		const modalContent = this.container.querySelector('.modal__content');
		if (!modalContent) return this.container;

		// Clear the modal content
		modalContent.innerHTML = '';

		// Add tabs
		if (this.tabsTemplate) {
			const tabsElement = this.tabsTemplate.content.cloneNode(
				true
			) as HTMLElement;
			modalContent.appendChild(tabsElement);

			// Setup tab buttons
			const activeTab = modalContent.querySelector(
				'button[name="active"]'
			) as HTMLButtonElement;
			const closedTab = modalContent.querySelector(
				'button[name="closed"]'
			) as HTMLButtonElement;

			if (this.currentTab === 'active') {
				activeTab.disabled = true;
				activeTab.classList.add('tabs__item_active');
				closedTab.disabled = false;
				closedTab.classList.remove('tabs__item_active');
			} else {
				closedTab.disabled = true;
				closedTab.classList.add('tabs__item_active');
				activeTab.disabled = false;
				activeTab.classList.remove('tabs__item_active');
			}

			activeTab.addEventListener('click', () => this.switchTab('active'));
			closedTab.addEventListener('click', () => this.switchTab('closed'));
		}

		// Filter items based on current tab
		const closedItems = data.items.filter((item) => item.closed);
		const activeItems = data.items.filter((item) => !item.closed);
		const currentItems =
			this.currentTab === 'active' ? activeItems : closedItems;

		// Render basket items
		if (this.basketTemplate && currentItems.length > 0) {
			const basketElement = this.basketTemplate.content.cloneNode(
				true
			) as HTMLElement;
			const basketList = basketElement.querySelector('.basket__list');
			const totalPrice = currentItems.reduce(
				(sum, item) => sum + item.price,
				0
			);
			if (basketList) {
				currentItems.forEach((item) => {
					// Use the bid template instead of creating a div
					const bidTemplate = document.querySelector(
						'#bid'
					) as HTMLTemplateElement;
					const bidElement = bidTemplate.content.cloneNode(true) as HTMLElement;

					// Set the item details
					const image = bidElement.querySelector(
						'.bid__image'
					) as HTMLImageElement;
					const title = bidElement.querySelector('.bid__title') as HTMLElement;
					const amount = bidElement.querySelector(
						'.bid__amount'
					) as HTMLElement;
					const openButton = bidElement.querySelector(
						'.bid__open'
					) as HTMLButtonElement;
					const basketItem = bidElement.querySelector(
						'.basket__item'
					) as HTMLElement;

					if (image) image.src = item.image;
					if (title) title.textContent = item.title;
					if (amount) amount.textContent = item.price.toString();
					const openLot = () => {
						this.events.emit('lot:open', { id: item.id });
					};

					// Make the entire item clickable
					if (basketItem) {
						basketItem.style.cursor = 'pointer';
						basketItem.addEventListener('click', (event) => {
							// Prevent click event when clicking the arrow button
							if (!(event.target as HTMLElement).closest('.bid__open')) {
								openLot();
							}
						});
					}
					// Add click handler for the open button
					if (openButton) {
						openButton.addEventListener('click', openLot);
					}

					basketList.appendChild(bidElement);
				});
				const totalElement = basketElement.querySelector('.basket__total');
				if (totalElement) {
					totalElement.textContent = totalPrice.toString();
				}
				modalContent.appendChild(basketElement);
			}
		} else if (this.currentTab === 'closed' && closedItems.length === 0) {
			// Show empty state for closed tab
			const emptyStateModal = document.querySelector(
				'.modal .state'
			) as HTMLElement;
			if (emptyStateModal) {
				const emptyStateClone = emptyStateModal.cloneNode(true) as HTMLElement;
				modalContent.appendChild(emptyStateClone);

				const homeButton = emptyStateClone.querySelector('.state__action');
				if (homeButton) {
					homeButton.addEventListener('click', () => {
						this.close();
						this.events.emit('app:reset');
					});
				}
			}
		}

		// Add close button handler
		const closeButton = this.container.querySelector('.modal__close');
		if (closeButton) {
			closeButton.addEventListener('click', () => {
				this.close();
				this.events.emit('basket:close');
			});
		}

		// Show modal
		this.container.classList.add('modal_active');

		return this.container;
	}

	private switchTab(tab: 'active' | 'closed') {
		if (this.currentTab !== tab) {
			this.currentTab = tab;
			this.events.emit('basket:switch-tab', { tab });
		}
	}

	close(): void {
		this.container.classList.remove('modal_active');
	}
}
