"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar" // Radix UI の Avatarコンポーネントをインポート

import { cn } from "@/lib/utils"// クラス名を結合するためのユーティリティ関数をインポート

// Avatar コンポーネントの定義
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,// ref の型を定義
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>// プロパティの型を定義
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref} // ref を渡す
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",// デフォルトのクラスを設定
      className // 追加のクラスがあれば結合
    )}
    {...props} //　他のプロパティをすべて渡す
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName // コンポーネントの表示名を設定

// AvatarImage コンポーネントの定義
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,// ref の型を定義
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>// プロパティの型を定義
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref} // ref を渡す
    className={cn("aspect-square h-full w-full", className)}// アスペクト比を維持して全体を覆う
    {...props}// 他のプロパティをすべて渡す
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName // コンポーネントの表示名を設定

// AvatarFallback コンポーネントの定義(画像がない場合に表示されるコンテンツ)
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName // コンポーネントの表示名を設定

export { Avatar, AvatarImage, AvatarFallback }
