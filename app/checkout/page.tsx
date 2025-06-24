"use client"

import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react"

interface DecodedToken {
  UserId: number
}

interface CartItem {
    id: number;
    quantity: number;
    product: {
        name: string;
        price: number;
        imageUrl?: string;
    };
}

export default function CheckoutPage(){

    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [form, setForm] = useState({
        name: '',
        email: '',
        address: '',
    })

    const [confirmation, setConfirmation] = useState<any>(null)

    const [error, setError] = useState('')

    useEffect(() => {

        const token = localStorage.getItem('token')

        if(!token){

            alert("User not logged in")
            router.push("/login")
            return

        }

        const decoded = jwtDecode<DecodedToken>(token)
        const userId = decoded.UserId

        fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Cart/GetByUserId?userId=${userId}`, {

            headers: {
                Authorization: `Bearer ${token}`
            }
            
        })
        .then(res => res.json())
        .then(data => setCartItems(data.cartItems || []))

    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e: React.FormEvent) {

        e.preventDefault()

        if(!form.name || !form.email || !form.address){
            setError('Please fill all fields')
            return;
        }

        const token = localStorage.getItem('token')
        if(!token){

            alert("User not logged in")
            router.push("/login")
            return

        }
        const decoded = jwtDecode<DecodedToken>(token)
        const userId = decoded.UserId

        // call checkout api
        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Checkout/Checkout`, {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({

                userId,
                ...form,

            }),

        })

        if(!res.ok){
            setError("Checkout Failed")
            return;
        }
        const result = await res.json()

        setConfirmation(result.entity)
        
    }

    if(confirmation) {

        return (

             <div className="max-w-xl mx-auto mt-10 p-4 text-center">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Order Confirmed</h2>
                <p>Thank you, <strong>{form.name}</strong>! We've received your order.</p>
                <p className="mt-2 mb-4">Confirmation ID: <code>{confirmation.id || 'N/A'}</code></p>
                <Link href={"/cart"} className="text-2xl font-bold mb-4 hover:underline bg-yellow-300 p-1 text-gray-500 rounded">Return</Link>
            </div>

        )

    }

    return (

        <div className="max-w-4xl mx-auto p-6">

            <div className="flex justify-between">
                <h1 className="text-2xl font-bold mb-4">Checkout</h1>
                <Link href={"/cart"} className="text-2xl font-bold mb-4 hover:underline bg-yellow-300 p-1 text-gray-500 rounded">Return</Link>
            </div>

            {/* Cart Table */}
            <table className="w-full border mb-6">
                <thead className="bg-gray-600 text-left">
                <tr>
                    <th className="p-2">Product</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Total</th>
                </tr>
                </thead>
                <tbody>
                {cartItems.map((item, idx) => (
                    <tr key={idx} className="border-t">
                    <td className="p-2">{item.product.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.product.price}</td>
                    <td className="p-2">${(item.quantity * (item.product.price || 0)).toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* <p className="text-right font-bold mb-6">Total: ${total.toFixed(2)}</p> */}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <input type="text" name="name" placeholder="Full Name" className="w-full border p-2 rounded"
                value={form.name} onChange={handleChange} />
                <input type="email" name="email" placeholder="Email Address" className="w-full border p-2 rounded"
                value={form.email} onChange={handleChange} />
                <input type="text" name="address" placeholder="Shipping Address" className="w-full border p-2 rounded"
                value={form.address} onChange={handleChange} />

                {error && <p className="text-red-500">{error}</p>}

                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Confirm Purchase
                </button>
            </form>

        </div>

    )

}