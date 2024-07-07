import { Ellipsis } from "lucide-react";
import { Link } from "@remix-run/react";

import { buttonVariants } from "./ui/button";
import { cn } from "~/lib/utils";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Ellipsis className="h-6 w-6" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Link
              to="/login"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
