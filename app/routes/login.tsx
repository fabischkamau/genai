import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useGoogleLogin } from "@react-oauth/google";
import Layout from "~/layout";
import axios from "axios";
import { redirect, useFetcher } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { createUser } from "~/utils/historysession.server";
import { commitSession, getSession } from "~/utils/authsession.server";
import { LoaderCircle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (userId) {
    return redirect("/");
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { email, name, avatar } = Object.fromEntries(formData);
  const session = await getSession(request.headers.get("Cookie"));

  if (typeof email !== "string" || email.length === 0) {
    return json({ error: "Email is required" }, { status: 400 });
  }
  if (typeof name !== "string" || name.length === 0) {
    return json({ error: "Name is required" }, { status: 400 });
  }

  return await createUser(email, name, avatar as string )
    .then(async (email) => {
      session.set("userId", email);
      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    })
    .catch((error) => {
      return json({ error: error.message }, { status: 500 });
    });
}

export default function login() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",

          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        console.log(res.data);
        const formData = new FormData();
        formData.append("name", res.data.name);
        formData.append("email", res.data.email);
        formData.append("avatar", res.data.picture);

        fetcher.submit(formData, { method: "POST" });
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Layout>
      <div className="mt-40 w-full flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => login()}
              variant="outline"
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Loading
                </div>
              ) : (
                "Login with Google"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
