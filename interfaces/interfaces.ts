import {
    ActionType,
    LogContext,
    LogLevel, RequestStatus, RequestType, ReturnReason,
    Role,
    StatusOrder,
    StockMovementType,
    TypeContract, TypeId, TypeIdBusiness,
    TypeStore,
    UnitType,
} from '@/interfaces/enums';

export interface BaseEntity {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface BaseEntityWithNumId extends BaseEntity {
    numId: number;
}

// =============================================================================
// AUTH MODELS
// =============================================================================

export interface User extends BaseEntityWithNumId {
    docId: string;
    status: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    storeId?: string;

    // Relations
    credentials?: Credentials;
    userDetails?: UserDetails;
    store?: Store;
    bills?: Bill[];
}

export interface Credentials extends BaseEntity {
    userId: string;
    username: string;
    password: string;

    // Relations
    user?: User;
}

export interface UserDetails extends BaseEntity {
    userId: string;
    address?: string | null;
    birthDate?: Date | string | null;
    city?: string | null;
    imgUrl?: string | null;
    position?: string | null;
    typeContract?: TypeContract | null;

    // Relations
    user?: User;
}

// =============================================================================
// INVENTORY MODELS
// =============================================================================

export interface Store extends BaseEntityWithNumId {
    name: string;
    phone?: string;
    address?: string;
    type: TypeStore;
    managerId?: string;
    available: boolean;

    // Relations
    users?: User[];
    storeProducts?: StoreProduct[];
    stockMovements?: StockMovement[];
    orders?: Order[];
    customOrders?: CustomOrder[];
    bills?: Bill[];
}

export interface Product extends BaseEntityWithNumId {
    name: string;
    centralStock: number;
    basePrice: number | string;
    supplierId?: string;
    categoryId?: string;
    expiryDate?: Date | string;
    imageUrl?: string;
    unit?: UnitType;
    minStock?: number;
    available: boolean;
    deletedAt?: Date | string;

    // Relations
    supplier?: Supplier;
    category?: CategoryProduct;
    billDetails?: DetailBill[];
    supplies?: ProductSupply[];
    orderDetails?: DetailOrder[];
    storeProducts?: StoreProduct[];
}

export interface StoreProduct extends BaseEntityWithNumId {
    storeId: string;
    productId: string;
    allocatedStock: number;
    currentStock: number;
    price?: number | string;
    minStock?: number;
    available: boolean;
    lastAllocation?: Date | string;

    // Relations
    store?: Store;
    product?: Product;
}

// Entidad para rastrear movimientos de stock
export interface StoreRequest extends BaseEntity {
    type: RequestType;
    status: RequestStatus;
    requestingStoreId: string;
    requestingUserId: string;
    targetStoreId: string;
    approvedByUserId?: string;
    requestedDate: Date | string;
    approvedDate?: Date | string;
    completedDate?: Date | string;

    // Relations
    details?: Partial<StoreRequestDetail>[];
}

export interface StoreRequestDetail extends BaseEntity {
    requestId: string;
    productId: string;
    requestedQuantity: number;
    unitPrice?: number | string; // Decimal
    totalPrice?: number | string; // Decimal
    returnReason?: ReturnReason;

    // Relations
    request?: StoreRequest;
    product?: Product;
}

export interface StockMovement extends BaseEntity {
    productId: string;
    storeId: string;
    type: StockMovementType;
    quantity: number;
    previousStock?: number;
    newStock?: number;
    storeRequestId?: string;
    orderId?: string;
    billId?: string;
    userId?: string;

    // Relations
    product?: Product;
    store?: Store;
    storeRequest?: StoreRequest;
    order?: Order;
    bill?: Bill;
    user?: User;
}

export interface Supply extends BaseEntityWithNumId {
    name: string;
    price: number | string; // Decimal
    unit: UnitType;
    quantity: number | string; // Decimal
    minStock: number | string; // Decimal
    supplierId?: string;
    available: boolean;

    // Relations
    supplier?: Supplier;
    products?: ProductSupply[];
}

export interface ProductSupply {
    productId: string;
    supplyId: string;
    amountUsed: string; // Decimal
    createdAt: Date | string;
    updatedAt: Date | string;

    // Relations
    product?: Product;
    supply?: Supply;
}

export interface Supplier extends BaseEntityWithNumId {
    typeId: TypeIdBusiness;
    docId: string;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    available: boolean;
    deletedAt?: Date | string;

    // Relations
    products?: Product[];
    supplies?: Supply[];
}

export interface CategoryProduct extends BaseEntity {
    name: string;

    // Relations
    products?: Product[];
}

// =============================================================================
// SALES MODELS
// =============================================================================

export interface Client extends BaseEntityWithNumId {
    typeId: TypeId;
    docId: string;
    name: string;
    phone?: string;
    email?: string;

    // Relations
    orders?: Order[];
    customOrders?: CustomOrder[];
    deliveries?: Delivery[];
}

export interface Order extends BaseEntityWithNumId {
    status: StatusOrder;
    totalPrice: number | string; // Decimal
    paymentMethod: string;
    amountReceived?: string;
    change?: string;
    clientId: string;
    storeId: string;
    userId: string;

    // Relations
    client?: Client;
    store?: Store;
    user?: User;
    details?: DetailOrder[];
    
    bill?: Bill;
}

export interface DetailOrder extends BaseEntity {
    orderId: string;
    productId?: string;
    quantity: number;
    price: number | string; // Decimal

    // Relations
    order?: Order;
    product?: Product;
}

export interface CustomOrder extends BaseEntityWithNumId {
    clientId: string;
    storeId: string;
    userId: string;
    depositAmount: number | string; // Decimal
    remainingAmount: number | string; // Decimal
    totalPrice: number | string; // Decimal
    status: StatusOrder;
    available: boolean;
    deletedAt?: Date | string;

    // Relations
    client?: Partial<Client>;
    store?: Store;
    deliveries?: Delivery[];
    details?: DetailCustomOrder[];
    products?: CustomOrderProduct[];
    bill?: Bill;
}

export interface DetailCustomOrder extends BaseEntity {
    customOrderId: string;
    imageUrl: string;
    pounds: number;
    tiers: number;
    price: number | string; // Decimal

    // Relations
    customOrder?: CustomOrder;
}

export interface CustomOrderProduct {
    customOrderId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: number | string; // Decimal

    // Relations
    customOrder?: CustomOrder;
    product?: Partial<Product>;
}

export interface Bill extends BaseEntityWithNumId {
    dueDate?: Date | string;
    totalPrice: number | string; // Decimal
    userId: string;
    storeId: string;
    orderId?: string;
    customOrderId?: string;

    // Relations
    user?: User;
    store?: Store;
    order?: Order;
    customOrder?: CustomOrder;
    details?: DetailBill[];
}

export interface DetailBill extends BaseEntity {
    billId: string;
    productId: string;
    quantity: number;
    price: number | string; // Decimal

    // Relations
    bill?: Bill;
    product?: Product;
}

export interface Delivery extends BaseEntityWithNumId {
    date: Date | string;
    status: string;
    address?: string;
    clientId?: string;
    orderId?: string;

    // Relations
    client?: Client;
    order?: Order;
}