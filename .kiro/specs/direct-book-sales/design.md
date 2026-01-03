# Direct Book Sales Design Document

## Overview

This design implements a Stripe-based payment system for direct book sales on Brian L. Plescher's author website. The solution integrates seamlessly with the existing static website while providing secure payment processing, order management, and fulfillment tracking. The system uses Stripe Checkout for payment processing, Netlify Functions for serverless backend operations, and a simple database solution for order management.

## Architecture

The system follows a JAMstack architecture pattern, leveraging:

- **Frontend**: Enhanced existing HTML/CSS/JavaScript with Stripe Elements
- **Backend**: Netlify Functions (serverless) for payment processing and order management
- **Database**: Netlify Forms + Airtable for order storage and management
- **Payment Processing**: Stripe Checkout and Payment Intents API
- **Email**: EmailJS or Netlify Forms for notifications
- **Hosting**: Existing Netlify deployment

### System Flow

```
Customer → Website → Stripe Checkout → Netlify Function → Database → Email Notifications
                                    ↓
                              Payment Confirmation → Order Fulfillment
```

## Components and Interfaces

### 1. Frontend Components

#### Purchase Button Component
- Integrates with existing book sections on index.html and woundwise.html
- Styled to match existing `.btnlink` design system
- Handles product selection and initiates checkout

#### Checkout Integration
- Stripe Checkout hosted solution (redirects to Stripe-hosted page)
- Custom success/cancel pages styled to match website
- Loading states and error handling

#### Order Status Portal
- Simple order lookup form using email + order number
- Displays order status, shipping info, and tracking details
- Integrated into existing website navigation

### 2. Backend Services

#### Payment Processing Service (`/.netlify/functions/create-checkout`)
- Creates Stripe Checkout sessions
- Handles product pricing and shipping calculations
- Manages success/failure redirects

#### Order Management Service (`/.netlify/functions/handle-order`)
- Processes successful payments via Stripe webhooks
- Creates order records in database
- Triggers email notifications

#### Order Lookup Service (`/.netlify/functions/get-order`)
- Retrieves order status by email and order number
- Returns order details and shipping status

### 3. Data Management

#### Order Database Schema (Airtable)
```
Orders Table:
- order_id (primary key)
- stripe_payment_intent_id
- customer_email
- customer_name
- shipping_address (JSON)
- order_total
- shipping_cost
- order_status (pending, processing, shipped, delivered)
- created_at
- shipped_at
- tracking_number
```

#### Product Configuration
```javascript
const PRODUCTS = {
  woundwise_paperback: {
    name: "Woundwise: Dissolution, Abjective Ecology, and Subversive Becoming",
    price: 2400, // $24.00 in cents
    shipping_weight: 0.5, // pounds
    description: "Paperback edition, personally shipped by the author"
  }
};
```

## Data Models

### Order Model
```typescript
interface Order {
  id: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  orderTotal: number; // in cents
  shippingCost: number; // in cents
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  shippedAt?: Date;
  trackingNumber?: string;
}
```

