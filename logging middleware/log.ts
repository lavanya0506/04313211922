export async function log(stack: string, level: string, pkg: string, message: string) {
  const url = 'http://20.244.56.144/evaluation-service/logs';

  const body = {
    stack: stack.toLowerCase(),
    level: level.toLowerCase(),
    package: pkg.toLowerCase(),
    message,
  };

  const authbody ={
    "email": "karanpreetsinghgandhi@gmail.com",
    "name": "karanpreet singh",
    "rollNo": "05313211922",
    "accessCode": "VPpsmT",
    "clientID": "57ebd4b4-5663-4a02-a8b2-1423832c3715",
    "clientSecret": "uYMdYPhMwvTGenAW"
}
   

 
  try {
     const res= await fetch("http://20.244.56.144/evaluation-service/auth",{
        method: "POST",
        body: JSON.stringify(authbody)
    
    })
    const logdata = await res.json();
   
    const token= logdata.access_token;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "token_type":"bearer",
        'Authorization': `Bearer ${token}`
         
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Log response:', data);
  } catch (err) {
    console.error('Logging failed:', err);
  }
}


log("backend", "error", "handler", "received string, expected bool");
