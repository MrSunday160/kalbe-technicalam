"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage(){

    const router = useRouter()
    const [userInput, setUserInput] = useState({
        username: '',
        password: '',
        email: '',
    })

    const [error, setError] = useState('')

    async function handleRegister(e: React.FormEvent){

        e.preventDefault()

        const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/api/User/Register`, {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userInput)

        })

        if(!res.ok){
            setError("Registration Failed")
            return
        }

        router.push("/home")

    }

    return (

        <form onSubmit={handleRegister} className="max-w-md mx-auto mt-20 p-4 border rounded space-y-4">

            <h1 className="text-2xl font-bold">Register</h1>

            <input type="text" placeholder="Username" value={userInput.username} onChange={e => setUserInput({...userInput, username: e.target.value})} className="w-full border-3px py-2 rounded"/>

            <input type="text" placeholder="Email" value={userInput.email} onChange={e => setUserInput({...userInput, email: e.target.value})} className="w-full border-3px py-2 rounded"/>

            <input type="password" placeholder="Password" value={userInput.password} onChange={e => setUserInput({...userInput, password: e.target.value})} className="w-full border-3px py-2 rounded"/>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Register</button>

        </form>

    )

}