import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  Link,
  json,
  redirect,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { ChevronRight, Plus } from "lucide-react";
import { CollapsibleMessage } from "~/components/collapsible-message";
import { SkeletonCard } from "~/components/skeleton-card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { call } from "~/genai";
import { initGraph } from "~/genai/graph";
import Layout from "~/layout";
import { cn } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const sessionId = params.chatId;
  if (typeof sessionId !== "string") {
    return redirect("/");
  }
  const graph = await initGraph();
  const chatmesssages = await graph.query(
    ` MATCH (s:Session {id: $sessionId})-[:HAS_RESPONSE]->(r:Response)
    RETURN r.input AS input, r.output AS output
    ORDER BY r.createdAt`,
    { sessionId },
    "READ"
  );
  return { chatmesssages };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const question = formData.get("question");

  const sessionId = params.chatId;
  if (typeof sessionId !== "string") {
    return redirect("/");
  }

  if (typeof question !== "string") {
    return json({ error: "Invalid question" });
  }
  const answer = await call(question, sessionId);
  console.log(answer);
  //  return { answer };
  return { sessionId };
}

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="items-center justify-center mt-20 mx-10 lg:mx-36">
        {loaderData.chatmesssages?.map((message, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold text-foreground my-2">
              {message?.input}
            </h3>
            <CollapsibleMessage
              message={message?.output}
              isLastMessage={index === loaderData.chatmesssages?.length - 1}
            />
          </div>
        ))}
        {isSubmitting && <SkeletonCard />}
        <Form method="post" className="py-10">
          <div className="relative">
            <Textarea
              placeholder="Ask a question"
              name="question"
              id="question"
              rows={1}
              tabIndex={0}
              spellCheck={false}
              required
              className="resize-none rounded-3xl w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              variant="link"
              className="absolute w-8 h-8  right-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </Form>
        <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto pointer-events-none">
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto "
            )}
            type="button"
          >
            <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
              Chat
            </span>
            <Plus className="group-hover:rotate-90 transition-all" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
