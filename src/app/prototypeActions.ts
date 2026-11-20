import type {
  CartItem,
  CheckoutInput,
  DemandRequirement,
  Enquiry,
  EnquiryStatus,
  MakerApplication,
  OrderStatus,
  ReadinessStatus,
  ProducerSubmission,
  PrototypeRole,
  QCInput,
  Review,
  SKU,
  ToastMessage,
} from '../types';
export type PrototypeAction =
  | { type: 'SET_ROLE'; payload: PrototypeRole }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'te' }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; variant?: string } }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; variant?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CREATE_ORDER'; payload: CheckoutInput }
  | {
      type: 'CREATE_PRODUCER_SUBMISSION';
      payload: Omit<
        ProducerSubmission,
        'id' | 'submittedAt' | 'status' | 'quantityAccepted' | 'quantityRework' | 'quantityRejected'
      >;
    }
  | { type: 'PROCESS_QC'; payload: QCInput }
  | { type: 'CREATE_DEMAND_REQUIREMENT'; payload: DemandRequirement }
  | { type: 'UPDATE_DEMAND_REQUIREMENT'; payload: DemandRequirement }
  | { type: 'CREATE_SKU'; payload: SKU }
  | { type: 'UPDATE_SKU'; payload: SKU }
  | { type: 'MARK_PAYOUT_PAID'; payload: { payoutId: string } }
  | { type: 'TOGGLE_WISHLIST'; payload: { productId: string } }
  | { type: 'ADD_REVIEW'; payload: Omit<Review, 'id' | 'createdAt' | 'verified'> }
  | { type: 'APPLY_COUPON'; payload: { code: string } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'CREATE_ENQUIRY'; payload: Omit<Enquiry, 'id' | 'status' | 'createdAt'> }
  | { type: 'UPDATE_ENQUIRY_STATUS'; payload: { id: string; status: EnquiryStatus } }
  | { type: 'CREATE_APPLICATION'; payload: Omit<MakerApplication, 'id' | 'status' | 'createdAt'> }
  | {
      type: 'REVIEW_APPLICATION';
      payload: { id: string; decision: 'approved' | 'declined'; skuIds?: string[] };
    }
  | { type: 'SET_READINESS'; payload: { id: string; status: ReadinessStatus } }
  | { type: 'RESET_PROTOTYPE' }
  | { type: 'CREATE_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: { id: string } };
