import React, { useEffect, useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";

const Home= () => {
  const [allProducts, setAllProducts] = useState([]);
  // const [loading, setLoading] = useState(false);
 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sugarLimit, setSugarLimit] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);
  useEffect(() => {
    
    const fetchAllProducts = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        let allFetchedProducts = [];
        let page = 1;
        while (allFetchedProducts.length < 200) {
          const response = await fetch(
            `https://world.openfoodfacts.org/api/v2/search?page=${page}&page_size=50&fields=product_name,brands,image_url,categories,ingredients_text,nutrition_grades,nutriments,code`
          );
          const data = await response.json();
          if (!data.products || data.products.length === 0) break;
          allFetchedProducts = [...allFetchedProducts, ...data.products];
          page++;
        }
        setAllProducts(allFetchedProducts);
        setFilteredProducts(allFetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to fetch products. Please try again.");
      }
      setLoading(false);
    };
    fetchAllProducts();
  }, []);

  // category selection 
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  //  sorting
  const handleSorting = (products, option) => {
    let sortedProducts = [...products];

    switch (option) {
      case "name_asc":
        sortedProducts.sort((a, b) =>
          (a.product_name || "").localeCompare(b.product_name || "")
        );
        break;

      case "name_desc":
        sortedProducts.sort((a, b) =>
          (b.product_name || "").localeCompare(a.product_name || "")
        );
        break;

      case "nutrition_asc":
        sortedProducts.sort((a, b) =>
          (a.nutrition_grades || "E").localeCompare(b.nutrition_grades || "E")
        );
        break;

      case "nutrition_desc":
        sortedProducts.sort((a, b) =>
          (b.nutrition_grades || "E").localeCompare(a.nutrition_grades || "E")
        );
        break;

      case "calories_low_high":
        sortedProducts.sort(
          (a, b) =>
            (a.nutriments?.energy_kcal || 0) - (b.nutriments?.energy_kcal || 0)
        );
        break;

      case "calories_high_low":
        sortedProducts.sort(
          (a, b) =>
            (b.nutriments?.energy_kcal || 0) - (a.nutriments?.energy_kcal || 0)
        );
        break;

      default:
        break;
    }

    return sortedProducts;
  };

  // Filter and sort 
  useEffect(() => {
    let filtered = allProducts;

    if (searchTerm.trim()) {
      filtered = filtered.filter((product) =>
        product.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.some((category) =>
          product.categories?.toLowerCase().includes(category.toLowerCase())
        )
      );
    }

    if (sugarLimit) {
      filtered = filtered.filter(
        (product) => product.nutriments?.sugars_100g < parseFloat(sugarLimit)
      );
    }

    // sorting
    filtered = handleSorting(filtered, sortOption);

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategories, sugarLimit, sortOption, allProducts]);

  return (
    <div className="container">
      <h1>OpenFood Products</h1>

 <button className="toggle-theme" onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
      </button>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by product name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Filters  */}
      <div className="category-filter ">
        {["Beverages", "Dairy", "Snacks", "Bakery", "Frozen"].map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggleCategory(category)}
            />
            {category}
          </label>
        ))}
      </div>

      {/* Sugar Filter */}
      <div className="filter-section pt-2">
        <label>
          Sugar (g per 100g):
          <input
            type="number"
            value={sugarLimit}
            onChange={(e) => setSugarLimit(e.target.value)}
            placeholder="Max Sugar (g)"
          />
        </label>
      </div>

      {/* Sorting  */}
      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
        <option value="">Sort By</option>
        <option value="name_asc">Product Name (A-Z)</option>
        <option value="name_desc">Product Name (Z-A)</option>
        <option value="nutrition_asc">Nutrition Grade (A-E)</option>
        <option value="nutrition_desc">Nutrition Grade (E-A)</option>
        <option value="calories_low_high">Calories (Lowest to Highest)</option>
        <option value="calories_high_low">Calories (Highest to Lowest)</option>
      </select>

      {/* Error  */}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <div key={index} className="card">
                  <Link to={`/product/${product.code}`}>
                  <img
                  src={product.image_url || "https://via.placeholder.com/150"}
                  alt={product.product_name || "No Image"}
                  className="product-image"
                />
                <h3>{product.product_name || "Unknown Product"}</h3>
                  </Link>
               
                <p><strong>Brand:</strong> {product.brands || "Unknown"}</p>
                <p><strong>Category:</strong> {product.categories || "Not Available"}</p>
                <p><strong>Ingredients:</strong> {product.ingredients_text || "Not Available"}</p>
                <p>
                  <strong>Nutrition Grade:</strong>{" "}
                  {product.nutrition_grades ? (
                    <span className={`nutrition ${product.nutrition_grades.toLowerCase()}`}>
                      {product.nutrition_grades.toUpperCase()}
                    </span>
                  ) : (
                    "Not Available"
                  )}
                </p>
                <p><strong>Calories:</strong> {product.nutriments?.energy_kcal || "N/A"} kcal</p>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
