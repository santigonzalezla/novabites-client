import { 
    User,
    Bill,
    DetailBill,
    Client,
    DetailOrder,
    Order,
    DetailCustomOrder,
    CustomOrder,
    Store,
    Product,
    CategoryProduct,
    Supplier,
    Supply,
    Credentials,
    Delivery
} from "./interfaces";

export type CreateUser = Omit<User, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'credentials' | 'store' | 'bills' | 'logs'>;
export type CreateCredentials = Omit<Credentials, 'id' | 'createdAt' | 'updatedAt' | 'user'>;
export type CreateStore = Omit<Store, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'users' | 'products' | 'orders' | 'customOrders' | 'bills' | 'logs'>;
export type CreateProduct = Omit<Product, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'store' | 'supplier' | 'category' | 'supplies' | 'orderDetails' | 'billDetails' | 'logs'>;
export type CreateSupply = Omit<Supply, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'supplier' | 'products'>;
export type CreateSupplier = Omit<Supplier, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'products' | 'supplies'>;
export type CreateCategoryProduct = Omit<CategoryProduct, 'id' | 'createdAt' | 'updatedAt' | 'products'>;
export type CreateClient = Omit<Client, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'orders' | 'customOrders' | 'deliveries' | 'logs'>;
export type CreateOrder = Omit<Order, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'client' | 'store' | 'details' | 'deliveries' | 'logs' | 'bill'>;
export type CreateDetailOrder = Omit<DetailOrder, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'product'>;
export type CreateCustomOrder = Omit<CustomOrder, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'client' | 'store' | 'details' | 'bill'>;
export type CreateDetailCustomOrder = Omit<DetailCustomOrder, 'id' | 'createdAt' | 'updatedAt' | 'customOrder'>;
export type CreateBill = Omit<Bill, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'user' | 'store' | 'order' | 'customOrder' | 'details' | 'logs'>;
export type CreateDetailBill = Omit<DetailBill, 'id' | 'createdAt' | 'updatedAt' | 'bill' | 'product'>;
export type CreateDelivery = Omit<Delivery, 'id' | 'numId' | 'createdAt' | 'updatedAt' | 'client' | 'order'>;

// Update types (all fields optional except id)
export type UpdateUser = Partial<CreateUser> & { id: string };
export type UpdateCredentials = Partial<CreateCredentials> & { id: string };
export type UpdateStore = Partial<CreateStore> & { id: string };
export type UpdateProduct = Partial<CreateProduct> & { id: string };
export type UpdateSupply = Partial<CreateSupply> & { id: string };
export type UpdateSupplier = Partial<CreateSupplier> & { id: string };
export type UpdateCategoryProduct = Partial<CreateCategoryProduct> & { id: string };
export type UpdateClient = Partial<CreateClient> & { id: string };
export type UpdateOrder = Partial<CreateOrder> & { id: string };
export type UpdateDetailOrder = Partial<CreateDetailOrder> & { id: string };
export type UpdateCustomOrder = Partial<CreateCustomOrder> & { id: string };
export type UpdateDetailCustomOrder = Partial<CreateDetailCustomOrder> & { id: string };
export type UpdateBill = Partial<CreateBill> & { id: string };
export type UpdateDetailBill = Partial<CreateDetailBill> & { id: string };
export type UpdateDelivery = Partial<CreateDelivery> & { id: string };
