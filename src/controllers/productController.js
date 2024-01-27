import CatchAsyncError from "../middlewares/CatchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ProductModel from "../models/ProductModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";

// CREATE PRODUCT -- ADMIN
export const createProduct = CatchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await ProductModel.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});

// UPDATE PRODUCT -- ADMIN
export const updateProduct = CatchAsyncError(async (req, res) => {
  const { params, body } = req;
  let product = await ProductModel.findById(params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 500));
  }

  product = await ProductModel.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, product });
});

// DELETE PRODUCT -- ADMIN
export const deleteProduct = CatchAsyncError(async (req, res) => {
  const { params } = req;
  const product = await ProductModel.findById(params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await product.remove();

  res.status(200).json({ success: true, message: "Product deleted" });
});

// GET ALL PRODUCTS
export const getAllProducts = CatchAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productCound = await ProductModel.countDocuments();

  const { query } = req;
  const apiFeature = new ApiFeatures(ProductModel.find(), query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const allProducts = await apiFeature.query;

  if (!allProducts) {
    return next(new ErrorHandler("Products List not found", 500));
  }

  res.status(200).json({ success: true, allProducts, productCound });
});

// GET PRODUCT DETAILS
export const getProductDetails = CatchAsyncError(async (req, res, next) => {
  const { params } = req;
  const product = await ProductModel.findById(params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 500));
  }

  res.status(200).json({ success: true, product });
});
