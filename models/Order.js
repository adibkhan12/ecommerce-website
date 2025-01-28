import  {model, models, Schema} from "mongoose";

const OrderSchema = new Schema({
    line_items: Object,
    name: String,
    email: String,
    city: String,
    postal_code: String,
    addressLine1: String,
    addressLine2: String,
    country: String,
    paid:Boolean,
},  {
    timestamps: true,
});

export const Order = models?.Order || model('Order', OrderSchema);