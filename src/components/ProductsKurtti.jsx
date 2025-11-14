import React from 'react'
// import KurtiCard from './KurtiCard'
import Card from '../pages/Card'
export default function ProductsKurtti() {
    let products = [
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        {
            image: 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301030220YELLOW_1_800x.jpg?v=1755594198',
            name: 'Kurti 1',
            price: 100
        },
        
        
        
    ]
  return (
    <div>
<h2>Featured Products</h2>
        <div className="product-grid">
            {products.map((product, index) => (
                <Card key={index} image={product.image} name={product.name} price={product.price} />
            ))}
        
      </div>
    </div>
  )
}
