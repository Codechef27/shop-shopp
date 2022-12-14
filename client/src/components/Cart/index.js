import React, { useEffect }from 'react';
import CartItem from '../CartItem';
import Auth from '../../utils/auth';
import './style.css';

import { indexedDb } from '../../utils/helpers';
import { useLazyQuery } from '@apollo/client';
import { QUERY_CHECKOUT } from '../../utils/queries';
import { loadStripe } from '@stripe/stripe-js';

import { TOGGLE_CART, ADD_MULTIPLE_TO_CART } from '../../utils/actions';
import { useSelector, useDispatch } from 'react-redux';


const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Cart = () => {
  const state = useSelector(state => state);
  const dispatch = useDispatch();
  const { cart }  = state;

  const [getCheckout, { data }] = useLazyQuery(QUERY_CHECKOUT); // Hook is not called on render, but on user action.

  useEffect(() => {
    async function getCart() {
      const cart = await indexedDb('cart', 'get');
      dispatch({ type: ADD_MULTIPLE_TO_CART, products: [...cart] });
    };
  
    if (!cart.length) {
      getCart();
    }
  }, [cart.length, dispatch]);

  const toggleCart = () => {
    dispatch({ type: TOGGLE_CART });
  }

  const calculateTotal = () => {
    let sum = 0;
    cart.forEach(item => {
      sum += item.price * item.purchaseQuantity;
    });
    return sum.toFixed(2);
  }

  function submitCheckout() {
    const productIds = [];
  
    cart.forEach((item) => {
      for (let i = 0; i < item.purchaseQuantity; i++) {
        productIds.push(item._id);
      }
    });

    getCheckout({
      variables: { products: productIds }
    });
  }
  
  useEffect(() => {
    if (data) {
      stripePromise.then((res) => {
        res.redirectToCheckout({ sessionId: data.checkout.session });
      });
    }
  }, [data]);


  if (!state.cartOpen) {
    return (
      <div className="cart-closed" onClick={toggleCart}>
        <span
          role="img"
          aria-label="trash">🛒</span>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="close" onClick={toggleCart}>[close]</div>
      <h2>Shopping Cart</h2>
      {cart.length ? (
        <div>
            {cart.map((item) => (
              <CartItem key={item._id} item={item} />
          ))}

          <div className="flex-row space-between">
            <strong>Total: ${calculateTotal()}</strong>
            {
              Auth.loggedIn() ?
                <button onClick={submitCheckout}>
                  Checkout
                </button>
                :
                <span>(log in to check out)</span>
            }
          </div>
        </div>
      ) : (
        <h3>
          <span role="img" aria-label="shocked">
            😱
          </span>
          You haven't added anything to your cart yet!
        </h3>
      )}
    </div>
  );
};

export default Cart;