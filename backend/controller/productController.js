const Product = require("../model/Product");
const {cloudinary} = require("../config/cloudinary");

// get all products
const getProducts = async(req, res) =>{
    try{
        const products = await Product.find({});
        res.json(products);
    } catch (error){
        res.status(500).json({message: "Server error"});
    }
};

//get single product
const getProductById = async(req, res) =>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            res.json(product);
        } else{
            res.status(404).json({message: "Product not found"});
        }
    }
    catch(error){
        res.status(500).json({message: "Server error"});
    }
};


// create new product - ADMIN
const createProduct = async(req, res) =>{
    try{
//     if (req.file) {
//     console.log("Uploading:", req.file.path);

//     const result = await cloudinary.uploader.upload(req.file.path, {
//         resource_type: "image"
//     });

//     console.log("Upload successful:", result.secure_url);

//     imgUrl = result.secure_url;
//     }

//         const {name, description, price, category, stock} = req.body;
//         let imgUrl = "";
        
//         if(req.file){
//             // const result = await cloudinary.uploader.upload(req.file.path);
//             // imgUrl = result.secure_url;
//             const result = await cloudinary.uploader.upload(
//     "https://res.cloudinary.com/demo/image/upload/sample.jpg"
// );

// console.log("UPLOAD SUCCESS:", result.secure_url);
//         }
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a product image." });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "sikharmy"
        });
        const {name, description, price, category, stock} = req.body;
        
        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl: result.secure_url
        });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.log(err);
    res.status(500).json({
        message: "Server error",
        error: err.message || JSON.stringify(err) 
    });
    }
}

// update a product - ADMIN
const updateProduct = async (req, res) =>{
    try{
        const{name, description, price, category, stock} = req.body;
        const product = await Product.findById(req.params.id);
        if(product){
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock = stock || product.stock;

            if(req.file){
                // const result = await cloudinary.uploader.upload(req.file.path);
                // console.log(result);
                product.imageUrl = req.file.path;
            }
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        }
        else{
            res.status(404).json({message: "Product not found"});
        }
    } catch(err){
        console.log(err);
        res.status(500).json({message: "Server error", error: err});
    }
}

// delete a product - ADMIN
const deleteProduct = async(req, res) =>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            await product.deleteOne();
            res.json({message: "Product removed"});
        }
        else{
            res.status(404).json({message: "Product not found"});
        }
    } catch(err){
        res.status(500).json({message: "Server error"});
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}