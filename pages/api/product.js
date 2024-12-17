import {Product} from "@/models/product";
import {mongooseConnect} from "@/lib/mongoose";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;
const _id = new mongoose.Types.ObjectId(); // Example usage

export default async function handle(req, res) {
    const {method} = req;
    await mongooseConnect()
    console.log('Request method:', method);

    if (method === "GET") {
        if(req.query?.id){
            res.json(await Product.findOne({_id: req.query.id}));
        }
        else{
            res.json(await Product.find());
        }
    }

    if (req.method === 'POST') {
        const {title, description, price, images} = req.body;
        console.log('Creating product:', title, description, price, images); // Debug log
        const productDoc = await Product.create({
            title,
            description,
            price,
        })
        res.json(productDoc)
    }

    if (method === 'PUT'){
        const {title, description, price,_id, images} = req.body;
        await Product.updateOne({_id}, {title, description, price, images});
        res.json(true);
    }
    if (method === 'DELETE'){
        if(req.query?.id){
            await Product.deleteOne({_id:req.query?.id});
            res.json(true);
        }
    }
}