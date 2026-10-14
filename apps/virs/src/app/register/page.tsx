import { redirect } from "next/navigation";

// Registration is a pop-up opened from the account menu. Old links to /register land on Home with
// the pop-up open.
export default function Page() {
  redirect("/dashboard?register=1");
}
