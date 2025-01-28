import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { withSwal } from "react-sweetalert2";

function SettingsPage({ swal }) {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [featuredProductId, setFeaturedProductId] = useState("");
    const [featuredLoading, setFeaturedLoading] = useState(true);

    // Fetch products and saved settings when component mounts
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch available products
                const productResponse = await axios.get("/api/product");
                setProducts(productResponse.data);

                // Fetch saved setting
                const settingResponse = await axios.get("/api/settings?name=featuredProductId");
                if (settingResponse.data?.value) {
                    setFeaturedProductId(settingResponse.data.value);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setProductsLoading(false);
                setFeaturedLoading(false);
            }
        }
        fetchData();
    }, []);

    // Save settings to the backend
    async function saveSettings() {
        if (!featuredProductId) {
            await swal.fire("Error", "No featured product selected", "error");
            return;
        }
        try {
            const response = await axios.put("/api/settings", {
                name: "featuredProductId",
                value: featuredProductId,
            });

            await swal.fire("Success", "Settings saved successfully!", "success");
            console.log("Settings saved successfully:", response.data);
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
                    <label>Featured Product</label>
                    <select
                        value={featuredProductId}
                        onChange={(e) => setFeaturedProductId(e.target.value)}
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
