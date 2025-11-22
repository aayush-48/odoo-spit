import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatBot from '@/components/chatbot/ChatBot';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <ChatBot />
    </div>
  );
};

export default MainLayout;
