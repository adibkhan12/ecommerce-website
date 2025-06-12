import {Product} from "@/models/product";
import {mongooseConnect} from "@/lib/mongoose";
import mongoose from "mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";

const { ObjectId } = mongoose.Types;
const _id = new mongoose.Types.ObjectId(); // Example usage

export default async function handle(req, res) {
    const {method} = req;
    await mongooseConnect()
    await isAdminRequest(req,res);

    if (method === "GET") {
        if(req.query?.id){
            res.json(await Product.findOne({_id: req.query.id}));
        }
        else{
            res.json(await Product.find());
        }
    }

    if (req.method === 'POST') {
        const {title, description, price, images, colorVariants, category, properties, stock} = req.body;
        // If colorVariants exist and are non-empty, ignore images
        const productDoc = await Product.create({
            title,
            description,
            price,
            stock,
            images: (!colorVariants || colorVariants.length === 0) ? images : [],
            colorVariants: colorVariants || [],
            category,
            properties
        })
        res.json(productDoc)
    }

    if (method === 'PUT') {
        try {
            const { title, description, price, _id, category, images, colorVariants, properties, stock } = req.body;

            if (!_id) {
                return res.status(400).json({ error: 'Missing product ID' });
            }

            const result = await Product.updateOne(
                { _id },
                {
                  title,
                  description,
                  price,
                  stock,
                  images: (!colorVariants || colorVariants.length === 0) ? images : [],
                  colorVariants: colorVariants || [],
                  category,
                  properties
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (method === 'DELETE'){
        if(req.query?.id){
            await Product.deleteOne({_id:req.query?.id});
            res.json(true);
        }
    }
}