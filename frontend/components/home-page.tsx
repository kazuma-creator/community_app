'use client'
import { useEffect, useState } from 'react'
import {useRouter} from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Home, Search, Users, PlusCircle, Bell, Settings } from "lucide-react"
import { CommunitySetupModal } from './community-setup-modal'

interface Community{
  id:number;
  name:string;
  description:string;
  icon?:string;
}
interface Notification {
  community_id: number;
  community_name: string;
  content: string;
  author: string; // 修正: author プロパティを追加
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [communities,setCommunities] = useState<Community[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]); 
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [isMyCommunities,setIsMyCommunities] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [noResults,setNoResults] = useState(false);

  // コミュニティデータを取得
  const fetchCommunities = async () => {
    try{
      const response = await fetch(`${API_URL}/api/get_communities`);
      const data = await response.json();
      console.log('コミュニティデータ:',data);
      setCommunities(data);
      setNoResults(false); // コミュニティ取得時は検索結果をリセット
    }catch(error){
      // エラー処理
      console.error('コミュニティの取得に失敗しました',error);
    }
  };
  // 通知データを取得
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setNotifications(data); // 通知データを状態に保存
    } catch (error) {
      console.error('通知の取得に失敗しました', error);
    }
  };
  // APIリクエストでコミュニティを検索
  const searchCommunities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/search_communities?q=${searchTerm}`);
      const data = await response.json();
      setCommunities(data);
      
      // 検索結果が空の場合はnoResultsをtrueに設定
      if (data.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  // Enterキーで検索
  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchCommunities();  // 検索APIを呼び出す
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // 検索バーが空ならデフォルトで全てのコミュニティを取得
    if (value === '') {
      fetchCommunities();  // 空の状態でもAPIを呼び出す
    }
  };
  // 初回ロード時にコミュニティすべて取得
  useEffect(()=>{
    fetchCommunities();
  },[]);




  const fetchMyCommunities = async () => {
    try{
      const response = await fetch(`${API_URL}/api/my_communities`,{
        method:'GET',
        credentials:'include',
      });
      const data = await response.json();
      console.log('自分のコミュニティデータ:',data);
      setCommunities(data);
      setNoResults(false);// 自分のコミュニティの取得時もリセット
    }catch(error){
      console.error('自分のコミュニティの取得に失敗しました',error);
    }
  };
  

  // コミュニティがクリックされたときに詳細ページに遷移
  const handleCommunityClick =(id: number) =>{
    router.push(`/community/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <img
              alt="Logo"
              className="h-8 w-8"
              src="/placeholder.svg?height=32&width=32"
            />
            <span className="font-semibold text-lg">推し活</span>
          </div>
          <div className="flex items-center space-x-4">
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                className="w-full bg-gray-100 pl-8 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-300"
                placeholder="Search communities..."
                type="search"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleSearch}
              />
            </form>
            <CommunitySetupModal />
            <Avatar className="h-8 w-8 border-2 border-white shadow-md">
              <AvatarImage alt="User" src="/placeholder.svg?height=32&width=32" />
            </Avatar>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className={`bg-gradient-to-b from-gray-100 to-white transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} p-4`}>
          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {!isSidebarCollapsed && <span className="ml-2">Collapse</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start" 
              onClick={() => {
                fetchCommunities(); //全てのコミュニティを表示
                setIsMyCommunities(false);
              }}
            >
              <Home className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Home</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start"
              onClick={()=>{
                fetchMyCommunities(); // 自分のコミュニティを表示
                setIsMyCommunities(true);
              }}>
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">My Communities</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start"
              onClick={()=>{
                fetchNotifications()
              }}>
              <Bell className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Notifications</span>}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Settings</span>}
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Communities</h2>
          {/* 検索結果がない場合の表示 */}
          {noResults && (
            <p className="text-lg text-red-500">
              "{searchTerm}" が含まれるコミュニティは存在しません。
            </p>
          )}
           {/* 通知を表示するセクション */}
           {isNotificationsVisible && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Notifications</h2>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <p><strong>{notification.author}</strong> posted in <strong>{notification.community_name}</strong></p>
                      <p>{notification.content}</p>
                      <p className="text-xs text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No new notifications</p>
                )}
              </div>
            </div>
          )}
          {/* ここに取得したデータを表示*/}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Card 
                key={community.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleCommunityClick (community.id)} // クリックで詳細ページに遷移
                >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <img
                      alt={community.name}
                      className="rounded-lg object-cover w-16 h-16 mr-4"
                      height="64"
                      src={community.icon ? `data:image/png;base64,${community.icon}` : `/placeholder.svg?height=64&width=64text=C${community.id}`}
                      width="64"
                    />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{community.name}</h3>
                      <p className="text-sm text-gray-600">{community.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
      <footer className="border-t py-4 bg-white">
        <div className="container flex justify-between items-center px-4">
          <p className="text-sm text-gray-600">© 2023 Community App. All rights reserved.</p>
          <nav className="flex space-x-4">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}