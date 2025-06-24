"use client"

import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

type Product = {
  id: number
  name: string
  imageUrl: string
  price: number
}

interface DecodedToken {
  UserId: number
}

export default function HomePage() {

  const router = useRouter()
  const token = localStorage.getItem('token')

  const [product, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Product`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })
    const data = await res.json()
    setProducts(data)
  }

  async function handleAdd(productId: number) {

    if(!token){

      alert("User not logged in")
      router.push("/login")
      return

    }
    const decoded = await jwtDecode<DecodedToken>(token);
    const userId = decoded.UserId


    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Cart/Add?userId=${userId}&productId=${productId}&quantity=${1}`, {

      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },

    })

    if(!res.ok){
      const errData = await res.json()
      setError(errData.message || "Failed to add to cart")
      alert("Failed to add to cart")
      return
    }
    const result = await res.json()
    alert(result.message)

  }

  const deleteProduct = async (id: number) => {
    console.log("Deleting product:", id) // ✅ test this first
    await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/Product?id=${id}`, { method: "DELETE"})
    fetchUsers()
  }
  
  function handleLogout() {
    localStorage.removeItem('token')
    router.push("/login")
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
    fetchUsers()
  }, [])

  return (

    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">

      <div className='flex justify-between'>

        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <div className='flex gap-4'>

          <Link href={"/orders"} className='bg-green-500 text-white p-2 rounded hover:bg-green-600'>View Orders</Link>
          <Link href={"/cart"} className='bg-green-500 text-white p-2 rounded hover:bg-green-600'>View Cart</Link>
          <button onClick={handleLogout} className='bg-red-500 text-white p-2 rounded hover:bg-red-600'>Logout</button>

        </div>


      </div>

      <div className='flex justify-between px-2 py-2 font-semibold border-b text-gray-500'>

        <div className='flex gap-7 items-center'>

          <span className='w-[80px]'>Image</span>
          <span>Name</span>
          <span>Price</span>

        </div>

      </div>

      <ul className="space-y-4">

        {product.map(products => (

          <li key={products.id} className="border-b pb-2 flex justify-between px-2">

            <div className="flex justify gap-7 items-center mb-2">
              <Image
                src={products.imageUrl}
                alt={products.name}
                width={80}
                height={80}
                className='rounded'></Image>
              <span className="font-medium text-gray-800">{products.name}</span>
              <span className="text-sm text-gray-500">{products.price}</span>
            </div>

            <div className='flex items-center justify-between gap-4'>
              <Link href={`/product/edit/${products.id}`} className="text-yellow-500 hover:underline">Edit</Link>
              <button onClick={() => handleAdd(products.id)} className="text-green-900 hover:underline">Add to Cart</button>
            </div>

          </li>

        ))}

      </ul>
    </div>

  )

}