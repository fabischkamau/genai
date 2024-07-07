
import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";
import { BotMessage } from "./messages";

interface CollapsibleMessageProps {
  message: string;
  isLastMessage?: boolean;
}

export const CollapsibleMessage: React.FC<CollapsibleMessageProps> = ({
  message,
  isLastMessage = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [open, setOpen] = useState(isLastMessage);

  useEffect(() => {
    setOpen(isLastMessage);
    console.log(localStorage.getItem("sessionId"));
  }, [isCollapsed, isLastMessage]);

  return (
    <Collapsible
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
      }}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "w-full flex justify-end",
            !isCollapsed ? "hidden" : ""
          )}
        >
          <Button
            variant="ghost"
            size={"icon"}
            className={cn("-mt-3 rounded-full")}
          >
            <ChevronDown
              size={14}
              className={cn(
                open ? "rotate-180" : "rotate-0",
                "h-4 w-4 transition-all"
              )}
            />
            <span className="sr-only">collapse</span>
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <BotMessage content={message} />
      </CollapsibleContent>
      {!open && <Separator className="my-2 bg-muted" />}
    </Collapsible>
  );
};
