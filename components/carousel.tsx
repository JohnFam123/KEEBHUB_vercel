'use client'
import { useState } from 'react';
import Link from 'next/link';
import ProductModel, { Product } from '@/lib/models/ProductModel';

interface CarouselComponentProps {
  products: Product[];
}

const CarouselComponent: React.FC<CarouselComponentProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full rounded-box mt-4 overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {products.map((product) => (
          <div key={product._id} className="w-full flex-shrink-0">
            <Link href={`/product/${product.slug}`}>
              <img src={product.banner} className="w-full" alt={product.name} />
            </Link>
          </div>
        ))}
      </div>
      <div className="absolute flex justify-between items-center left-5 right-5 top-1/2 -translate-y-1/2">
        <button onClick={handlePrev} className="btn btn-circle">
          ❮
        </button>
        <button onClick={handleNext} className="btn btn-circle">
          ❯
        </button>
      </div>
    </div>
  );
};

export default CarouselComponent;
