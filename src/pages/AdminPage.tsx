import React from 'react';
import { use } from 'react';
import TradeTimeline from '../components/TradeTimeline';
import tradeData from '../data.json';

// Define types for our data structure
interface OfferEvent {
  event_id: string;
  event_type: "Offer";
  parent_event_id: string;
  event_date: string;
  advance_rate: number;
  expiry_date: string;
}

interface TimelineData {
  purchase_order: any;
  events: any[];
}

// Create a promise that resolves with the timeline data
// In a real app, this would be a fetch call to an API
const timelineDataPromise = Promise.resolve(tradeData.trade_timeline as TimelineData);

const AdminPage: React.FC = () => {
  // Use the new 'use' hook to unwrap the promise
  const timelineData = use(timelineDataPromise);
  
  // Function to add a new offer
  const handleAddOffer = (parentEventId: string, newOffer: Omit<OfferEvent, 'event_id'>) => {
    // Generate a new event ID (in a real app, this might come from the backend)
    const offerCount = timelineData.events.filter(e => e.event_type === "Offer").length;
    const newOfferId = `OF${String(offerCount + 1).padStart(3, '0')}`;
    
    // Create the complete offer object
    const completeOffer: OfferEvent = {
      ...newOffer as any,
      event_id: newOfferId,
      event_type: "Offer",
      parent_event_id: parentEventId
    };
    
    // In React 19, we would use a different approach for state updates
    // This is a simplified example - in a real app, you might use a context or a state management library
    timelineData.events.push(completeOffer);
    
    // Force a re-render (in a real app, you'd use a proper state management solution)
    window.dispatchEvent(new Event('storage'));
  };

  // Function to edit an existing offer
  const handleEditOffer = (offerId: string, updatedOffer: Partial<OfferEvent>) => {
    // Find and update the offer
    const offerIndex = timelineData.events.findIndex(
      event => event.event_id === offerId && event.event_type === "Offer"
    );
    
    if (offerIndex !== -1) {
      timelineData.events[offerIndex] = {
        ...timelineData.events[offerIndex],
        ...updatedOffer
      };
      
      // Force a re-render (in a real app, you'd use a proper state management solution)
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Function to delete an offer
  const handleDeleteOffer = (offerId: string) => {
    // Filter out the offer to delete
    const offerIndex = timelineData.events.findIndex(
      event => event.event_id === offerId && event.event_type === "Offer"
    );
    
    if (offerIndex !== -1) {
      timelineData.events.splice(offerIndex, 1);
      
      // Force a re-render (in a real app, you'd use a proper state management solution)
      window.dispatchEvent(new Event('storage'));
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Trade Finance Admin</h1>
        <p>View and manage trade timeline information</p>
      </header>

      <main className="admin-content">
        <section className="admin-section">
          <h2>Trade Timeline</h2>
          <TradeTimeline 
            purchase_order={timelineData.purchase_order} 
            events={timelineData.events}
            onAddOffer={handleAddOffer}
            onEditOffer={handleEditOffer}
            onDeleteOffer={handleDeleteOffer}
          />
        </section>
      </main>
    </div>
  );
};

export default AdminPage; 