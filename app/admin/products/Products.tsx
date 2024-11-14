'use client'
import { Product } from '@/lib/models/ProductModel'
import { formatId } from '@/lib/utils'
import UtilityServices from '@/lib/services/UtilityServices'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import axios from 'axios'
export default function Products() {
  const { data: products, error } = useSWR(`/api/admin/products`)

  const router = useRouter()

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: string } }) => {
      const toastId = toast.loading('Deleting product...')
      try {
        const { data } = await axios.delete(`${url}/${arg.productId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        toast.success('Product deleted successfully', {
          id: toastId,
        })
      } catch (error:any) {
        const errorMessage = error.response?.data?.message || 'Error deleting product'
        toast.error(errorMessage, {
          id: toastId,
        })
      }
    }
  )
  
  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url) => {
      try {
        const { data } = await axios.post(url, {}, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        toast.success('Product created successfully')
        router.push(`/admin/products/${data.product._id}`)
      } catch (error:any) {
        const errorMessage = error.response?.data?.message || 'Error creating product'
        toast.error(errorMessage)
      }
    }
  )

  if (error) return 'An error has occurred.'
  if (!products) return 'Loading...'

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Products</h1>
        <button
          disabled={isCreating}
          onClick={() => createProduct()}
          className="btn btn-primary btn-sm"
        >
          {isCreating && <span className="loading loading-spinner"></span>}
          Create
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>price</th>
              <th>category</th>
              <th>count in stock</th>
              <th>rating</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product._id}>
                <td>{formatId(product._id!)}</td>
                <td>{product.name}</td>
                <td>{UtilityServices.getPriceCurrency(product.price)}</td>
                <td>{product.category}</td>
                <td>{product.countInStock}</td>
                <td>{product.rating}</td>
                <td>
                  <Link
                    href={`/admin/products/${product._id}`}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={() => deleteProduct({ productId: product._id! })}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
