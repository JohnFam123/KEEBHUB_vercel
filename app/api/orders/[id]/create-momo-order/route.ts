import crypto from 'crypto'
import axios from 'axios'
import dbConnect from '@/lib/dbConnect'
import OrderModel from '@/lib/models/OrderModel'
const accessKey = 'F8BBA842ECF85'
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'
const partnerCode = 'MOMO'
//const redirectUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'
const ipnUrl = 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b'
const requestType = 'payWithMethod'
//const amount = '1000'
const orderInfo = 'pay with MoMo'
const extraData = ''
const autoCapture = true
const lang = 'vi'

// Named export for POST method
export async function POST(request: any) {
  const orderId = partnerCode + new Date().getTime()
  const requestId = orderId
  const { totalPrice, redirectUrl, id } = await request.json()
  const amount = String(totalPrice)
  // Construct the raw signature string
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`
  // Create the signature using HMAC SHA256
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex')

  // Prepare the JSON body for the request
  const requestBody = {
    partnerCode,
    partnerName: 'Test',
    storeId: 'MomoTestStore',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData,
    orderGroupId: '',
    signature
  }

  try {
    // Use axios to send the POST request
    const momoResponse = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    // Send Momo's response back to the client
    await dbConnect()
  const order = await OrderModel.findById(id)
  if (order) {
    try {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
      }
      const updatedOrder = await order.save()
      return new Response(JSON.stringify(momoResponse.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err: any) {
      return Response.json(
        { message: err.message },
        {
          status: 500,
        }
      )
    }
  } else {
    return Response.json(
      { message: 'Order not found' },
      {
        status: 404,
      }
    )
  }
    
  } catch (error) {
    console.error('Error processing Momo payment:', error)
    return new Response(JSON.stringify({ error: 'Payment processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}