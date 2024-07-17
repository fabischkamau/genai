import { User } from "~/components/dropdown-menu";
import { HistoryPanel } from "~/components/historypanel";
import Navbar from "~/components/navbar";
import { Toaster } from "~/components/ui/toaster";

export default function Layout({
  userId,
  user,
  messageHistory,
  children,
}: {
  userId?: string;
  user?: User;
  messageHistory?: any;
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh md:h-lvh relative">
      <Navbar user={user} userId={userId} />
      {userId && messageHistory && (
        <HistoryPanel messageHistory={messageHistory} />
      )}
      {children}
      <Toaster />
    </div>
  );
}
