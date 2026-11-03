
/*const data = {
    github: process.env.GITHUB,
    email: process.env.EMAIL,
    phone: process.env.PHONE
} */

function checkENVs(data: Record<string, string | undefined>) {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === "") {
      errors.push(key); 
    }
  }

  if (errors.length > 0) {
    throw new Error(`Missing environment variables: ${errors.join(", ")}`);
  }
}