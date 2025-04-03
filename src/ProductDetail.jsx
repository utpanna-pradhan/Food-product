import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./App.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${id}.json`);
        const data = await response.json();
        if (!data.product) {
          setErrorMessage("Product not found.");
          setLoading(false);
          return;
        }
        setProduct(data.product);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setErrorMessage("Failed to load product details.");
      }
      setLoading(false);
    };
    fetchProductDetails();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (errorMessage) return <p className="error">{errorMessage}</p>;

  return (
    <div className="product-detail-container">
      <Link to="/">← Back to Products</Link>
      <h1>{product.product_name || "Unknown Product"}</h1>
      <img
        src={product.image_url || "https://via.placeholder.com/300"}
        alt={product.product_name || "No Image"}
        className="product-detail-image"
      />
      
      {/* Ingredients */}
      <h2>Ingredients</h2>
      <p>{product.ingredients_text || "No ingredients available."}</p>

      {/* Nutritional Values */}
      <h2>Nutritional Values</h2>
      <ul>
        <li><strong>Energy:</strong> {product.nutriments?.energy_kcal || "N/A"} kcal</li>
        <li><strong>Fat:</strong> {product.nutriments?.fat_100g || "N/A"} g</li>
        <li><strong>Carbohydrates:</strong> {product.nutriments?.carbohydrates_100g || "N/A"} g</li>
        <li><strong>Proteins:</strong> {product.nutriments?.proteins_100g || "N/A"} g</li>
      </ul>

      {/* Labels & Tags */}
      <h2>Labels & Tags</h2>
      <p>
        {product.labels || product.labels_tags?.join(", ") || "No labels available."}
      </p>
    </div>
  );
};

export default ProductDetail;
