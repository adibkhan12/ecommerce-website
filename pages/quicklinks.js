import { useState } from "react";
import axios from "axios";
import swal from "sweetalert";
import Layout from "@/components/Layout";
import { QuickLinks } from "@/models/QuickLinks";
import {mongooseConnect} from "@/lib/mongoose";

export default function QuickLinksEditPage({ initialLinks }) {
  const [aboutDescription, setAboutDescription] = useState(initialLinks.about?.description || "");
  const [termsDescription, setTermsDescription] = useState(initialLinks.terms?.description || "");
  const [shopDescription, setShopDescription] = useState(initialLinks.shop?.description || "");
  const [supportDescription, setSupportDescription] = useState(initialLinks.support?.description || "");

  async function saveQuickLinks(ev) {
    ev.preventDefault();
    const updatedData = {
      about: { ...initialLinks.about, description: aboutDescription },
      terms: { ...initialLinks.terms, description: termsDescription },
      shop: { ...initialLinks.shop, description: shopDescription },
      support: { ...initialLinks.support, description: supportDescription },
    };
    try {
      await axios.put("/api/quicklinks", updatedData);
      await swal("Success", "Quick Links updated successfully.", "success");
    } catch (error) {
      await swal("Error", "Failed to update quick links.", "error");
    }
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Quick Links</h1>
        <form onSubmit={saveQuickLinks} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{initialLinks.about.title || "About Us"}</h2>
            <textarea 
              value={aboutDescription}
              onChange={ev => setAboutDescription(ev.target.value)}
              className="w-full mt-2 border border-gray-300 p-2 rounded"
              placeholder="Enter description for About" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{initialLinks.terms.title || "Terms & Conditions"}</h2>
            <textarea 
              value={termsDescription}
              onChange={ev => setTermsDescription(ev.target.value)}
              className="w-full mt-2 border border-gray-300 p-2 rounded"
              placeholder="Enter description for Terms & Conditions" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{initialLinks.shop.title || "Shop"}</h2>
            <textarea 
              value={shopDescription}
              onChange={ev => setShopDescription(ev.target.value)}
              className="w-full mt-2 border border-gray-300 p-2 rounded"
              placeholder="Enter description for Shop" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{initialLinks.support.title || "Support"}</h2>
            <textarea 
              value={supportDescription}
              onChange={ev => setSupportDescription(ev.target.value)}
              className="w-full mt-2 border border-gray-300 p-2 rounded"
              placeholder="Enter description for Support" />
          </div>
          <button className="btn-primary" type="submit">Save Quick Links</button>
        </form>
      </div>
    </Layout>
  );
}


export async function getServerSideProps() {
  await mongooseConnect(); // Ensure DB connection before queries

  let links = await QuickLinks.findOne().lean();
  if (!links) {
    links = await QuickLinks.create({});
  }
  const initialLinks = JSON.parse(JSON.stringify(links));

  return { props: { initialLinks } };
}