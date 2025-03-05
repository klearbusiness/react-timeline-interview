import React, { useState } from 'react';
import './TradeTimeline.css';

// Define types based on your data structure
interface Buyer {
  company_name: string;
  contact_name: string;
  contact_email: string;
}

interface Seller {
  company_name: string;
  contact_name: string;
  contact_email: string;
}

interface OrderDetails {
  product: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  delivery_date: string;
}

interface PurchaseOrder {
  order_id: string;
  order_date: string;
  buyer: Buyer;
  seller: Seller;
  order_details: OrderDetails;
}

interface FinancialEventDetails {
  payment_terms: string;
  expiry_date: string;
}

interface OfferEvent {
  event_id: string;
  event_type: "Offer";
  parent_event_id: string;
  event_date: string;
  advance_rate: number;
  expiry_date: string;
}

interface FinancialEvent {
  event_id: string;
  event_type: "Financial Event";
  event_date: string;
  description: string;
  amount: number;
  currency: string;
  details: FinancialEventDetails;
  offers?: OfferEvent[];
}

interface OperationalEvent {
  event_id: string;
  event_type: "Operational Event";
  event_date: string;
  status: string;
  details: string;
  offers?: OfferEvent[];
}

type TimelineEvent = FinancialEvent | OperationalEvent | OfferEvent;

// Add a type guard to check if an event has offers
function hasOffers(event: TimelineEvent): event is (FinancialEvent | OperationalEvent) & { offers: OfferEvent[] } {
  return 'offers' in event && Array.isArray((event as any).offers) && (event as any).offers.length > 0;
}

interface TradeTimelineProps {
  purchase_order: PurchaseOrder;
  events: TimelineEvent[];
  onAddOffer?: (parentEventId: string, newOffer: Omit<OfferEvent, 'event_id'>) => void;
  onEditOffer?: (offerId: string, updatedOffer: Partial<OfferEvent>) => void;
  onDeleteOffer?: (offerId: string) => void;
}

// Add a new interface for the form state
interface OfferFormState {
  advance_rate: number;
  event_date: string;
  expiry_date: string;
}

