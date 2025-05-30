import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
    await mongooseConnect();

    const { method } = req;

    if (method === "GET") {
        // Fetch all orders as plain JS objects
        const orders = await Order.find().sort({ createdAt: -1 }).lean();

        // Ensure line_items is always an array
        const normalizedOrders = orders.map(order => ({
            ...order,
            line_items: Array.isArray(order.line_items) ? order.line_items : [],
        }));

        res.json(normalizedOrders);
    } else if (method === "PUT") {
        const { orderId, paid } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "orderId is required" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { paid }, { new: true }).lean();
        res.json(updatedOrder);
    } else {
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
