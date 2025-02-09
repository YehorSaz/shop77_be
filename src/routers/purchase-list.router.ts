import { Router } from 'express';

import { purchaseController } from '../controllers';
import { authMiddleware, commonMiddleware } from '../middlewares';
import { PurchaseValidator } from '../validators/purchase.validator';

const router = Router();

// get all purchaseLists
router.get(
  '/',
  authMiddleware.checkAccessToken,
  purchaseController.getAllByUserId,
);

//add purchase list
router.post(
  '/',
  authMiddleware.checkAccessToken,
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.createPurchaseList),
  purchaseController.addPurchaseList,
);
// update list
router.put(
  '/:purchaseListId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isOwner(),
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.updatePurchaseList),
  purchaseController.updatePurchaseList,
);

// delete list
router.delete(
  '/:purchaseListId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isOwner(),
  purchaseController.deletePurchaseList,
);

// add purchase
router.post(
  '/:purchaseListId/items',
  authMiddleware.checkAccessToken,
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.addItem),
  purchaseController.addItem,
);

// update purchase
router.patch(
  '/:purchaseListId/items/:itemId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.updateItem),
  purchaseController.updateItem,
);

// delete purchase
router.delete(
  '/:purchaseListId/items/:itemId',
  authMiddleware.checkAccessToken,
  purchaseController.deleteItem,
);

// share list
router.post(
  '/:purchaseListId/share',
  authMiddleware.checkAccessToken,
  commonMiddleware.isOwner(),
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.sharedId),
  purchaseController.shareList,
);
// unShare list
router.delete(
  '/:purchaseListId/share',
  authMiddleware.checkAccessToken,
  commonMiddleware.isOwner(),
  commonMiddleware.isPurchaseBodyValid(PurchaseValidator.unShareBody),
  purchaseController.unShareList,
);

export const purchaseListRouter = router;