### Product Model
```typescript
interface Product {
  id: string;
  name: string;
  price: number; // in cents
  shippingWeight: number; // in pounds
  description: string;
  inStock: boolean;
  stockCount?: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:
- Properties 2.5 and 3.3 both test shipping notification emails - these can be combined
- Properties 1.5, 2.1, and 3.2 all test email sending behavior - these can be grouped under email notification properties
- Properties 2.3, 3.1, and 3.5 all test data display functionality - these can be combined into display correctness properties

Property 1: Checkout initiation displays correct product information
*For any* product and user interaction, clicking the purchase button should display a checkout form containing the correct product name, price, and description
**Validates: Requirements 1.1**

Property 2: Shipping cost calculation consistency
*For any* valid shipping address, the shipping calculator should return consistent and accurate shipping costs based on location and product weight
**Validates: Requirements 1.2**

Property 3: Payment processing integration
*For any* valid payment attempt, the system should correctly interface with Stripe's API and handle the response appropriately
**Validates: Requirements 1.3**

Property 4: Order creation after successful payment
*For any* successful payment, the system should create exactly one order record containing all required customer and transaction details
**Validates: Requirements 1.4**

Property 5: Email notification consistency
*For any* order state change (creation, shipping), the system should send appropriate email notifications to both customer and author with correct order information
**Validates: Requirements 1.5, 2.1, 2.5, 3.2, 3.3**

Property 6: Secure data storage
*For any* customer information collected, the system should store data securely and only retain necessary information for order fulfillment
**Validates: Requirements 2.2**

Property 7: Order data completeness
*For any* order retrieval request, the system should return all required order fields (contact info, shipping address, payment status) when they exist
**Validates: Requirements 2.3, 3.1, 3.5**

Property 8: Status update functionality
*For any* valid order status change, the system should update the order record and trigger appropriate downstream actions (notifications, UI updates)
**Validates: Requirements 2.4**

Property 9: Order lookup accuracy
*For any* valid email and order number combination, the system should return the correct order details or appropriate error message
**Validates: Requirements 3.4**

Property 10: Error handling without information leakage
*For any* payment processing error, the system should display user-friendly error messages without exposing sensitive payment or system information
**Validates: Requirements 4.3, 6.3**

Property 11: Successful checkout redirect
*For any* completed checkout, the system should redirect users to the appropriate confirmation page with correct order details
**Validates: Requirements 4.4**

Property 12: Sales analytics accuracy
*For any* completed order, the system should correctly update sales metrics (revenue, count) and inventory levels
**Validates: Requirements 5.1, 5.3**

Property 13: Sales data aggregation
*For any* time period query, the system should accurately calculate and display sales summaries from the underlying order data
**Validates: Requirements 5.2**

Property 14: Inventory-based UI behavior
*For any* inventory level, the system should display appropriate stock status and enable/disable purchase options accordingly
**Validates: Requirements 5.4, 5.5**

Property 15: Payment method support
*For any* major credit card type (Visa, MasterCard, American Express, Discover), the system should accept and process the payment through Stripe
**Validates: Requirements 6.2**

Property 16: Data tokenization security
*For any* sensitive payment information entered, the system should use Stripe's tokenization to avoid storing raw payment data
**Validates: Requirements 6.1**

## Error Handling

### Payment Processing Errors
- Network failures during Stripe communication
- Invalid payment methods or declined cards
- Webhook delivery failures
- Duplicate payment attempts

### Data Integrity Errors
- Order creation failures after successful payment
- Email delivery failures
- Database connection issues
- Inventory synchronization problems

### User Experience Errors
- Form validation and user input errors
- Session timeouts during checkout
- Browser compatibility issues
- Mobile responsiveness problems

### Error Recovery Strategies
- Retry mechanisms for transient failures
- Manual order reconciliation tools
- Customer service contact options
- Graceful degradation for non-critical features

## Testing Strategy

### Dual Testing Approach

The system will use both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** will verify:
- Specific payment scenarios and edge cases
- Email template rendering and content
- Database operations and data validation
- Integration points with Stripe API
- Form validation and user input handling

**Property-Based Tests** will verify:
- Universal properties across all valid inputs using **fast-check** (JavaScript property testing library)
- Each property-based test will run a minimum of 100 iterations
- Tests will be tagged with comments referencing design document properties
- Format: `**Feature: direct-book-sales, Property {number}: {property_text}**`

**Integration Testing** will cover:
- End-to-end payment flows
- Webhook processing and order creation
- Email delivery and notification systems
- Order status updates and customer communications

**Security Testing** will validate:
- PCI compliance through Stripe integration
- Data encryption and secure storage
- Input sanitization and XSS prevention
- Authentication and authorization for admin functions

### Testing Configuration
- Property-based tests configured for minimum 100 iterations
- Each correctness property implemented as a single property-based test
- Unit tests focused on specific examples and edge cases
- Integration tests for complete user workflows

<function_calls>
<invoke name="prework">
<parameter name="featureName">direct-book-sales