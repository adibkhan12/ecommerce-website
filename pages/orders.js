import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        axios.get("/api/orders").then((response) => {
            setOrders(response.data);
        }).catch((error) => {
            console.error("Error fetching orders:", error);
        });
    }, []);

    const togglePaidStatus = (orderId, currentStatus) => {
        axios
            .put("/api/orders", { orderId, paid: !currentStatus })
            .then((response) => {
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
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            {orders.length === 0 ? (
                <div className="text-gray-500 text-center mt-10">No orders found.</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="bg-white shadow-md rounded-lg p-6 border border-gray-200 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Order ID:</span>
                                <span className="font-mono text-xs text-gray-700">{order._id}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Date:</span>
                                <span className="text-sm">{(new Date(order.createdAt)).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Paid:</span>
                                <span
                                    className={
                                        order.paid
                                            ? "text-green-600 font-semibold cursor-pointer flex items-center"
                                            : "text-red-600 font-semibold cursor-pointer flex items-center"
                                    }
                                    onClick={() => togglePaidStatus(order._id, order.paid)}
                                    title="Toggle paid status"
                                >
                                    {order.paid ? (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            Paid
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            Unpaid
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Number:</span>
                                <span className="text-sm">{order.number || <span className="text-gray-300">N/A</span>}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">Total Price:</span>
                                <span className="text-sm">
                                    {Array.isArray(order.line_items) && order.line_items.length > 0
                                        ? `${(
                                            order.line_items.reduce((sum, item) => {
                                                const unit = item?.price_data?.unit_amount || 0;
                                                const qty = item?.quantity || 0;
                                                return sum + unit * qty;
                                            }, 0) / 100
                                        ).toLocaleString(undefined, { minimumFractionDigits: 2 })} AED`
                                        : <span className="text-gray-300">N/A</span>
                                    }
                                </span>
                            </div>
                            <div className="mb-2">
                                <span className="text-xs text-gray-400">Recipient:</span>
                                <div className="ml-2 text-sm">
                                    <div className="font-semibold">{order.name} <span className="text-xs text-gray-500">({order.email})</span></div>
                                    <div>{order.addressLine1} {order.addressLine2}</div>
                                    <div>{order.city} {order.postalCode}</div>
                                    <div>{order.country}</div>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400">Products:</span>
                                <div className="ml-2 mt-1">
                                    {Array.isArray(order.line_items) && order.line_items.length > 0 ? (
                                        order.line_items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm py-1">
                                                <span className="font-medium">{item?.price_data?.product_data?.name || "Unnamed Product"}</span>
                                                <span className="text-gray-500">x {item?.quantity || 0}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-gray-400 text-xs">No products</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
