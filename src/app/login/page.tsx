import LoginCard from "@/components/login/login-card";
import SignUpCard from "@/components/login/sign-up-card";
import { db } from "@/lib/db";
export default async function LoginPage() {
    const result = await checkIfFirstAcc();
    return (
    <section>
        {result ?<LoginCard />  : <SignUpCard />};
    </section>);
}

async function checkIfFirstAcc() {
    const accounts = await db.user.count();
    console.log(accounts)

    if (accounts) {
        return true;
    } else {
        return false
    }
}