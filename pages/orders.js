import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axios.get("/api/orders").then((response) => {
            console.log("Fetched Orders:", response.data); // Debug log to inspect data
            setOrders(response.data);
        }).catch((error) => {
            console.error("Error fetching orders:", error);
        });
    }, []);

    const togglePaidStatus = (orderId, currentStatus) => {
        axios
            .put("/api/orders", { orderId, paid: !currentStatus })
            .then((response) => {
                console.log("Updated Order:", response.data);
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId ? { ...order, paid: !currentStatus } : order
                    )
                );
            })
            .catch((error) => {
                console.error("Error updating order:", error.response?.data || error.message);
            });
    };

    return (
        <Layout>
            <h1>Orders</h1>
            <table className="basic m-4">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Paid</th>
                    <th>Recipient</th>
                    <th>Products</th>
                </tr>
                </thead>
                <tbody>
                {orders.length > 0 && orders.map((order) => (
                    <tr key={order._id}> {/* Add a unique key here */}
                        <td>
                            {(new Date(order.createdAt)).toLocaleString()}
                        </td>
                        <td
                            className={order.paid ? "text-green-600 cursor-pointer" : "text-red-600 cursor-pointer"}
                            onClick={() => togglePaidStatus(order._id, order.paid)}
                        >
                            {order.paid ? "YES" : "NO"}
                        </td>
                        <td>
                            {order.name} ({order.email})<br/>
                            {order.addressLine1} {order.addressLine2}<br/>
                            {order.city} {order.postalCode}<br/>
                            {order.country}
                        </td>
                        <td>
                            {order.line_items?.map((item, index) => (
                                <div key={index}>
                                    {item.price_data?.product_data?.name || "Unnamed Product"} x {item.quantity || 0}
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Layout>
    );
}
