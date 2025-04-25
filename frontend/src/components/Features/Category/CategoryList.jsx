import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryList.css';

const CategoryList = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return null;
  }
  
  return (
    <div className="categories-list">
      {categories.map(category => (
        <Link 
          key={category.id} 
          to={`/category/${category.id}`}
          className="category-item"
        >
          <div className="category-icon">{category.icon}</div>
          <div className="category-name">{category.name}</div>
        </Link>
      ))}
    </div>
  );
};

export default CategoryList;