"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface TokenResponse {
    isSuccess: boolean
    accessToken: string
    message: string
}

export default function LoginPage(){

    const router = useRouter()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')


    async function handleLogin(e: React.FormEvent) {

        e.preventDefault()

        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/User/Login?username=${username}&password=${password}`,{
            method: "GET",
        })

        if(!res.ok) {

            setError('Invalid Credentials')
            return

        }

        const data: TokenResponse = await res.json()
        if(!data.isSuccess){

            setError(data.message || "Login Failed")
            return

        }

        localStorage.setItem('token', data.accessToken) // store jwt
        router.push("/home")

    }

    return (

        <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20 p-4 border rounded space-y-4">

            <h1 className="text-2xl font-bold">Login</h1>

            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full border-3px py-2 rounded"/>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border-3px py-2 rounded"/>

            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Login</button>

        </form>

    )

}