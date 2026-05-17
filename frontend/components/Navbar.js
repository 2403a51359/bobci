import Link from 'next/link'
import { Bot, Activity } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-dark-card border-b border-dark-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Bot className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              BobCI
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/setup" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Setup
            </Link>
            
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <Activity className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="text-sm text-green-500 font-medium">IBM Bob Active</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Made with Bob
