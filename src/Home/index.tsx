import React, { useEffect, useState } from 'react';
import Card from '../Card';
import { Item } from '../models/Item';
import './styles.css';
import { useAuth } from 'react-oidc-context';

interface CartItem extends Item {
  quantity: number;
}

const apiUrl = import.meta.env.VITE_API_URL;

const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const auth = useAuth();
  console.log("Auth: " + JSON.stringify(auth.user?.access_token)); 

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(apiUrl + '/dev/products');
        if (!response.ok)
          throw new Error('Failed to fetch items');
        const data: Item[] = await response.json();
        setItems(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== itemId));
  };

  const placeOrder = async () => {
    if (!auth.isAuthenticated) {
      auth.signinRedirect();
      return;
    }
    const total = cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
    try {
      const response = await fetch(apiUrl + '/dev/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer' + ' ' + auth.user?.access_token
        },
        body: JSON.stringify({
          "customerId": "cust-001",
          "items": cart,
          // "shippingAddress": ""
        }),
      });
      if (!response.ok)
        throw new Error('Order placement failed');
      setOrderSuccess(`Order placed successfully! Total amount: $${total}`);
      setCart([]);
      setTimeout(() => setOrderSuccess(null), 5000);
    } catch (error) {
      setOrderSuccess('Failed to place order. Please try again.');
      setTimeout(() => setOrderSuccess(null), 5000);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const login = () => {
    console.log("Login Auth: " + JSON.stringify(auth.user?.access_token));
    auth.signinRedirect();
  }

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_API_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_API_LOGOUT_URI;
    const cognitoDomain = import.meta.env.VITE_API_COGNITO_DOMAIN;
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <div className="app">
      <div className="main-content">
        {auth.isAuthenticated ? (
          <button onClick={signOutRedirect} className="logout-button">
            Logout
          </button>
        ) : (
           <button onClick={login}>Login</button>
        )}
        <h2>Product List</h2>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <input
            id="search-input"
            type="text"
            aria-label="Search products"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button">
            Search
          </button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {!loading && !error && (
          <div className="card-grid">
            {filteredItems.map((item, index) => (
              <Card
                key={item.name + index}
                item={item}
                className="card-item"
                onAddToCart={() => addToCart(item)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="cart-sidebar">
        <h3>Shopping Cart</h3>
        {orderSuccess && <div className="success-message">{orderSuccess}</div>}
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div className="cart-items">
            {cart.map((cartItem) => (
              <div key={cartItem.id} className="cart-item">
                <div>
                  <h4>{cartItem.name}</h4>
                  <p>Quantity: {cartItem.quantity}</p>
                  <p>price: ${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(cartItem.id)}
                  className="remove-button"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="cart-total">
              <h4>
                Total: $
                {cart
                  .reduce((total, item) => total + item.price * item.quantity, 0)
                  .toFixed(2)}
              </h4>
            </div>
            <button
              onClick={placeOrder}
              className="order-button"
              disabled={cart.length === 0}
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;