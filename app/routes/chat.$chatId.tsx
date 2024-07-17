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
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { CollapsibleMessage } from "~/components/collapsible-message";
import { SkeletonCard } from "~/components/skeleton-card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { call } from "~/genai";
import { initGraph } from "~/genai/graph";
import Layout from "~/layout";
import { getSession } from "~/utils/authsession.server";
import { getHistoryMessages, getUser } from "~/utils/historysession.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const sessionId = params.chatId;
  if (typeof sessionId !== "string") {
    return redirect("/");
  }
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  let user = null;
  if (userId) {
    user = await getUser(userId);
  }
  let messageHistory = null;
  if (userId) {
    messageHistory = await getHistoryMessages(userId);
  }
  const graph = await initGraph();
  const chatmesssages = await graph.query(
    ` MATCH (s:Session {id: $sessionId})-[:HAS_RESPONSE]->(r:Response)
    RETURN r.input AS input, r.output AS output
    ORDER BY r.createdAt`,
    { sessionId },
    "READ"
  );
  return { chatmesssages, userId, user, messageHistory };
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
  return await call(question, sessionId)
    .then((answer) => {
      return null;
    })
    .catch((error) => {
      return { error: error };
    });
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
  const actionData = useActionData<typeof action>();
  const [errors, setError] = useState({ error: null });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Trigger form submission
      submitRef.current?.click();
    }
  };
  useEffect(() => {
    if (isSubmitting) {
      formRef.current?.reset();
    }
    if (actionData?.error) {
      setError({
        error: actionData.error,
      });
    }
  }, [isSubmitting, actionData]);

  return (
    <Layout
      userId={loaderData.userId}
      user={{
        name: loaderData.user?.name as string,
        avatar: loaderData.user?.avatar as string,
      }}
      messageHistory={loaderData.messageHistory}
    >
      <div className="items-center justify-center mt-20 mx-10 lg:mx-36">
        {errors?.error &&
          toast({
            title: "Uh oh! Something went wrong. Try Again!",
            description: "There was a problem with your request.",
          })}
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
        <Form method="post" className="py-10" ref={formRef}>
          <div className="relative">
            <Textarea
              placeholder="Ask a question"
              name="question"
              id="question"
              rows={1}
              tabIndex={0}
              spellCheck={false}
              onKeyDown={handleKeyDown}
              required
              className="resize-none rounded-3xl w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-10 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              variant="link"
              ref={submitRef}
              className="absolute w-8 h-8  right-2 top-1/2 -translate-y-1/2"
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </Form>
      </div>
    </Layout>
  );
}
