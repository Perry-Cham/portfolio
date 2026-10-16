import LoginCard from "@/components/login/login-card";
import SignUpCard from "@/components/login/sign-up-card";
import { db } from "@/lib/db";
export default async function LoginPage() {
    const result = await checkIfFirstAcc();
    return (
    <section>
        {result ? <SignUpCard /> : <LoginCard />}
    </section>);
}

async function checkIfFirstAcc() {
    const accounts = await db.user.count();

    if (accounts) {
        return true;
    } else {
        return false
    }
}