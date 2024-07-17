import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { ChevronRight, History, SkipForward } from "lucide-react";
import { Link } from "@remix-run/react";

import moment from "moment";
export function HistoryPanel({ messageHistory }: { messageHistory: any }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <ChevronRight />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-1 text-sm">
            <History className="size-4" />
            History
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 my-10">
          {messageHistory?.map((message: any) => (
            <Link to={`/chat/${message?.sessionId}`} key={message?.sessionId}>
              <div className="flex items-center space-x-2 hover:bg-muted p-2 rounded-md">
                <div>
                  <SkipForward className="size-5 stroke-green-800" />
                </div>
                <div>
                  <div>
                    <p className="text-foreground text-sm line-clamp-1">
                      {message?.input}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {moment(message?.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
