import { redirect } from "next/navigation";

// Old links to /register land on the sign-in page with the sign-up form showing.
export default function Page() {
  redirect("/sign-in?title=Create+a+free+VIRS+account&view=register");
}
