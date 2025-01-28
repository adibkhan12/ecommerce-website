import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {ReactSortable} from "react-sortablejs";
import Image from "next/image";


export default function ProductForm ({
     _id,
     title:existingTitle,
     description:existingDescription,
     price:existingPrice,
     images:existingImages,
     category:assignedCategory,
    properties:assignedProperties,
 }) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState
    (existingDescription || '');
    const [category, setCategory] = useState(assignedCategory ||'');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const[isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories').then((result) => {
            setCategories(result.data);
        })
    },[])

    async function saveProduct(ev) {
        ev.preventDefault();
        const data = {
            title, description, price, images, category,
            properties:productProperties
        };
        console.log('Saving product:', data); // Debug log
        if(_id){
            // update
            await axios.put('/api/product', {...data,_id});
        }else{
            //create
            await axios.post('/api/product', data);
        }
        return router.push('/products');

    }
    async function uploadImages(ev) {
        const files = ev.target?.files;
        if(files?.length > 0){
            setIsUploading(true);
            const data = new FormData();
            for (const file of files ){
                data.append('file', file);
            }
            const res = await axios.post('/api/upload',data);
            console.log('Uploaded links:', res.data.links);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function updateImagesOrder(images){
        setImages(images);
    }
    function setProductProp(propName, value){
        setProductProperties(prev =>{
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        })
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category){
        let catInfo = categories.find(({_id}) =>
            _id === category);
        propertiesToFill.push(...(catInfo?.properties || []));
        while(catInfo?.parent?._id){
            const parentCat = categories.find(({_id}) =>
                _id === catInfo?.parent?._id);
            propertiesToFill.push(...(parentCat?.properties || []));
            catInfo = parentCat;
        }
    }
    function deleteImage(link) {
        // Remove the image from the list
        setImages((oldImages) => oldImages.filter((image) => image !== link));

        // Optionally, send a request to delete the image from S3 and database
        axios
            .delete('/api/delete-image', { data: { link } })
            .then((response) => {
                console.log('Image deleted:', response.data);
            })
            .catch((error) => {
                console.error('Failed to delete image:', error);
            });
    }

    return(
            <form onSubmit={saveProduct}>
                <label>Product Name</label>
                <input
                       type="text"
                       placeholder='Product Name'
                       value={title}
                       onChange={ev => setTitle(ev.target.value)}/>
                <label>Category</label>
                <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}>
                    <option value= "" >Uncategorized</option>
                    {categories.length > 0 && categories.map(c=> (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                {propertiesToFill.length > 0 && propertiesToFill.map(p =>(
                    <div key={p.name}>
                        <label>
                            {p.name ? p.name[0].toUpperCase() + p.name.substring(1) : "Unnamed Property"}
                        </label>
                        <div key={p.name}>
                            <select
                                value={productProperties[p.name]}
                                onChange={ev =>
                                    setProductProp(p.name, ev.target.value)
                                }>
                                {p.values.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
                <label>
                    Photos
                </label>
                <div className="mb-2 flex flex-wrap gap-1">
                    <ReactSortable
                        list={images}
                        className="flex flex-wrap gap-1"
                        setList={updateImagesOrder}>
                    {!!images?.length &&
                        images.map(link =>(
                            <div
                                key={link}
                                className="relative h-24 bg-white p-3 shadow-sm rounded-sm border border-gray-200">
                                <Image
                                    src={link}
                                    alt=""
                                    className="rounded-sm"/>
                                <button
                                    onClick={() => deleteImage(link)}
                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 cursor-pointer transition ease-in duration-200 hover:bg-red-700"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </ReactSortable>
                    {isUploading && (
                        <div className="h-24 bg-gray-200 flex items-center rounded-lg">
                            <Spinner />
                        </div>
                    )}
                    <label
                        className="w-24 h-24 text-center flex flex-col
                        items-center justify-center text-primary
                        rounded-sm bg-white shadow-sm cursor-pointer border border-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
                        </svg>
                        <div>Upload</div>
                        <input type="file" onChange={uploadImages} className="hidden"/>
                    </label>
                </div>
                <label>Description</label>
                <textarea placeholder="description"
                          value={description}
                          onChange={ev => setDescription(ev.target.value)}></textarea>
                <label>Price (in AED)</label>
                <input type="number"
                       placeholder='price'
                       value={price}
                       onChange={ev => setPrice(ev.target.value)}/>
                <button
                    className="btn-primary"
                    type="submit">
                    Save
                </button>
            </form>
    )
}