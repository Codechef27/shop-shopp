import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import ProductItem from '../ProductItem';
import { QUERY_PRODUCTS } from '../../utils/queries';
import spinner from '../../assets/spinner.gif';
// import { useStoreContext } from '../../utils/GlobalState';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import { indexedDb } from "../../utils/helpers";

import { useSelector, useDispatch } from "react-redux";

function ProductList() {
  const state = useSelector(state => state)
  const dispatch = useDispatch();
  const { currentCategory, products } = state;
  const { loading, data } = useQuery(QUERY_PRODUCTS);
  
  useEffect(() => {
    // if there's data to be stored
    if (data) {
      // let's store it in the global state object
      dispatch({
       type: UPDATE_PRODUCTS,
       products: data.products

      })
  
      // but let's also take each product and save it to IndexedDB using the helper function 
      data.products.forEach((product) => {
        indexedDb('products', 'put', product);
      });
    }  else if (!loading) {
      // since we're offline, get all of the data from the `products` store
      indexedDb('products', 'get').then((products) => {
        // use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);
  
  function filterProducts() {
    if (!currentCategory) {
      return products;
    }
  
    return products.filter(product => product.category._id === currentCategory);
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {products.length ? (
        <div className="flex-row">
          {filterProducts().map((product) => (
            <ProductItem
              key={product._id}
              _id={product._id}
              image={product.image}
              name={product.name}
              price={product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      {loading ? <img src={spinner} alt="loading" /> : null}
    </div>
  );
}

export default ProductList;
