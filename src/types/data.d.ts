declare module '*.json' {
  const value: {
    trade_timeline: {
      purchase_order: {
        order_id: string;
        order_date: string;
        buyer: {
          company_name: string;
          contact_name: string;
          contact_email: string;
        };
        seller: {
          company_name: string;
          contact_name: string;
          contact_email: string;
        };
        order_details: {
          product: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          delivery_date: string;
        };
      };
      events: Array<{
        event_id: string;
        event_type: string;
        event_date: string;
        [key: string]: any;
      }>;
    };
  };
  export default value;
} 