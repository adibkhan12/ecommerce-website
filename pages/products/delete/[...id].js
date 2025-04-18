import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";

export default function DeleteProductPage(){
    const router = useRouter();
    const [productInfo, setProductInfo] = useState({});
    const {id} = router.query;
    useEffect(()=>{
        if(!id) {
            return;
        }
        axios.get(`/api/product?id=`+id).then(response => {
            setProductInfo(response.data);
        })
    },[id]);
    function goBack(){
        router.push("/products");
    }
    async function deleteProduct(){
        await axios.delete(`/api/product?id=`+id).then(response => {})
        goBack();
    }
    return(
        <Layout>
            <h1 className="text-center">
                Do you really want to delete&nbsp;
                &quot;{productInfo?.title || "this product"}&quot;?
            </h1>
            <div className="flex gap-2 justify-center">
                <button className="btn-red"
                        onClick={deleteProduct}>
                    Yes
                </button>
                <button
                    className="btn-default"
                    onClick={goBack}>
                    No
                </button>
            </div>

        </Layout>
    )
}