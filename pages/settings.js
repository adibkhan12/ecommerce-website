import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { withSwal } from "react-sweetalert2";

function SettingsPage({ swal }) {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [featuredProductId1, setFeaturedProductId1] = useState("");
    const [featuredProductId2, setFeaturedProductId2] = useState("");
    const [featuredProductId3, setFeaturedProductId3] = useState("");
    const [featuredLoading, setFeaturedLoading] = useState(true);

    // Fetch products and saved settings when component mounts
    useEffect(() => {
    (async () => {
        try {
            // Fetch available products
            const productResponse = await axios.get("/api/product");
            setProducts(productResponse.data);

            // Helper to fetch setting and handle 404 gracefully
            async function fetchSetting(name) {
                try {
                    const res = await axios.get(`/api/settings?name=${name}`);
                    return res.data?.value || "";
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        return "";
                    }
                    throw err;
                }
            }
            const [val1, val2, val3] = await Promise.all([
                fetchSetting("featuredProductId1"),
                fetchSetting("featuredProductId2"),
                fetchSetting("featuredProductId3"),
            ]);
            setFeaturedProductId1(val1);
            setFeaturedProductId2(val2);
            setFeaturedProductId3(val3);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setProductsLoading(false);
            setFeaturedLoading(false);
        }
    })();
    }, []);

    // Save settings to the backend
    async function saveSettings() {
        if (!featuredProductId1 && !featuredProductId2 && !featuredProductId3) {
            await swal.fire("Error", "No featured products selected", "error");
            return;
        }
        try {
            await Promise.all([
                axios.put("/api/settings", {
                    name: "featuredProductId1",
                    value: featuredProductId1,
                }),
                axios.put("/api/settings", {
                    name: "featuredProductId2",
                    value: featuredProductId2,
                }),
                axios.put("/api/settings", {
                    name: "featuredProductId3",
                    value: featuredProductId3,
                }),
            ]);

            await swal.fire("Success", "Settings saved successfully!", "success");
        } catch (error) {
            await swal.fire("Error", error.response?.data || error.message, "error");
            console.error("Error saving settings:", error.response?.data || error.message);
        }
    }

    return (
        <Layout>
            <h1>Your E-Commerce Settings</h1>
            {productsLoading ? (
                <Spinner />
            ) : (
                <>
                    <label>Featured Product 1</label>
                    <select
                        value={featuredProductId1}
                        onChange={(e) => setFeaturedProductId1(e.target.value)}
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
                    <label>Featured Product 2</label>
                    <select
                        value={featuredProductId2}
                        onChange={(e) => setFeaturedProductId2(e.target.value)}
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
                    <label>Featured Product 3</label>
                    <select
                        value={featuredProductId3}
                        onChange={(e) => setFeaturedProductId3(e.target.value)}
                    >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.title}
                            </option>
                        ))}
                    </select>
                    <div>
                        <button onClick={saveSettings} className="btn-primary">
                            Save Settings
                        </button>
                    </div>
                </>
            )}
        </Layout>
    );
}

export default withSwal(SettingsPage);
