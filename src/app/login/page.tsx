import { db } from "@/lib/db";
export default function LoginPage(){
    return(<section>
        {checkIfFirstAcc() ? }
        
        </section>);
}

async function checkIfFirstAcc(){
const accounts = await db.user.count();

if(accounts){
    return true;
}else{
    return false
}
}