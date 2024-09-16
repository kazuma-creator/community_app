"use client"

import { useState } from "react"
import {useRouter} from "next/navigation"
import { Button } from "@/components/ui/button_create_account"
import { Input } from "@/components/ui/input_create_account"
import { Label } from "@/components/ui/label_create_account"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card_create_account"
import { Alert, AlertDescription } from "@/components/ui/alert_create_account"

//a
export function CreateAccount() {
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
// サインインボタンをクリックしたときの処理
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    // 基本的なバリデーション
    if (!userName || !userId || !password || !confirmPassword) {
      setError("Please fill in all fields")
    } else if (password !== confirmPassword) {
      setError("Passwords do not match")
    } else {
      setError("")
      console.log("Account creation attempted with:", { userName, userId, password })
    }
    // アカウント作成API呼び出し
    try{
      const response = await fetch('http://localhost:5000/register',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({username: userName,user_id:userId,password}),
      })

      const data = await response.json()

      if (response.ok){
        setError("")
        console.log("Account created:",data.message)

        // アカウント作成後、自動ログイン処理
        const loginResponse = await fetch('http://localhost:5000/login',{
          method: 'POST',
          headers:{
            'Content-Type':'applocation/json',
          },
          body: JSON.stringify({user_id: userId,password})
        })
        if(loginResponse.ok){
          // HomePageに遷移
          router.push("/home")
        }else{
          setError("Failed to log in after account creation")
        }
      }else{
        setError(data.message)
      }
    }catch (err){
      setError("An error occurred while creating the account")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Enter your details to create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">User Name</Label>
            <Input
              id="userName"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="Choose a user ID"
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
              placeholder="Choose a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}