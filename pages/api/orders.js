import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import nodemailer from "nodemailer";

let transporter;
try {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    console.log('Nodemailer transporter created successfully.');
} catch (transporterErr) {
    console.error('Error creating Nodemailer transporter:', transporterErr);
}

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
    } else if (method === "POST") {
        try {
            const orderData = req.body;
            const newOrder = await Order.create(orderData);

            // Send confirmation email
            if (orderData.email) {
                const orderDetails = `Order ID: ${newOrder._id}\nTotal: ${orderData.total || ''}\nItems: ${Array.isArray(orderData.line_items) ? orderData.line_items.map(item => `${item?.price_data?.product_data?.name || 'Product'} x ${item?.quantity || 1}`).join(', ') : ''}`;
                try {
                    const mailOptions = {
                        from: process.env.SMTP_FROM,
                        to: orderData.email,
                        subject: 'Order Confirmation',
                        text: `Thank you for your order!\n\n${orderDetails}`,
                        html: `<h2>Thank you for your order!</h2><p>${orderDetails.replace(/\n/g, '<br>')}</p>`,
                    };
                    console.log('Attempting to send email with options:', mailOptions);
                    const info = await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully. Nodemailer info:', info);
                } catch (mailErr) {
                    console.error('Nodemailer error:', mailErr);
                }
            }

            res.status(201).json(newOrder);
        } catch (error) {
            console.error('Order creation or email error:', error);
            res.status(500).json({ error: 'Order creation or email failed', details: error.message });
        }
    } else if (method === "PUT") {
        const { orderId, paid, status } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "orderId is required" });
        }

        // Build update object dynamically
        const updateFields = {};
        if (typeof paid !== 'undefined') updateFields.paid = paid;
        if (typeof status !== 'undefined') updateFields.status = status;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true }).lean();
        res.json(updatedOrder);
    } else {
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
