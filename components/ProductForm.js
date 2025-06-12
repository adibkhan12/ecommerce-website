import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  stock: existingStock,
  images: existingImages,
  colorVariants: existingColorVariants,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || "");
  const [stock, setStock] = useState(existingStock || 0);
  const [images, setImages] = useState([]); // All images, regardless of color
  const [colorVariants, setColorVariants] = useState([]); // [{ color, images: [] }]
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedColorId, setSelectedColorId] = useState(null); // For UI: which color is open
  const [openColorId, setOpenColorId] = useState(null); // For collapsible color image section
  const [newColor, setNewColor] = useState("");
  const [colorError, setColorError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // Load categories and colors
  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
    axios.get("/api/colors").then((result) => {
      setColors(result.data);
    });
  }, []);

  // Populate images and colorVariants from existing data on mount
  useEffect(() => {
    if (existingColorVariants && existingColorVariants.length > 0) {
      setColorVariants(existingColorVariants);
      // Flatten all images for the main pool
      setImages(existingColorVariants.map((cv) => cv.images).flat());
      setSelectedColorId(existingColorVariants[0]?.color || null);
    } else if (Array.isArray(existingImages)) {
      setImages(existingImages);
      setColorVariants([]);
      setSelectedColorId(null);
    }
  }, [existingImages, existingColorVariants]);

  // Add a new color
  function handleAddColor() {
    if (!newColor.trim()) {
      setColorError("Color name cannot be empty");
      return;
    }
    setColorError("");
    // Check if color already exists in colors list
    const existing = colors.find(c => c.name.toLowerCase() === newColor.trim().toLowerCase());
    if (existing) {
      // If already in colorVariants, don't add again
      if (colorVariants.some(cv => cv.color === existing._id)) {
        setColorError("Color already added to this product.");
        return;
      }
      setColorVariants([...colorVariants, { color: existing._id, images: [] }]);
      setSelectedColorId(existing._id);
      setNewColor("");
      return;
    }
    // Otherwise, create new color in DB
    axios
      .post("/api/colors", { name: newColor.trim() })
      .then((res) => {
        setColors([...colors, res.data]);
        setColorVariants([...colorVariants, { color: res.data._id, images: [] }]);
        setSelectedColorId(res.data._id);
        setNewColor("");
      })
      .catch(() => {
        setColorError("Failed to add color. It may already exist.");
      });
  }

  // Delete a color and its images from colorVariants
  function handleDeleteColor(colorId) {
    setColorVariants((prev) => prev.filter((cv) => cv.color !== colorId));
    if (selectedColorId === colorId) {
      setSelectedColorId(null);
    }
  }

  // Add image to color variant
  function addImageToColor(colorId, url) {
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.color === colorId ? { ...cv, images: [...cv.images, url] } : cv
      )
    );
    if (!images.includes(url)) setImages((prev) => [...prev, url]);
  }

  // Remove image from color variant
  function removeImageFromColor(colorId, url) {
    setColorVariants((prev) =>
      prev.map((cv) =>
        cv.color === colorId
          ? { ...cv, images: cv.images.filter((img) => img !== url) }
          : cv
      )
    );
  }

  // Upload image for color or main
  async function uploadImage(ev, colorId = null) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      const res = await axios.post("/api/upload", data);
      if (colorId) {
        for (const url of res.data.links) {
          addImageToColor(colorId, url);
        }
      } else {
        setImages((oldImages) => [...oldImages, ...res.data.links]);
      }
      setIsUploading(false);
    }
  }

  // Assign existing image to color
  function assignExistingImageToColor(colorId, url) {
    addImageToColor(colorId, url);
  }

  // Remove image from main images
  function deleteImage(link) {
    setImages((oldImages) => oldImages.filter((image) => image !== link));
    axios
      .delete("/api/delete-image", { data: { link } })
      .then(() => {})
      .catch(() => {});
  }

  // Save product
  async function saveProduct(ev) {
    ev.preventDefault();
    let data;
    if (colorVariants.length > 0) {
      data = {
        title,
        description,
        price,
        stock,
        category,
        properties: productProperties,
        colorVariants,
        images: [],
      };
    } else {
      data = {
        title,
        description,
        price,
        stock,
        category,
        properties: productProperties,
        images,
        colorVariants: [],
      };
    }
    if (_id) {
      await axios.put("/api/product", { ...data, _id });
    } else {
      await axios.post("/api/product", data);
    }
    return router.push("/products");
  }

  // UI rendering
  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...(catInfo?.properties || []));
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id);
      propertiesToFill.push(...(parentCat?.properties || []));
      catInfo = parentCat;
    }
  }

  return (
    <form onSubmit={saveProduct} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
      <div>
        <label className="block font-semibold mb-1">Product Name</label>
        <input
          type="text"
          placeholder="Product Name"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Category</label>
        <select
          value={category}
          onChange={(ev) => setCategory(ev.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Uncategorized</option>
          {categories.length > 0 &&
            categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      {propertiesToFill.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertiesToFill.map((p) => (
            <div key={p.name}>
              <label className="block font-semibold mb-1">
                {p.name ? p.name[0].toUpperCase() + p.name.substring(1) : "Unnamed Property"}
              </label>
              <select
                value={productProperties[p.name] || ""}
                onChange={(ev) => setProductProp(p.name, ev.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select {p.name}</option>
                {p.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
      {/* Images Section (if no color variants) */}
      {colorVariants.length === 0 && (
        <div>
          <label className="block font-semibold mb-1">Images</label>
          <div className="mb-2 flex flex-wrap gap-2">
            <ReactSortable list={images} className="flex flex-wrap gap-2" setList={setImages}>
              {!!images?.length &&
                images.map((link) => (
                  <div
                    key={link}
                    className="relative h-24 w-24 bg-white p-2 shadow-sm rounded border border-gray-200 flex items-center justify-center"
                  >
                    <img
                      src={link}
                      alt="Product"
                      width={90}
                      height={90}
                      className="rounded object-cover h-full w-full"
                      style={{ display: "block" }}
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
            <label className="w-24 h-24 text-center flex flex-col items-center justify-center text-primary rounded bg-white shadow-sm cursor-pointer border border-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <div>Upload</div>
              <input type="file" onChange={(e) => uploadImage(e)} className="hidden" />
            </label>
          </div>
        </div>
      )}
      {/* Color Variants Section */}
      <div>
        <label className="block font-semibold mb-1">Colors</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {colorVariants.map((cv) => {
            const colorObj = colors.find((c) => c._id === cv.color);
            return (
              <div key={cv.color} className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setOpenColorId(openColorId === cv.color ? null : cv.color)}
                  className={`px-3 py-1 rounded border ${openColorId === cv.color ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                >
                  {colorObj ? colorObj.name : cv.color}
                </button>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteColor(cv.color);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 py-0.5 text-xs cursor-pointer"
                  title="Delete color"
                  style={{zIndex: 10}}
                >
                  ×
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 items-center mb-2">
          <input
            type="text"
            placeholder="Add new color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button type="button" onClick={handleAddColor} className="btn-primary px-3 py-1">
            Add
          </button>
        </div>
        {colorError && <div className="text-red-500 text-sm">{colorError}</div>}
      </div>
      {/* Images for Selected Color */}
      {colorVariants.length > 0 && openColorId && (
        <div className="mb-6">
          <label className="block font-semibold mb-2">Images for {(() => {
            const colorObj = colors.find((c) => c._id === openColorId);
            return colorObj ? colorObj.name : openColorId;
          })()}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {colorVariants.find((cv) => cv.color === openColorId)?.images.map((link) => (
              <div key={link} className="relative h-20 w-20 bg-white p-1 shadow-sm rounded border flex items-center justify-center">
                <img src={link} alt="Color Variant" className="rounded object-cover h-full w-full" />
                <button type="button" onClick={() => removeImageFromColor(openColorId, link)} className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1 py-0.5">X</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center mb-2">
            <label className="w-20 h-20 flex flex-col items-center justify-center text-primary rounded bg-white shadow-sm cursor-pointer border border-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <div>Upload</div>
              <input type="file" onChange={(e) => uploadImage(e, openColorId)} className="hidden" />
            </label>
            {/* Assign already uploaded images */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-xs text-gray-500">Assign existing:</span>
                {images.map((link) => (
                  <button
                    type="button"
                    key={link}
                    onClick={() => assignExistingImageToColor(openColorId, link)}
                    className="border px-1 py-0.5 rounded text-xs bg-gray-100 hover:bg-blue-100"
                  >
                    <img src={link} alt="" className="inline h-5 w-5 object-cover mr-1" />
                    Add
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
        ></textarea>
      </div>
      <div>
        <label className="block font-semibold mb-1">Price (in AED)</label>
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Stock</label>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setStock(Math.max(0, stock - 1))} className="px-3 py-1 bg-gray-200 rounded text-lg">
            -
          </button>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(ev) => setStock(Number(ev.target.value))}
            className="w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
          />
          <button type="button" onClick={() => setStock(stock + 1)} className="px-3 py-1 bg-gray-200 rounded text-lg">
            +
          </button>
        </div>
      </div>
      <div className="pt-4">
        <button className="btn-primary w-full py-2 text-lg" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}
