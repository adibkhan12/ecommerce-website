import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { withSwal } from "react-sweetalert2";

// For image preview and upload
import Image from "next/image";

function SettingsPage({ swal }) {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [featuredProductId1, setFeaturedProductId1] = useState("");
    const [featuredProductId2, setFeaturedProductId2] = useState("");
    const [featuredProductId3, setFeaturedProductId3] = useState("");
    const [featuredLoading, setFeaturedLoading] = useState(true);

    // AdBanners state (array of slides)
    const [adBanners, setAdBanners] = useState([]);
    const [adBannerUploadingIndex, setAdBannerUploadingIndex] = useState(null);
    const [adBannersLoading, setAdBannersLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    
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
    const [val1, val2, val3, categoriesRes, adBannerRes] = await Promise.all([
    fetchSetting("featuredProductId1"),
    fetchSetting("featuredProductId2"),
    fetchSetting("featuredProductId3"),
    axios.get("/api/categories"),
    axios.get("/api/adbanner"),
    ]);
    setFeaturedProductId1(val1);
    setFeaturedProductId2(val2);
    setFeaturedProductId3(val3);
    setCategories(categoriesRes.data);
    setAdBanners(adBannerRes.data);
    // Extract all unique brand values from all categories
    const brands = new Set();
    categoriesRes.data.forEach(cat => {
    (cat.properties || []).forEach(prop => {
    if ((prop.name === "brand" || prop.name === "Brand") && Array.isArray(prop.values)) {
    prop.values.forEach(v => brands.add(v));
    }
    });
    });
    setBrandOptions(Array.from(brands));
    } catch (error) {
    console.error("Error fetching data:", error);
    } finally {
    setProductsLoading(false);
    setFeaturedLoading(false);
    setAdBannersLoading(false);
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
    
    // AdBanner CRUD
    async function uploadAdBannerImage(ev, idx) {
    const files = ev.target?.files;
    if (files?.length > 0) {
    setAdBannerUploadingIndex(idx);
    const data = new FormData();
    for (const file of files) {
    data.append('file', file);
    }
    const res = await axios.post('/api/upload', data);
    // Update local state only
    setAdBanners(banners => banners.map((b, i) => i === idx ? { ...b, image: res.data.links[0] } : b));
    setAdBannerUploadingIndex(null);
    }
    }
    
    async function saveAdBanner(banner, idx) {
    // If banner has _id, update; else, create
    if (banner._id) {
    const res = await axios.put('/api/adbanner', banner);
    setAdBanners(banners => banners.map((b, i) => i === idx ? res.data : b));
    } else {
    const res = await axios.post('/api/adbanner', banner);
    setAdBanners(banners => banners.map((b, i) => i === idx ? res.data : b));
    }
    await swal.fire("Success", "Banner saved!", "success");
    }
    async function deleteAdBanner(banner, idx) {
    if (banner._id) {
    await axios.delete('/api/adbanner', { data: { _id: banner._id } });
    }
    setAdBanners(banners => banners.filter((_, i) => i !== idx));
    await swal.fire("Deleted", "Banner deleted!", "success");
    }
    function handleBannerChange(idx, field, value) {
    setAdBanners(banners => banners.map((b, i) => i === idx ? { ...b, [field]: value } : b));
    }
    function addBanner() {
    setAdBanners(banners => [...banners, { title: '', desc: '', image: '', button: '', link: '' }]);
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
                    <div className="mt-8 border-t pt-6">
                    <h2 className="text-lg font-semibold mb-2">Ad Banners (Slides)</h2>
                    {adBannersLoading ? <Spinner /> : (
                    <>
                    {adBanners.map((banner, idx) => (
                    <div key={banner._id || idx} className="mb-8 p-4 border rounded-lg bg-gray-50 relative">
                    <button
                    type="button"
                    onClick={() => deleteAdBanner(banner, idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 cursor-pointer hover:bg-red-700"
                    >
                    X
                    </button>
                    <label className="block font-semibold mb-1">Banner Heading</label>
                    <input
                        type="text"
                        value={banner.title || ''}
                        onChange={e => handleBannerChange(idx, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        placeholder="Banner heading"
                    />
                    <label className="block font-semibold mb-1">Banner Offer</label>
                    <input
                        type="text"
                        value={banner.desc || ''}
                        onChange={e => handleBannerChange(idx, 'desc', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        placeholder="Banner offer/description"
                    />
                    <label className="block font-semibold mb-1">Button Label Type</label>
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                name={`buttonType-${idx}`}
                                value="category"
                                checked={banner.buttonType === 'category' || !banner.buttonType}
                                onChange={() => {
                                    handleBannerChange(idx, 'buttonType', 'category');
                                    handleBannerChange(idx, 'buttonLinkType', 'category');
                                }}
                            />
                            Category
                        </label>
                        <label className="flex items-center gap-1">
                            <input
                                type="radio"
                                name={`buttonType-${idx}`}
                                value="brand"
                                checked={banner.buttonType === 'brand'}
                                onChange={() => {
                                    handleBannerChange(idx, 'buttonType', 'brand');
                                    handleBannerChange(idx, 'buttonLinkType', 'brand');
                                }}
                            />
                            Brand
                        </label>
                    </div>
                    {(!banner.buttonType || banner.buttonType === 'category') && (
                        <select
                            value={banner.button || ''}
                            onChange={e => {
                                handleBannerChange(idx, 'button', e.target.value);
                                // Set link for category
                                const cat = categories.find(cat => cat.name === e.target.value);
                                if (cat) {
                                    handleBannerChange(idx, 'link', `/category/${cat._id}`);
                                }
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    )}
                    {banner.buttonType === 'brand' && (
                        <select
                            value={banner.button || ''}
                            onChange={e => {
                                handleBannerChange(idx, 'button', e.target.value);
                                // Set link for brand
                                handleBannerChange(idx, 'link', `/Brand/${e.target.value}`);
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                        >
                            <option value="">Select brand</option>
                            {brandOptions.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    )}
                    <label className="block font-semibold mb-1">Text</label>
                    <input
                    type="text"
                    value={banner.desc}
                    onChange={e => handleBannerChange(idx, 'desc', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                    placeholder="Banner description/text"
                    />
                    <label className="block font-semibold mb-1">Button Label</label>
                    <input
                    type="text"
                    value={banner.button}
                    onChange={e => handleBannerChange(idx, 'button', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                    placeholder="Button label (optional)"
                    />
                    <label className="block font-semibold mb-1">Banner Image</label>
                    <div className="mb-2 flex flex-wrap gap-2 items-center">
                    {banner.image && (
                    <div className="relative h-24 w-24 bg-white p-2 shadow-sm rounded border border-gray-200 flex items-center justify-center">
                    <img
                    src={banner.image}
                    alt="Ad Banner"
                    width={90}
                    height={90}
                    className="rounded object-cover h-full w-full"
                    style={{ display: 'block' }}
                    />
                    <button
                    type="button"
                    onClick={() => handleBannerChange(idx, 'image', '')}
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 cursor-pointer hover:bg-red-700"
                    >
                    X
                    </button>
                    </div>
                    )}
                    {adBannerUploadingIndex === idx && (
                    <div className="h-24 w-24 bg-gray-200 flex items-center justify-center rounded-lg">
                    <Spinner />
                    </div>
                    )}
                    <label
                    className="w-24 h-24 text-center flex flex-col items-center justify-center text-primary rounded bg-white shadow-sm cursor-pointer border border-primary"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>Upload</div>
                    <input type="file" onChange={e => uploadAdBannerImage(e, idx)} className="hidden" />
                    </label>
                    </div>
                    <button
                    type="button"
                    onClick={() => saveAdBanner(banner, idx)}
                    className="btn-primary mt-2"
                    >
                    Save Banner
                    </button>
                    </div>
                    ))}
                    <button
                    type="button"
                    onClick={addBanner}
                    className="btn-primary mb-4"
                    >
                    + Add Banner Slide
                    </button>
                    </>
                    )}
                    </div>
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
