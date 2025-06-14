import mongoose, {model, Schema, models} from 'mongoose';
import { Color } from './Color';

const ProductSchema = new Schema({
    title: {type: String, required: true},
    description: String,
    price:{type:Number, required: true},
    stock: {type: Number, required: true, default: 0},
    images: [{type:String}], // Only used if no colorVariants
    colorVariants: [
      {
        color: { type: mongoose.Types.ObjectId, ref: 'Color', required: true },
        images: [{ type: String, required: true }]
      }
    ],
    category:{type:mongoose.Types.ObjectId, ref: 'Category'},
    properties:{type:Object},
},{
    timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);
