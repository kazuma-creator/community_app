'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button_modal"
import { InputModal } from "@/components/ui/input_modal"
import { Label } from "@/components/ui/label_modal"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle } from 'lucide-react'

function getCookie(name: string):string | null {
  const value = `; ${document.cookie}`; // document.cookieからすべてのクッキーを取得
  const parts = value.split(`; ${name}=`);// 指定したクッキー名でクッキーを分割
  if (parts.length === 2){
    return parts.pop()?.split(';').shift() || null;// クッキー名に対応する値を返す
  } 
  return null;
}


export function CommunitySetupModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<File | null>(null)
  const [rules, setRules] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [userId,setUserId] = useState<string | null>(null)
  const [csrfToken,setCsrfToken] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null) 

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  // コンポーネントが開いたときの処理
  useEffect(()=>{
    const fetchUserId = async()=>{
      try{
        const response = await fetch(`${API_URL}/check_login`,{
          method:'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if(data.user){
          setUserId(data.user);
        }
      }catch(error){
        console.error('ユーザーIDの取得に失敗しました',error);
      }
    };

    const fetchCsrfToken = async () => {
      try{
        const response = await fetch(`${API_URL}/get_csrf_token`,{
          method:'GET',
          credentials:'include',
        });
        const data = await response.json();
        if(data.csrf_token){
          setCsrfToken(data.csrf_token);// CSRFトークンを保存
          console.log("CSRFトークンを保存しました")
        }
      }catch(error){
        console.error('CSRFトークンの取得に失敗しました',error);
      }
    };
      fetchCsrfToken();
      fetchUserId(); // モーダルが開いたときにユーザーIDを取得

  },[]);


  

  // create communityをクリックした際の処理
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null);
    const newErrors: { [key: string]: string } = {}
    // 入力されていない際に表示する警告文
    if (!name.trim()) newErrors.name = 'Community name is required'
    if (!description.trim()) newErrors.description = 'Community description is required'
    if (!icon) newErrors.icon = 'Community icon is required'
    if (!rules.trim()) newErrors.rules = 'Community rules are required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // フォームデータを作成
    const formData = new FormData();
    formData.append('name',name);
    formData.append('description',description);
    formData.append('rules',rules);
    if (icon){
      formData.append('icon',icon);
    }

    if (!csrfToken) {
      console.error('CSRFトークンが存在しません');
      return;
    }

    const headers: HeadersInit = {
      'X-CSRFToken': csrfToken || '', // useState から取得した CSRF トークンを使用
    };

    // デバッグ用に FormData の内容を確認
    for (let [key,value] of formData.entries()){
      console.log(`${key}:${value}`)
    }

    // バックエンドにデータを送信
    try{
      const response = await fetch(`${API_URL}/api/create_communities`,{
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
      });
      console.log('responseの内容:',response);
      // エラー処理
      if(!response.ok){
        throw new Error('コミュニティ作成中にエラーが発生しました');
      }
      //モーダルを閉じる
      setOpen(false);

      // データをリフレッシュしてホーム画面に表示
      window.location.reload();

    }catch(error){
      console.error('コミュニティの作成に失敗しました',error);
      if(error instanceof Error){
        setGeneralError(error.message);
      }else{
        setGeneralError('予期せぬエラー');
      }
    }

    // Here you would typically send the data to your backend
    console.log({ name, description, icon, rules })
    setOpen(false)
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => console.log("button clicked")}>Create New Community</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいコミュニティを作成</DialogTitle>
          <DialogDescription>
            新しいコミュニティを作成します。必要な情報を設定してください
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                タイトル
              </Label>
              <InputModal
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
              {errors.name && (
                <p className="col-span-3 col-start-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                説明
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
              {errors.description && (
                <p className="col-span-3 col-start-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                アイコン
              </Label>
              <InputModal
                id="icon"
                type="file"
                onChange={(e) => setIcon(e.target.files?.[0] || null)}
                className="col-span-3"
              />
              {errors.icon && (
                <p className="col-span-3 col-start-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.icon}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rules" className="text-right">
                ルール
              </Label>
              <Textarea
                id="rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="col-span-3"
                placeholder="守ってほしいルールを入力してね"
              />
              {errors.rules && (
                <p className="col-span-3 col-start-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.rules}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button  onClick={()=>{console.log("createボタンがクリックされました")}} type="submit">Create Community</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}