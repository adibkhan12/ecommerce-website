import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage()   {
    const [productInfo, setProductInfo] = useState(null);
    const router = useRouter();
    const { id } = router.query;
    useEffect(() => {
        if(!id){
            return;
        }
        axios.get('/api/product?id='+id).then(response => {
            setProductInfo(response.data);
        })
    }, [id]);
    console.log({router});
    return (
        <Layout>
            <b><h1>Edit Product</h1></b>
            {productInfo && (
                <ProductForm {...productInfo} />
            )}
        </Layout>
    )
}