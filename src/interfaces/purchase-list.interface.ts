export interface IPurchase {
  _id?: string;
  name: string;
  isCompleted: boolean;
  addedBy: string;
}

export interface IPurchaseList {
  _id?: string;
  reactId?: string;
  title: string;
  items: IPurchase[];
  sharedWith: string[];
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}
