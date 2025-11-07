import {
    ActionType, ExpenseCategory,
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
    typeId: TypeId;
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
    orders?: Order[];
    customOrders?: CustomOrder[];
    dailyExpenses?: DailyExpense[];
    cashClosings?: CashClosing[];
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
    imageUrl?: string | null;
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
    cashClosings?: CashClosing[];
    dailyExpenses?: DailyExpense[];
}

export interface CashClosing extends BaseEntityWithNumId {
    storeId: string;
    userId: string;
    closingDate: Date | string;
    description: string;
    totalOrders: number;
    totalRevenue: number | string;
    totalExpenses: number | string;
    netProfit: number | string;
    storeRequestId?: string;

    // Relations
    store?: Store;
    user?: User;
    storeRequest?: StoreRequest;
    orders?: CashClosingOrder[];
    expenses?: CashClosingExpense[];
}

export interface CashClosingOrder extends BaseEntity {
    cashClosingId: string;
    orderId: string;

    // Relations
    cashClosing?: CashClosing;
    order?: Order;
}

export interface CashClosingExpense extends BaseEntity {
    cashClosingId: string;
    expenseId: string;

    // Relations
    cashClosing?: CashClosing;
    expense?: DailyExpense;
}

export interface DailyExpense extends BaseEntityWithNumId {
    storeId: string;
    userId: string;
    category: ExpenseCategory;
    description: string;
    amount: number | string; // Decimal
    expenseDate: Date | string;

    // Relations
    store?: Store;
    user?: User;
    cashClosingExpenses?: CashClosingExpense[];
}

export interface Product extends BaseEntityWithNumId {
    name: string;
    centralStock: number;
    basePrice: number | string;
    supplierId?: string;
    categoryId?: string;
    subcategoryId?: string;
    expiryDate?: Date | string;
    imageUrl?: string;
    unit?: UnitType;
    minStock?: number;
    available: boolean;
    deletedAt?: Date | string;

    // Relations
    supplier?: Supplier;
    category?: CategoryProduct;
    subcategory?: SubcategoryProduct;
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
export interface StoreRequest extends BaseEntityWithNumId {
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
    requestingStore?: Store;
    targetStore?: Store;
    requestingUser?: User;
    approvedByUser?: User;
    cashClosings?: CashClosing[];
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
    subcategories?: SubcategoryProduct[];
    _count?: { products: number };
}

export interface SubcategoryProduct extends BaseEntity {
    name: string;
    categoryId: string;

    // Relations
    category?: CategoryProduct;
    products?: Product[];
    _count?: { products: number };
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
    bill?: Bill;
    details?: DetailOrder[];
    cashClosingOrders?: CashClosingOrder[];
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
    billNumber: string;
    dueDate?: Date | string;
    clientName?: string;
    clientDocType?: TypeId;
    clientDocId?: string;
    clientAddress?: string;
    clientPhone?: string;
    clientEmail?: string;
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
    productName: string;
    quantity: number;
    unitPrice: number | string;
    subtotal: number | string;

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