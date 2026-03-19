export interface IPurchase {
  _id?: string;
  name: string;
  isCompleted: boolean;
  addedBy: string;
}

export interface IPurchaseList {
  _id?: string;
  reactId: string;
  title: string;
  items: IPurchase[];
  sharedWith: string[];
  user: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserShort {
  _id: string;
  name: string;
  email: string;
}

export interface IPurchaseListPopulated {
  _id?: string;
  reactId: string;
  title: string;
  items: IPurchase[];
  sharedWith: IUserShort[];
  user: IUserShort;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IPurchaseListAll {
  myLists: IPurchaseList[];
  sharedLists: IPurchaseList[];
}