const TradeTimeline: React.FC<TradeTimelineProps> = ({ 
  purchase_order, 
  events,
  onAddOffer,
  onEditOffer,
  onDeleteOffer
}) => {
  // State for managing the offer form
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [currentParentEventId, setCurrentParentEventId] = useState<string>('');
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<OfferFormState>({
    advance_rate: 0.8, // Default 80%
    event_date: new Date().toISOString().split('T')[0], // Today's date
    expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
  });

  // Reset form values
  const resetForm = () => {
    setOfferForm({
      advance_rate: 0.8,
      event_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setEditingOfferId(null);
  };

  // Handle opening the form for adding a new offer
  const handleAddOfferClick = (parentEventId: string) => {
    setCurrentParentEventId(parentEventId);
    resetForm();
    setShowOfferForm(true);
  };

  // Handle opening the form for editing an offer
  const handleEditOfferClick = (offer: OfferEvent) => {
    setCurrentParentEventId(offer.parent_event_id);
    setEditingOfferId(offer.event_id);
    setOfferForm({
      advance_rate: offer.advance_rate,
      event_date: offer.event_date,
      expiry_date: offer.expiry_date
    });
    setShowOfferForm(true);
  };

  // Handle deleting an offer
  const handleDeleteOfferClick = (offerId: string) => {
    if (window.confirm('Are you sure you want to delete this offer?') && onDeleteOffer) {
      onDeleteOffer(offerId);
    }
  };

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOfferForm(prev => ({
      ...prev,
      [name]: name === 'advance_rate' ? parseFloat(value) / 100 : value
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingOfferId && onEditOffer) {
      // Update existing offer
      onEditOffer(editingOfferId, offerForm);
    } else if (onAddOffer) {
      // Add new offer
      onAddOffer(currentParentEventId, {
        ...offerForm,
        event_type: "Offer",
        parent_event_id: currentParentEventId
      });
    }
    
    setShowOfferForm(false);
    resetForm();
  };

  console.log('TradeTimeline received events:', events);
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
  console.log('Events after sorting:', sortedEvents);

  // First pass: separate offers from other events
  const offers: OfferEvent[] = [];
  const nonOfferEvents = sortedEvents.filter(event => {
    if (event.event_type === "Offer") {
      offers.push(event as OfferEvent);
      return false;
    }
    return true;
  });
  console.log('Separated offers:', offers);
  console.log('Non-offer events:', nonOfferEvents);

  // Second pass: attach offers to their parent events
  const eventsWithOffers = nonOfferEvents.map(event => {
    const relatedOffers = offers.filter(offer => offer.parent_event_id === event.event_id);
    if (relatedOffers.length > 0) {
      console.log(`Attaching ${relatedOffers.length} offers to event ${event.event_id}`);
      return {
        ...event,
        offers: relatedOffers
      };
    }
    return event;
  });
  console.log('Final events with offers:', eventsWithOffers);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="trade-timeline">
      {/* Offer Form Modal */}
      {showOfferForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingOfferId ? 'Edit Offer' : 'Add New Offer'}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="advance_rate">Advance Rate (%)</label>
                <input
                  type="number"
                  id="advance_rate"
                  name="advance_rate"
                  min="1"
                  max="100"
                  value={offerForm.advance_rate * 100}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event_date">Offer Date</label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  value={offerForm.event_date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiry_date">Expiry Date</label>
                <input
                  type="date"
                  id="expiry_date"
                  name="expiry_date"
                  value={offerForm.expiry_date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowOfferForm(false)}>Cancel</button>
                <button type="submit">{editingOfferId ? 'Update Offer' : 'Add Offer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!purchase_order && (
        <div className="empty-state">
          <h3>No purchase order data available</h3>
          <p>There appears to be no purchase order information to display.</p>
        </div>
      )}

      {purchase_order && (
        <div className="purchase-order-card">
          <h3>Purchase Order: {purchase_order.order_id}</h3>
          <div className="order-details">
            <div className="order-parties">
              <div className="order-party">
                <h4>Buyer</h4>
                <p><strong>{purchase_order.buyer.company_name}</strong></p>
                <p>{purchase_order.buyer.contact_name}</p>
                <p>{purchase_order.buyer.contact_email}</p>
              </div>
              <div className="order-party">
                <h4>Seller</h4>
                <p><strong>{purchase_order.seller.company_name}</strong></p>
                <p>{purchase_order.seller.contact_name}</p>
                <p>{purchase_order.seller.contact_email}</p>
              </div>
            </div>
            <div className="order-product">
              <h4>Product Details</h4>
              <p><strong>Product:</strong> {purchase_order.order_details.product}</p>
              <p><strong>Quantity:</strong> {purchase_order.order_details.quantity.toLocaleString()}</p>
              <p><strong>Unit Price:</strong> {formatCurrency(purchase_order.order_details.unit_price, 'USD')}</p>
              <p><strong>Total Value:</strong> {formatCurrency(purchase_order.order_details.total_price, 'USD')}</p>
              <p><strong>Order Date:</strong> {formatDate(purchase_order.order_date)}</p>
              <p><strong>Delivery Date:</strong> {formatDate(purchase_order.order_details.delivery_date)}</p>
            </div>
          </div>
        </div>
      )}

      {events && events.length > 0 ? ( 
        <>
          <h3 className="timeline-heading">Timeline Events</h3>
          <div className="timeline">
            {eventsWithOffers.length > 0 ? (
              eventsWithOffers.map((event) => (
                <div key={event.event_id} className={`timeline-event ${event.event_type.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="event-date">{formatDate(event.event_date)}</div>
                    <div className="event-card">
                      <div className="event-header">
                        <h4>{event.event_type}</h4>
                        <span className="event-id">{event.event_id}</span>
                      </div>
                      
                      {event.event_type === "Financial Event" && (
                        <div className="financial-event-details">
                          <p><strong>{(event as FinancialEvent).description}</strong></p>
                          <p className="event-amount">
                            {formatCurrency((event as FinancialEvent).amount, (event as FinancialEvent).currency)}
                          </p>
                          <p><strong>Payment Terms:</strong> {(event as FinancialEvent).details.payment_terms} days</p>
                          <p><strong>Expiry Date:</strong> {formatDate((event as FinancialEvent).details.expiry_date)}</p>
                          
                          <div className="related-offers">
                            <div className="offers-header">
                              <h5>Financing Offers</h5>
                              {onAddOffer && (
                                <button 
                                  className="add-offer-btn"
                                  onClick={() => handleAddOfferClick(event.event_id)}
                                >
                                  + Add Offer
                                </button>
                              )}
                            </div>
                            
                            {hasOffers(event) ? (
                              <div className="offers-container">
                                {event.offers.map((offer) => {
                                  const financialEvent = event as FinancialEvent;
                                  const purchasePrice = offer.advance_rate * financialEvent.amount;
                                  
                                  return (
                                    <div key={offer.event_id} className="offer-card">
                                      <div className="offer-header">
                                        <span className="offer-id">{offer.event_id}</span>
                                        <div className="offer-actions">
                                          {onEditOffer && (
                                            <button 
                                              className="edit-btn"
                                              onClick={() => handleEditOfferClick(offer)}
                                              title="Edit offer"
                                            >
                                              ✏️
                                            </button>
                                          )}
                                          {onDeleteOffer && (
                                            <button 
                                              className="delete-btn"
                                              onClick={() => handleDeleteOfferClick(offer.event_id)}
                                              title="Delete offer"
                                            >
                                              🗑️
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <p><strong>Advance Rate:</strong> {(offer.advance_rate * 100).toFixed(0)}%</p>
                                      <p><strong>Purchase Price:</strong> {formatCurrency(purchasePrice, financialEvent.currency)}</p>
                                      <p><strong>Expiry:</strong> {formatDate(offer.expiry_date)}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="no-offers">No financing offers available. {onAddOffer && 'Click "Add Offer" to create one.'}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {event.event_type === "Operational Event" && (
                        <div className="operational-event-details">
                          <p className={`status status-${(event as OperationalEvent).status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {(event as OperationalEvent).status}
                          </p>
                          <p>{(event as OperationalEvent).details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No timeline events to display after processing.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>No timeline events</h3>
          <p>There are no events to display in the timeline.</p>
        </div>
      )}
    </div>
  );
};

export default TradeTimeline; 