import React from 'react';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';

function App() {
  return (
    <div className="App">
      <h1>Shopify Product Manager</h1>
      <AddProduct />
      <ProductList />
    </div>
  );
}

export default App;