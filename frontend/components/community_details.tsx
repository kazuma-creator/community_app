'use client'
import { useEffect,useState } from "react"
import {useParams} from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal } from "lucide-react"

// コミュニティ詳細のインターフェース
interface CommunityDetail{
  id:number;
  name:string;
  description:string;
  members: { id: number; username: string; joined_at: string }[]; 
  posts:{id:number,content:string,author:string,timestamp:string}[];
}

export function CommunityApp() {
  const [community,setCommunity] = useState<CommunityDetail | null>(null);
  const [postContent,setPostContet] = useState('');
  const [isMember,setIsMember] = useState<boolean>(false);
  const params = useParams();  // クエリパラメーターを取得するフック

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const id = params?.id;  // クエリパラメーターから id を取得
  
    // CSRFトークンをクッキーから取得するヘルパー関数
  function getCsrfToken() {
    const matches = document.cookie.match(new RegExp('(^| )csrf_token=([^;]+)'));
    return matches ? decodeURIComponent(matches[2]) : null;
  }

  // CSRFトークンを取得するAPIを呼び出す処理
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch(`${API_URL}/get_csrf_token`, {
        method: 'GET',
        credentials: 'include', // クッキーを含める
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('CSRFトークンを取得:', data.csrf_token);
      } else {
        console.error('CSRFトークンの取得に失敗しました');
      }
    } catch (error) {
      console.error('エラーが発生しました:', error);
    }
  };

  // ページがロードされた際にCSRFトークンを取得
  useEffect(() => {
    fetchCsrfToken();
  }, []);


  useEffect(()=>{
    console.log('id',id);
  },[id]);

  useEffect(() =>{
    // コミュニティの詳細データを取得
    const fetchCommunityDetail = async () =>{
      try{
        const response = await fetch(`${API_URL}/api/community/${id}`);
        const data = await response.json();
        setCommunity(data);
      }catch(error){
        console.error('コミュニティの詳細データの取得に失敗しました:',error);
      }
    };
    // ユーザーがコミュニティに参加しているか確認
    const checkMembership = async ()=>{
      const response = await fetch(`${API_URL}/api/community/${id}/membership`,{
        method:'GET',
        credentials:'include',
      });
      const result = await response.json();
      setIsMember(result.is_member); // 参加状況を更新
    }

    fetchCommunityDetail();
    checkMembership();
  },[id]);

    // コミュニティに参加する
    const handleJoinCommunity = async () => {
      const csrfToken = getCsrfToken();
      const headers:HeadersInit ={
        'Content-Type': 'application/json',
      };

      if(csrfToken){
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await fetch(`${API_URL}/api/community/${id}/join`, {
        method: 'POST',
        headers:headers,
        credentials: 'include',
      });
      if (response.ok) {
        setIsMember(true); // 参加後に参加フラグを更新
      } else {
        console.error('参加に失敗しました');
      }
    };

  if(!community){
    return <div>Loading...</div>; // データがロードされるまでのローディング表示
  }
  // 投稿内容の送信処理
  const handlePostSubmit = async () =>{
    if(postContent.trim() === ''){
      return; // 空の投稿は無視
    }
    const csrfToken = getCsrfToken();

    const headers: HeadersInit = {
      'Content-Type':'application/json',
    };
      // CSRFトークンが存在する場合のみヘッダーに追加
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }

    console.log('送信された内容:',postContent);

    // 投稿データを送信
    try{
      const response = await fetch(`${API_URL}/api/community/${id}/posts`,{
        method:'POST',
        headers:headers,
        body:JSON.stringify({
          content:postContent, // 投稿内容を送信
        }),
        credentials:'include',
      });
      // レスポンスが成功かを確認
      if(!response.ok){
        console.error('エラー:',await response.text());
      }

      if(response.ok){
        const newPost = await response.json(); // 追加された投稿データを取得

        // 投稿が追加された後、投稿一覧を更新
        setCommunity((prevCommunity)=>{
          if(!prevCommunity) return null;
          return{
            ...prevCommunity,
            posts:[newPost,...prevCommunity.posts], 
          };
        });
        // 送信後、テキストフィールドをクリア
        setPostContet('');
      }else{
        console.log('投稿の送信に失敗しました');
      }
    }catch(error){
      console.error('エラーが発生しました:',error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white">
      <header className="bg-blue-600 p-4 flex justify-between items-center">
        <div className="text-white text-2xl font-bold">{community.name}</div>
        <div className="flex space-x-2">
          <Button size="icon" variant="ghost" className="text-white">
            <Search className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-white">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-2">{community.name}</h1>
        <p className="text-sm text-gray-600 mb-4">{community.members.length} メンバー</p>
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="posts">投稿</TabsTrigger>
            <TabsTrigger value="threads">スレッド</TabsTrigger>
            <TabsTrigger value="summary">まとめ</TabsTrigger>
            <TabsTrigger value="info">情報</TabsTrigger>
          </TabsList>
          {/* 参加しているかどうかによって表示を切り替える */}
          {!isMember ?(
            <Button onClick={handleJoinCommunity}>参加</Button>
          ):(
            <TabsContent value="posts">
            <div className="mb-4">
              <Input 
                placeholder="気軽につぶやいてみよう！" 
                value={postContent}
                onChange={(e) => setPostContet(e.target.value)}
              />
              <Button onClick={handlePostSubmit} className="m1-2">
                送信
              </Button>
            </div>
            <div className="space-y-4">
              {community.posts.map((post) => (
                <div key={post.id} className="border-b pb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>UN</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <p>{post.content}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          )}
          {/* スレッドタブ*/}
          <TabsContent value="threads">
            <p>Threads content goes here.</p>
          </TabsContent>
          {/* まとめタブ */}
          <TabsContent value="summary">
            <p>Summary content goes here.</p>
          </TabsContent>
          {/* 情報タブ */}
          <TabsContent value="info">
            <p>Community information and rules go here.</p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}