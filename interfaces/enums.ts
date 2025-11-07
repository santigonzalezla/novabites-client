export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    USER = 'USER'
}

export enum TypeStore {
    PRINCIPAL = 'PRINCIPAL',
    NORMAL = 'NORMAL',
    DISTRIBUTION = 'DISTRIBUTION'
}

export enum TypeId {
    CC = 'CC',
    NIT = 'NIT',
    TI = 'TI',
    CE = 'CE',
    PP = 'PP',
}

export enum  TypeIdBusiness {
    CC = 'CC',
    NIT = 'NIT',
}

export enum TypeContract {
    INDEFINITE = 'INDEFINITE',
    FIXED_TERM = 'FIXED_TERM',
    INTERNSHIP = 'INTERNSHIP',
    TEMPORARY = 'TEMPORARY',
    PART_TIME = 'PART_TIME',
}

export enum UnitType {
    KG = 'KG',
    L = 'L',
    UN = 'UN',
    GRAM = 'GRAM',
    ML = 'ML',
    LB = 'LB'
}

export enum StatusOrder {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export enum StockMovementType {
    ALLOCATION = 'ALLOCATION',
    RETURN = 'RETURN',
    ADJUSTMENT = 'ADJUSTMENT',
    SALE = 'SALE',
    LOSS = 'LOSS'
}

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL'
}

export enum LogContext {
    AUTH = 'AUTH',
    USER_MANAGEMENT = 'USER_MANAGEMENT',
    INVENTORY = 'INVENTORY',
    SALES = 'SALES',
    ORDERS = 'ORDERS',
    BILLING = 'BILLING',
    DELIVERY = 'DELIVERY',
    SYSTEM = 'SYSTEM',
    SECURITY = 'SECURITY'
}

export enum ActionType {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    BACKUP = 'BACKUP',
    RESTORE = 'RESTORE'
}

export enum RequestType {
    SUPPLY_REQUEST = 'SUPPLY_REQUEST',
    RETURN_REQUEST = 'RETURN_REQUEST',
    RELOCATION_REQUEST = 'RELOCATION_REQUEST'
}

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED'
}

export enum ReturnReason {
    DAMAGED = 'DAMAGED',
    EXPIRED = 'EXPIRED',
    INCORRECT = 'INCORRECT',
    EXCESS_STOCK = 'EXCESS_STOCK',
    OTHER = 'OTHER'
}

export enum ExpenseCategory {
    RENT = 'RENT',
    UTILITIES = 'UTILITIES',
    SERVICES = 'SERVICES',
    MAINTENANCE = 'MAINTENANCE',
    SUPPLIES = 'SUPPLIES',
    OTHER = 'OTHER'
}