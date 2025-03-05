import React, { useState, useEffect } from 'react';
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

const AdminPage: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // In a real application, this might be an API call
    // For now, we're just using the imported JSON data
    setTimelineData(tradeData.trade_timeline as TimelineData);
    setLoading(false);
  }, []);

  // Function to add a new offer
  const handleAddOffer = (parentEventId: string, newOffer: Omit<OfferEvent, 'event_id'>) => {
    if (!timelineData) return;
    
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
    
    // Add the new offer to the events array
    const updatedEvents = [...timelineData.events, completeOffer];
    
    // Update the timeline data
    setTimelineData({
      ...timelineData,
      events: updatedEvents
    });
  };

  // Function to edit an existing offer
  const handleEditOffer = (offerId: string, updatedOffer: Partial<OfferEvent>) => {
    if (!timelineData) return;
    
    // Find and update the offer
    const updatedEvents = timelineData.events.map(event => {
      if (event.event_id === offerId && event.event_type === "Offer") {
        return {
          ...event,
          ...updatedOffer
        };
      }
      return event;
    });
    
    // Update the timeline data
    setTimelineData({
      ...timelineData,
      events: updatedEvents
    });
  };

  // Function to delete an offer
  const handleDeleteOffer = (offerId: string) => {
    if (!timelineData) return;
    
    // Filter out the offer to delete
    const updatedEvents = timelineData.events.filter(event => 
      !(event.event_id === offerId && event.event_type === "Offer")
    );
    
    // Update the timeline data
    setTimelineData({
      ...timelineData,
      events: updatedEvents
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading timeline data...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Trade Finance Admin</h1>
        <p>View and manage trade timeline information</p>
      </header>

      <main className="admin-content">
        <section className="admin-section">
          <h2>Trade Timeline</h2>
          {timelineData && (
            <TradeTimeline 
              purchase_order={timelineData.purchase_order} 
              events={timelineData.events}
              onAddOffer={handleAddOffer}
              onEditOffer={handleEditOffer}
              onDeleteOffer={handleDeleteOffer}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPage; 