import Navbar from "~/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh md:h-lvh relative">
      <Navbar />
      {children}
    </div>
  );
}
