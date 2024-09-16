"use client"

import { useState } from "react"
import {useRouter} from "next/navigation"
import { Button } from "@/components/ui/button_login"
import { Input } from "@/components/ui/input_login"
import { Label } from "@/components/ui/label_login"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card_login"
import { Alert, AlertDescription } from "@/components/ui/alert_login"

export function LoginScreen() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success,setSuccess] = useState("")

  const router = useRouter()
  // サインインボタンがクリックされたときの処理
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    //入力されていない時の処理
    if (!userId || !password) {
      setError("全て入力してください")
    } else {
      setError("")
      console.log("Login attempted with:", { userId, password })
      // You would typically make an API call here to authenticate the user
    }
    try{
      const response = await fetch('http://localhost:5000/login',{
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({user_id:userId,password}),
        credentials:'include'
      });

      const data = await response.json()
      // ログイン成功↓
      if(response.ok){
        setSuccess(data.message)
        setError("")
        router.push("/home")
      }else{
        // ログイン失敗↓
        setError(data.message)
        setSuccess("")
      }
    }catch(err){
      setError("Failed to connect to server")
    }
  }
  // パスワード忘れたとき！！
  const handleForgotPassword = () =>{
    router.push("/create_account")
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={handleForgotPassword}>Forgot password?</Button>
      </CardFooter>
    </Card>
  )
}