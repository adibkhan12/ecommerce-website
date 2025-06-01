import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {ReactSortable} from "react-sortablejs";
import Image from "next/image";

export default function ProductForm({
    _id,
    title: existingTitle,
    description: existingDescription,
    price: existingPrice,
    stock: existingStock,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties,
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [category, setCategory] = useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const [price, setPrice] = useState(existingPrice || '');
    const [stock, setStock] = useState(existingStock || 0);
    const [images, setImages] = useState(existingImages || []);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories').then((result) => {
            setCategories(result.data);
        })
    }, [])

    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {
            title, description, price, stock, images, category,
            properties: productProperties
        };
        if (_id) {
            await axios.put('/api/product', { ...data, _id });
        } else {
            await axios.post('/api/product', data);
        }
        return router.push('/products');
    }
    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images) {
        setImages(images);
    }
    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = { ...prev };
            newProductProps[propName] = value;
            return newProductProps;
        })
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({ _id }) =>
            _id === category);
        propertiesToFill.push(...(catInfo?.properties || []));
        while (catInfo?.parent?._id) {
            const parentCat = categories.find(({ _id }) =>
                _id === catInfo?.parent?._id);
            propertiesToFill.push(...(parentCat?.properties || []));
            catInfo = parentCat;
        }
    }
    function deleteImage(link) {
        setImages((oldImages) => oldImages.filter((image) => image !== link));
        axios
            .delete('/api/delete-image', { data: { link } })
            .then((response) => {
                // Image deleted
            })
            .catch((error) => {
                // Failed to delete image
            });
    }

    return (
        <form onSubmit={saveProduct} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
            <div>
                <label className="block font-semibold mb-1">Product Name</label>
                <input
                    type="text"
                    placeholder='Product Name'
                    value={title}
                    onChange={ev => setTitle(ev.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">Uncategorized</option>
                    {categories.length > 0 && categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
            </div>
            {propertiesToFill.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {propertiesToFill.map(p => (
                        <div key={p.name}>
                            <label className="block font-semibold mb-1">
                                {p.name ? p.name[0].toUpperCase() + p.name.substring(1) : "Unnamed Property"}
                            </label>
                            <select
                                value={productProperties[p.name] || ""}
                                onChange={ev => setProductProp(p.name, ev.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Select {p.name}</option>
                                {p.values.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
            <div>
                <label className="block font-semibold mb-1">Photos</label>
                <div className="mb-2 flex flex-wrap gap-2">
                    <ReactSortable
                        list={images}
                        className="flex flex-wrap gap-2"
                        setList={updateImagesOrder}
                    >
                        {!!images?.length &&
                            images.map(link => (
                                <div
                                    key={link}
                                    className="relative h-24 w-24 bg-white p-2 shadow-sm rounded border border-gray-200 flex items-center justify-center"
                                >
                                    <Image
                                        src={link}
                                        alt=""
                                        width={90}
                                        height={90}
                                        className="rounded object-cover h-full w-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => deleteImage(link)}
                                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 cursor-pointer transition ease-in duration-200 hover:bg-red-700"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                    </ReactSortable>
                    {isUploading && (
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
                        <input type="file" onChange={uploadImages} className="hidden" />
                    </label>
                </div>
            </div>
            <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={ev => setDescription(ev.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                ></textarea>
            </div>
            <div>
                <label className="block font-semibold mb-1">Price (in AED)</label>
                <input
                    type="number"
                    placeholder='Price'
                    value={price}
                    onChange={ev => setPrice(ev.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
            <div>
                <label className="block font-semibold mb-1">Stock</label>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setStock(Math.max(0, stock - 1))} className="px-3 py-1 bg-gray-200 rounded text-lg">-</button>
                    <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={ev => setStock(Number(ev.target.value))}
                        className="w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                    />
                    <button type="button" onClick={() => setStock(stock + 1)} className="px-3 py-1 bg-gray-200 rounded text-lg">+</button>
                </div>
            </div>
            <div className="pt-4">
                <button
                    className="btn-primary w-full py-2 text-lg"
                    type="submit"
                >
                    Save
                </button>
            </div>
        </form>
    );
}
