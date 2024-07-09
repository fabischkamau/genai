import { Skeleton } from "./ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-8 w-full  rounded-xl " />
      <div className="space-y-2">
        <Skeleton className="h-[400px] w-full " />
      </div>
    </div>
  );
}
