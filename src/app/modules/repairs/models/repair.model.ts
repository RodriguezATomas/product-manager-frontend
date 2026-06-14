export interface RepairCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface RepairProduct {
  type: string;
  brand: string;
  model: string;
  serialNumber?: string;
  problemDescription: string;
}

export interface Repair {
  _id: string;
  customer: RepairCustomer;
  product: RepairProduct;
  appointmentDate: string;
  status: string;
  adminNotes?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

export interface RepairPayload {
  customer: RepairCustomer;
  product: RepairProduct;
  appointmentDate: string;
}
