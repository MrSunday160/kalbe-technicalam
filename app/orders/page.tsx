"use client"

import { jwtDecode } from "jwt-decode"
import Link from "next/link"
import router from "next/router"
import { useEffect, useState } from "react"

interface DecodedToken {
    UserId: number
}

interface Product {
    name: string
    imageUrl: string
    price: number
}

interface CartItem {
    quantity: number
    product: Product
}

interface Checkout {
    id: number
    name: string
    email: string
    address: string
    cart: {
        cartItems: CartItem[]
    }
}

export default function OrdersPage(){

    const [orders, setOrders] = useState<Checkout[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if(!token){

            alert("User not logged in")
            router.push("/login")
            return

        }

        const decoded = jwtDecode<DecodedToken>(token)
        console.log(decoded)
        const userId = decoded.UserId

        fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Checkout/GetCheckoutsByUserId?userId=${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(res => res.json())
        .then(data => { setOrders(data) })
    }, [])

    if(orders.length === 0){

        return (
            <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <p className="text-center mt-10">You havent placed any orders</p>
            <Link href={"/home"} className="text-2xl font-bold mb-4 hover:underline bg-yellow-300 p-1 text-gray-500 rounded">Return</Link>

        </div> 
        )
    
    }

    return (

            <div className="max-w-4xl mx-auto p-6">

                <div className="flex justify-between">

                    <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
                    <Link href={"/home"} className="text-2xl font-bold mb-4 hover:underline bg-yellow-300 p-1 text-gray-500 rounded">Return</Link> 

                </div>

                
                {orders.map((order) => (
                    <div key={order.id} className="mb-8 border rounded p-4 shadow bg-white">
                    <div className="mb-3">
                        <p className="font-semibold text-black">Order ID: {order.id}</p>
                        <p className="text-sm text-black">Ship to: {order.name}, {order.address}</p>
                    </div>
                        <ul className="divide-y">
                            
                            {order.cart.cartItems.map((item, idx) => (
                            <li key={idx} className="py-2 flex items-center gap-4">
                                <img 
                                src={item.product?.imageUrl || '/placeholder.png'} alt={item.product?.name} className="w-16 h-16 object-cover rounded" />
                                
                                <div className="flex-1">
                                    <p className="font-medium text-black">{item.product?.name}</p>
                                    <p className="text-sm text-black">Qty: {item.quantity}</p>
                                </div>

                                <p>${(item.product?.price * item.quantity).toFixed(2)}</p>
                            </li>
                            ))}

                        </ul>
                    </div>
                ))}

            </div>

        )

}