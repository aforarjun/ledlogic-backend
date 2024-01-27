import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductDetails,
} from "../controllers/productController.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middlewares/Authentication.js";

const router = express.Router();

router.get("/products", getAllProducts);
router.post(
  "/product/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createProduct
);
router.put(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);
router.delete(
  "/product/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router.get("/product/:id", getProductDetails);

export default router;
