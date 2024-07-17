import { Form, Link } from "@remix-run/react";

import { Button, buttonVariants } from "./ui/button";
import { cn } from "~/lib/utils";
import vitamins from "../images/vitamins.png";
import DropDownMenu, { User } from "./dropdown-menu";
export default function Navbar({ userId, user }: { userId?: string, user?:User }) {
  return (
    <div className="sticky top-0 z-20 bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={vitamins} className="h-8 w-8" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Link to="/" className={buttonVariants({ variant: "outline" })}>
              New Chat
            </Link>
          </div>
          <div>
            {userId ? (
              <DropDownMenu user={user} />
            ) : (
              <Link
                to="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" })
                )}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
