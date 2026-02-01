const express = require('express');
const Product = require('../Models/Product');
const multer = require("multer");
const ImageKit = require("imagekit");


const upload = multer({ storage: multer.memoryStorage() });

const safeParse = (value) => {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const router = express.Router();

let imagekit = null;

const {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT
} = process.env;

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
  console.warn("⚠️ ImageKit env variables missing:", {
    IMAGEKIT_PUBLIC_KEY: !!IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: !!IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: !!IMAGEKIT_URL_ENDPOINT
  });
} else {
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT
  });
}

router.post('/add', upload.single("image"), async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    const {
      brandName,
      productType,
      formType,
      availability,
      genericType,
      packaging,
      genericName
    } = req.body;

    // Duplicate medicine check (normalized and case-insensitive)
    const normalizedBrand = brandName.trim().toLowerCase();
    const normalizedGeneric = genericName.trim().toLowerCase();
    const normalizedForm = formType.trim().toLowerCase();
    const normalizedPackaging = packaging.trim().toLowerCase();

    const existingProduct = await Product.findOne({
      brandName: { $regex: `^${normalizedBrand}$`, $options: "i" },
      genericName: { $regex: `^${normalizedGeneric}$`, $options: "i" },
      formType: { $regex: `^${normalizedForm}$`, $options: "i" },
      packaging: { $regex: `^${normalizedPackaging}$`, $options: "i" }
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "This medicine already exists"
      });
    }

    let imageUrl = null;

    if (req.file) {
      if (!imagekit) {
        throw new Error("ImageKit not configured. Check environment variables.");
      }

      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: Date.now() + "-" + req.file.originalname,
        folder: "/products"
      });

      imageUrl = uploadResponse.url;
    }

    const newProduct = new Product({
      brandName,
      productType,
      formType,
      availability,
      genericType,
      packaging,
      genericName,
      category: safeParse(req.body.categories), 
      composition: safeParse(req.body.composition),
      uses: safeParse(req.body.uses),
      highlights: safeParse(req.body.highlights),
      image: imageUrl
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: savedProduct
    });
  } catch (error) {
    console.error("❌ ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while adding product",
      error: error.message
    });
  }
});


// PATCH update product
router.patch(
  "/update/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      const {
        brandName,
        productType,
        formType,
        availability,
        genericType,
        packaging,
        genericName
      } = req.body;

      // Build update object ONLY with received fields
      const updateData = {
        brandName,
        productType,
        formType,
        availability,
        genericType,
        packaging,
        genericName,
        category: safeParse(req.body.categories),
        composition: safeParse(req.body.composition),
        uses: safeParse(req.body.uses),
        highlights: safeParse(req.body.highlights)
      };

      // Remove undefined fields (important)
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      // Image update (only if new image sent)
      if (req.file) {
        if (!imagekit) {
          throw new Error("ImageKit not configured");
        }

        const uploadResponse = await imagekit.upload({
          file: req.file.buffer,
          fileName: Date.now() + "-" + req.file.originalname,
          folder: "/products"
        });

        updateData.image = uploadResponse.url;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct
      });
    } catch (error) {
      console.error("❌ UPDATE PRODUCT ERROR:", error);

      res.status(500).json({
        success: false,
        message: "Internal server error while updating product",
        error: error.message
      });
    }
  }
);



router.get("/all", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});

// DELETE product
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("❌ DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error while deleting product",
      error: error.message
    });
  }
});

module.exports = router;
