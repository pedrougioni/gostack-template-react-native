import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storageString = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (storageString) {
        const storageProducts = JSON.parse(storageString) as Product[];
        setProducts(storageProducts);
      }
    }

    loadProducts();
  }, []);

  const updateProducts = useCallback(
    newArray => {
      setProducts(newArray);
      AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newArray));
    },
    [setProducts],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const index = products.findIndex(
        arrayProd => arrayProd.id === product.id,
      );
      if (index < 0) {
        const newProduct = { ...product };
        newProduct.quantity = 1;
        updateProducts([...products, newProduct]);
      } else {
        const newArray = [...products];
        const cartProduct = newArray[index];
        cartProduct.quantity += 1;
        newArray[index] = cartProduct;
        updateProducts(newArray);
      }
    },
    [products, updateProducts],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(arrayProd => arrayProd.id === id);
      if (index > -1) {
        const newArray = [...products];
        const cartProduct = newArray[index];
        cartProduct.quantity += 1;
        newArray[index] = cartProduct;
        updateProducts(newArray);
      }
    },
    [products, updateProducts],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(arrayProd => arrayProd.id === id);
      if (index > -1) {
        const cartProduct = products[index];
        cartProduct.quantity -= 1;
        let newArray;
        if (cartProduct.quantity < 1) {
          newArray = products.filter(
            arrayProd => arrayProd.id !== cartProduct.id,
          );
        } else {
          newArray = [...products];
          newArray[index] = cartProduct;
        }
        updateProducts(newArray);
      }
    },
    [updateProducts, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
