'use client'
import useSWRMutation from 'swr/mutation'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ValidationRule, useForm } from 'react-hook-form'
import { useEffect, useState,useRef } from 'react'
import { Product } from '@/lib/models/ProductModel'
import { formatId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Image from "next/image";
import axios from "axios";
export default function ProductEditForm({ productId }: { productId: string }) {
  const { data: product, error } = useSWR(`/api/admin/products/${productId}`)
  const router = useRouter()
  const [luuimg, setLuuimg] = useState<string>('')
  const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
    `/api/admin/products/${productId}`,
    async (url, { arg }: { arg: Partial<Product> & { image?: string } }) => {
      try {
        if (luuimg) {
          arg.image = luuimg; // Assign `luuimg` to `arg.image` if it’s available
        }
        const { data } = await axios.put(url, arg, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log(arg)
        toast.success('Product updated successfully');
        router.push('/admin/products');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        toast.error(errorMessage);
      }
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Product>()

  useEffect(() => {
    if (product) {
      setValue('name', product.name);
      setValue('slug', product.slug);
      setValue('price', product.price);
      setValue('image', product.image);
      setValue('category', product.category);
      setValue('brand', product.brand);
      setValue('countInStock', product.countInStock);
      setValue('description', product.description);
      
      // Initialize the image preview if product has an image
      if (product.image) {
        setImage2DPreview(product.image); // Show the image from the product data
      }
    }
  }, [product, setValue]);
  const fileInput2DRef = useRef<HTMLInputElement>(null);
  const [image2D, setImage2D] = useState<File | null>(null);

  const [image2DPreview, setImage2DPreview] = useState<string | null>(
    product?.image || null
  );
  console.log(product?.image)
  const handleImage2DChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage2D(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage2DPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const formSubmit = async (formData: any) => {
    if (image2D) {
      const imageUrl = await postImg(image2D);
      if (imageUrl) {
        formData.image = imageUrl; // Ensure the `image` field has a valid URL
      } else {
        toast.error("Image upload failed.");
        return;
      }
    }
  
    await updateProduct(formData);
  };

  if (error) return error.message
  if (!product) return 'Loading...'

  const FormInput = ({
    id,
    name,
    required,
    pattern,
  }: {
    id: keyof Product
    name: string
    required?: boolean
    pattern?: ValidationRule<RegExp>
  }) => (
    <div className="md:flex mb-6">
      <label className="label md:w-1/5" htmlFor={id}>
        {name}
      </label>
      <div className="md:w-4/5">
        <input
          type="text"
          id={id}
          {...register(id, {
            required: required && `${name} is required`,
            pattern,
          })}
          className="input input-bordered w-full max-w-md"
        />
        {errors[id]?.message && (
          <div className="text-error">{errors[id]?.message}</div>
        )}
      </div>
    </div>
  )
  const FormInputTextArea = ({
    id,
    name,
    required,
    pattern,
  }: {
    id: keyof Product
    name: string
    required?: boolean
    pattern?: ValidationRule<RegExp>
  }) => (
    <div className="md:flex mb-6">
      <label className="label md:w-1/5" htmlFor={id}>
        {name}
      </label>
      <div className="md:w-4/5">
        <textarea
          id={id}
          {...register(id, {
            required: required && `${name} is required`,
            pattern,
          })}
          className="input input-bordered w-full max-w-md h-48"
          style={{resize: 'none'}}
        />
        {errors[id]?.message && (
          <div className="text-error">{errors[id]?.message}</div>
        )}
      </div>
    </div>
  )
  
  async function postImg(image: File) {
    const toastId = toast.loading('Uploading image...');
    try {
      const reader = new FileReader();
      const base64Image = await new Promise<string | null>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(null);
        reader.readAsDataURL(image);
      });
      
      if (!base64Image) {
        throw new Error("Failed to encode image.");
      }

      const base64ImageData = base64Image.split(',')[1];
      const formData = new FormData();
      formData.append("image", base64ImageData);
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMAGE_URL}`,
        formData
      );

      toast.success('Image uploaded successfully', { id: toastId });
      return res.data.data.url; // Return the direct URL of the uploaded image
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
      return null;
    }
  }
  const uploadHandler = async (e: any) => {
    const toastId = toast.loading('Uploading image...')
    try {
      const resSign = await fetch('/api/cloudinary-sign', {
        method: 'POST',
      })
      const { signature, timestamp } = await resSign.json()
      const file = e.target.files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp)
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
      const data = await res.json()
      setValue('image', data.secure_url)
      toast.success('File uploaded successfully', {
        id: toastId,
      })
    } catch (err: any) {
      toast.error(err.message, {
        id: toastId,
      })
    }
  }
  return (
    <div className='mb-4'>
      <h1 className="text-2xl py-4">Edit Product {formatId(productId)}</h1>
      <div>
        <form onSubmit={handleSubmit(formSubmit)}>
          <FormInput name="Name" id="name" required />
          <FormInput name="Slug" id="slug" required />
          {/* <FormInput name="Image" id="image" required /> */}
          <div className="md:flex mb-6">
            <label className="label md:w-1/5" htmlFor="imageFile">
              Image
            </label>
            <div className="md:w-4/5 space-y-4">
          <div className="flex items-center space-x-4">
          <button
              type="button"
              onClick={() => fileInput2DRef.current?.click()}
              className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
          {image2DPreview ? "Change Image" : "Upload Image"}
          </button>
          <input
              type="file"
              className="hidden"
              id="imageFile"
              onChange={handleImage2DChange}
              ref={fileInput2DRef}
              accept="image/*"
          />
          {image2DPreview && (
  <div className="relative h-32 w-32">
    <img
      src={image2DPreview}
      alt="Product preview"
      className="h-full w-full rounded-lg object-cover"
    />
    <button
      type="button"
      className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none transition duration-200 ease-in-out"
      onClick={() => {
        setImage2D(null);
        setImage2DPreview(null);
        if (fileInput2DRef.current) {
          fileInput2DRef.current.value = ""; // Clear the file input
        }
      }}
    >
      <span className="block h-4 w-4 text-center">×</span>
    </button>
  </div>
)}
  
  </div>

</div>

          </div>
          <FormInput name="Price" id="price" required />
          <FormInput name="Category" id="category" required />
          <FormInput name="Brand" id="brand" required />
          <FormInputTextArea name="Description" id="description" required />
          <FormInput name="Count In Stock" id="countInStock" required />

          <button
            type="submit"
            disabled={isUpdating}
            className="btn btn-primary"
          >
            {isUpdating && <span className="loading loading-spinner"></span>}
            Update
          </button>
          <Link className="btn ml-4 " href="/admin/products">
            Cancel
          </Link>
        </form>
      </div>
    </div>
  )
}

