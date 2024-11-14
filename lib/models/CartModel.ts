import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
        items: [
            {
              product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
              },
              name: { type: String, required: true },
              slug: { type: String, required: true },
              qty: { type: Number, required: true },
              image: { type: String, required: true },
              price: { type: Number, required: true },
            },
          ],
    }
)
const CartModel = mongoose.models.Cart || mongoose.model('Cart', cartSchema)

export default CartModel

export type Cart = {
    _id: string
    user?: { name: string }
    items: [CartItem]
}

export type CartItem = {
    name: string
    slug: string
    qty: number
    image: string
    price: number
    color: string
    size: string
  }


