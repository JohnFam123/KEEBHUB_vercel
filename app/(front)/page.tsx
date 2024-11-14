// Example of your Home component with unique keys
import ProductItem from '@/components/products/ProductItem'
import productService from '@/lib/services/productService'
import { convertDocToObj } from '@/lib/utils'
import { Metadata } from 'next'
import CarouselComponent from '@/components/carousel'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Next Amazona V2',
  description:
    process.env.NEXT_PUBLIC_APP_DESC ||
    'Nextjs, Server components, Next auth, daisyui, zustand',
}

export default async function Home() {
  const featuredProducts = await productService.getFeatured()
  const latestProducts = await productService.getLatest()

  const plainFeaturedProducts = featuredProducts.map(convertDocToObj);
  const plainLatestProducts = latestProducts.map(convertDocToObj);

  return (
    <>
      <CarouselComponent products={plainFeaturedProducts} />
      <h2 className="text-2xl py-2">Latest Products</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {plainLatestProducts.map((product) => (
          <ProductItem key={product._id} product={product} />  
        ))}
      </div>
    </>
  )
}
