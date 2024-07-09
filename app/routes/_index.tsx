import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { SkeletonCard } from "~/components/skeleton-card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/components/ui/use-toast";
import { call } from "~/genai";
import Layout from "~/layout";
import { createSession } from "~/utils/historysession.server";
//import { generateId } from "~/utils";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const question = formData.get("question");
  const sessionId = await createSession();

  if (typeof question !== "string") {
    return json({ error: "Invalid question" });
  }
  return await call(question, sessionId)
    .then((answer) => {
      return redirect(`/chat/${sessionId}`);
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
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionData = useActionData<typeof action>();
  const [errors, setError] = useState(actionData?.error);
  const { toast } = useToast();

  return (
    <Layout>
      {isSubmitting ? (
        <div className=" items-center justify-center mt-10 mx-10 lg:mx-36">
          <SkeletonCard />
        </div>
      ) : (
        <div className=" items-center justify-center mt-40 mx-10 lg:mx-40">
          {errors &&
            toast({
              title: "Uh oh! Something went wrong. Try Again!",
              description: "There was a problem with your request.",
            })}
          <Form method="POST">
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
        </div>
      )}
    </Layout>
  );
}
