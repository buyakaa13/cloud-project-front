import React from 'react';
import { Item } from '../models/Item';
import './styles.css';

interface CardProps {
  item: Item;
  className?: string;
  onAddToCart: () => void;
}

const Card: React.FC<CardProps> = ({ item, className, onAddToCart }) => {
  return (
    <div className={`card ${className || ''}`}>
      <img src={item.imageUrl} alt={item.name} className="card-image" />
      <div className="card-content">
        <h3 style={{color: "#000000", textAlign: "center"}}>{item.name}</h3>
        <p>{item.description}</p>
        <p className='price'>Price:</p>
        <p className="price">${item.price.toFixed(2)}</p>
        <button onClick={onAddToCart} className="add-to-cart-button">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Card;