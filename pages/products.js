import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [editedStocks, setEditedStocks] = useState({});
    useEffect(() => {
        axios.get("/api/product").then(response => {
            setProducts(response.data);
        })
    }, []);
    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link className="btn-primary" href="/products/new">
                    + Add new product
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 text-sm rounded-xl overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <tr>
                            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Product Name</th>
                            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Stock</th>
                            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="text-gray-500 text-center py-6">No products found.</td>
                            </tr>
                        ) : (
                            products.map((product, idx) => (
                                <tr key={product._id} className={"transition-colors " + (idx % 2 === 0 ? "bg-white" : "bg-blue-50") + " hover:bg-blue-100/70"}>
                                    <td className="px-6 py-3 border-b align-middle text-gray-900 font-medium">{product.title}</td>
                                    <td className="px-6 py-3 border-b align-middle">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="px-2 py-1 bg-gray-200 rounded-full text-lg font-bold shadow hover:bg-gray-300 transition"
                                                onClick={() => {
                                                    setEditedStocks(stocks => ({
                                                        ...stocks,
                                                        [product._id]: Math.max(0, (stocks[product._id] ?? product.stock ?? 0) - 1)
                                                    }));
                                                }}
                                                type="button"
                                            >-</button>
                                            <span className="w-10 text-center text-base font-semibold text-gray-700">{typeof editedStocks[product._id] === 'number' ? editedStocks[product._id] : (typeof product.stock === 'number' ? product.stock : 0)}</span>
                                            <button
                                                className="px-2 py-1 bg-gray-200 rounded-full text-lg font-bold shadow hover:bg-gray-300 transition"
                                                onClick={() => {
                                                    setEditedStocks(stocks => ({
                                                        ...stocks,
                                                        [product._id]: (stocks[product._id] ?? product.stock ?? 0) + 1
                                                    }));
                                                }}
                                                type="button"
                                            >+</button>
                                            <button
                                                className={`px-3 py-1 rounded-full text-sm ml-2 font-semibold shadow transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-300 ${typeof editedStocks[product._id] !== 'number' || editedStocks[product._id] === product.stock ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'}`}
                                                onClick={async () => {
                                                    const newStock = typeof editedStocks[product._id] === 'number' ? editedStocks[product._id] : (product.stock ?? 0);
                                                    await axios.put('/api/product', { ...product, stock: newStock });
                                                    setProducts(products => products.map(p => p._id === product._id ? { ...p, stock: newStock } : p));
                                                    setEditedStocks(stocks => {
                                                        const updated = { ...stocks };
                                                        delete updated[product._id];
                                                        return updated;
                                                    });
                                                }}
                                                type="button"
                                                disabled={typeof editedStocks[product._id] !== 'number' || editedStocks[product._id] === product.stock}
                                            >Save</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 border-b align-middle">
                                        <Link className="btn-default inline-flex items-center gap-1 mr-2" href={`/products/edit/${product._id}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                            Edit
                                        </Link>
                                        <Link className="btn-delete inline-flex items-center gap-1" href={`/products/delete/${product._id}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                            Delete
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
