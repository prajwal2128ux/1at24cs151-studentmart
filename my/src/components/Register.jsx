import { useState } from "react";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {

        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5002/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );
            const data = await response.json();
            setMessage(data.message);
        }
        catch (error) {

            console.error(error);
            setMessage("Something went wrong");
        }
    };

    return (
       <div>
            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>

                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                    />

                </div>
                <button type="submit">
                    Register
                </button>
            </form>

            {message && (
                <p>{message}</p>
            )}
        </div>
    );
}
export default Register;


