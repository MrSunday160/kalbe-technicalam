"use client"

import { jwtDecode } from "jwt-decode";
import router from "next/router";
import { useEffect, useState } from "react";
import Image from 'next/image'
import Link from "next/link";

interface DecodedToken {
    UserId: number
}

interface CartItem {
    id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl: string;
    };
}

interface Cart {
    id: number;
    userId: number;
    cartItems: CartItem[];
}

export default function CartPage(){

    const [cart, setCart] = useState<Cart | null>(null);
    const [error, setError] = useState('')

    async function updateQuantity(cartItemId: number, quantity: number){

        if(quantity < 1){
            // remove product from cart
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Cart/UpdateQuantity?cartItemId=${cartItemId}&quantity=${quantity}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

        if(res.ok) location.reload();
        else alert("Failed updating cart")

    }

    async function removeItem(cartItemId: number){

        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Cart/RemoveProduct?cartItemId=${cartItemId}`, {
            method: "DELET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })

        if(res.ok) location.reload();
        else alert("Failed removing product")

    }

    useEffect(() => {

        const token = localStorage.getItem('token')
        if(!token){
            if(!token){

                alert("User not logged in")
                router.push("/login")
                return

            }
        }
        const decoded = jwtDecode<DecodedToken>(token)
        console.log(decoded)
        const userId = decoded.UserId

        async function fetchCart() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Cart/GetByUserId?userId=${userId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })

            if(!res.ok){
                const errData = await res.json();
                setError(errData.message || 'Failed to fetch cart');
                return;
            }

            const data: Cart = await res.json()
            console.log(data)
            setCart(data)
        }

        fetchCart()

    }, [])

    if (error) return <p className="text-red-500">{error}</p>;
    if (!cart) return <p>Loading...</p>;
    if (!cart.cartItems || cart.cartItems.length === 0) return <p>Your cart is empty.</p>;


    return (

        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
            <Link href={"/home"} className="text-2xl font-bold mb-4">Return</Link>
        <ul className="space-y-4">
            {cart.cartItems.map(item => (
            <li key={item.id} className="flex justify-between border-b pb-2">
                <div className="flex gap-4 items-center">
                <Image 
                    src={item.product.imageUrl ?? 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTybmeW3TQwj8bUFcRTJ2Sdd_8BIy2ACIBtx24JeW94-WMuz33tDOVo9LzJDGDw0rWHIx4&usqp=CAU'} 
                    alt={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTybmeW3TQwj8bUFcRTJ2Sdd_8BIy2ACIBtx24JeW94-WMuz33tDOVo9LzJDGDw0rWHIx4&usqp=CAU"} 
                    width={80} 
                    height={80} 
                    className="rounded" />
                <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="text-sm text-yellow-600 hover:underline"
                    >−</button>
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-sm text-green-600 hover:underline"
                    >+</button>
                <button
                    onClick={() => removeItem(item.id)}                        className="text-sm text-red-500 hover:underline"
                    >Remove</button>
                <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-700">${item.product.price}</p>
                </div>
                </div>
                <p className="text-sm font-semibold">
                ${item.quantity * (item.product.price ?? 0)}
                </p>
            </li>
            ))}
        </ul>
        
    </div>

    )

}