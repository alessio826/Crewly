import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Feed from "@/Pagine/Feed"
import Login from "@/Pagine/Login"
import Register from "@/Pagine/Register"
import Profile from "@/Pagine/Profile"
import CreatePost from "@/Pagine/CreatePost"
import Search from "@/Pagine/Search"
import PostDetail from "@/Pagine/PostDetail"
import EditProfile from "@/Pagine/EditProfile"
import Benvenuto from "@/Pagine/Benvenuto"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Benvenuto />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/search" element={<Search />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
