import React, { useState } from "react";
import { del } from "../api";

const DeletePackage = () => {
  const [packageId, setPackageId] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!packageId) {
      setMessage("⚠️ Please enter a package ID.");
      return;
    }

    try {
      const res = await del(`/packages/${packageId}`);
      if (res.error) {
        setMessage(`❌ Error: ${res.error}`);
      } else {
        setMessage("✅ Package deleted successfully!");
        setPackageId("");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error: Package may not exist or server issue.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">🗑️ Delete a Package</h2>
      <form onSubmit={handleDelete} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter Package ID to delete"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          type="submit"
          className="bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
        >
          Delete Package
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>
      )}
    </div>
  );
};

export default DeletePackage;
